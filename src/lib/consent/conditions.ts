import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getOptionalEnv } from "@/lib/env";
import { isContractPlan, type ContractPlan } from "@/lib/legal/plan";
import { isLegalService, type LegalService } from "@/lib/legal";
import { gateTokenFingerprint } from "./gate";

// スタート画面 (/precontract) で営業が確定させた「申込条件」を持ち回る層。
//
// 設計の要点（security-reviewer のレビュー結果を反映）:
//
//  1. **金額の真実の源泉は常にこの cookie**。フォームの hidden input は信用しない。
//     信用すると顧客が DevTools で value を書き換えるだけで契約金額を改竄できる。
//  2. **合言葉とは別の専用鍵**を使う。合言葉は営業間で口頭共有される低エントロピーの
//     文字列で、それを金額の改竄耐性に流用してはいけない。
//  3. **exp をペイロードに埋めてサーバー側で検証**する。cookie の maxAge だけに頼ると、
//     値をコピーして別ブラウザに貼れば実質無期限に使える。
//  4. **ゲート cookie と連鎖**させる。合言葉を変えたら条件 cookie も無効になる。
//  5. 有効期限は商談1回分（120分）。ゲートの 24 時間とは別物として扱う。

export const CONSENT_CONDITIONS_COOKIE = "precontract_conditions";

const TTL_SECONDS = 120 * 60; // 商談1回分
const VERSION = "v1";

export type ApplyConditions = {
  service: LegalService;
  plan: ContractPlan;
  /** 導入時の初期費用（円・税別）。0 は「無料」。 */
  initialFeeYen: number;
  /** 月額利用料（円・税別）。 */
  monthlyFeeYen: number;
  /** 条件を確定した時刻（unix 秒）。監査上「いつこの金額で合意したか」を示す。 */
  issuedAt: number;
};

function getSecret(): string | null {
  // 本番で未設定なら条件を発行も検証もしない（fail-closed）。
  return getOptionalEnv("PRECONTRACT_CONDITIONS_SECRET") ?? null;
}

// JSON.stringify はキー順序に依存して壊れやすいので、明示的に区切った正規形に署名する。
function canonical(c: ApplyConditions, exp: number, nonce: string, gateFp: string): string {
  return [
    VERSION,
    c.service,
    c.plan,
    String(c.initialFeeYen),
    String(c.monthlyFeeYen),
    String(c.issuedAt),
    String(exp),
    nonce,
    gateFp,
  ].join(".");
}

function sign(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// --- 金額の検証 -----------------------------------------------------------
// 営業が入力する値だが、実行時にはブラウザ経由で届く未信頼入力として扱う。
const AMOUNT_RE = /^\d{1,9}$/;
const MAX_AMOUNT_YEN = 100_000_000; // 1億円。明らかな異常値を弾く

export function parseAmountYen(raw: unknown): number | null {
  const s = typeof raw === "string" ? raw.trim() : "";
  // 先頭ゼロ・カンマ・全角数字・指数表記・小数を拒否する。
  if (!AMOUNT_RE.test(s)) return null;
  if (s.length > 1 && s.startsWith("0")) return null;
  const n = Number(s);
  if (!Number.isSafeInteger(n) || n < 0 || n > MAX_AMOUNT_YEN) return null;
  return n;
}

// --- 発行 / 検証 ----------------------------------------------------------

export async function issueConditions(c: ApplyConditions): Promise<boolean> {
  const secret = getSecret();
  if (!secret) {
    console.error("[precontract] PRECONTRACT_CONDITIONS_SECRET not configured");
    return false;
  }
  const gateFp = await gateTokenFingerprint();
  if (!gateFp) return false;

  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const nonce = randomBytes(9).toString("base64url");
  const payload = canonical(c, exp, nonce, gateFp);
  const value = `${Buffer.from(payload).toString("base64url")}.${sign(secret, payload)}`;

  const store = await cookies();
  store.set(CONSENT_CONDITIONS_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/precontract",
    maxAge: TTL_SECONDS,
  });
  return true;
}

/**
 * 条件を取り出す。以下のいずれかを満たさなければ null を返す。
 *   - 専用鍵が未設定 / cookie が無い / 形式が不正
 *   - 署名不一致（＝改竄）
 *   - 有効期限切れ（サーバー側で判定する）
 *   - ゲート cookie が無い、または合言葉が変わって別物になっている
 */
export async function readConditions(): Promise<ApplyConditions | null> {
  const secret = getSecret();
  if (!secret) return null;

  const store = await cookies();
  const raw = store.get(CONSENT_CONDITIONS_COOKIE)?.value;
  if (!raw) return null;

  const [encoded, signature] = raw.split(".");
  if (!encoded || !signature) return null;

  let payload: string;
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }
  if (!safeEqual(sign(secret, payload), signature)) return null;

  const parts = payload.split(".");
  if (parts.length !== 9) return null;
  const [version, service, plan, initial, monthly, issuedAt, exp, , gateFp] = parts;
  if (version !== VERSION) return null;
  if (!isLegalService(service) || !isContractPlan(plan)) return null;

  // 期限はサーバー側で必ず見る（cookie の maxAge 任せにしない）。
  const expSec = Number(exp);
  if (!Number.isSafeInteger(expSec) || expSec * 1000 < Date.now()) return null;

  // 合言葉が変わっていたらゲート指紋が変わり、条件も連鎖して無効になる。
  const currentGateFp = await gateTokenFingerprint();
  if (!currentGateFp || !safeEqual(currentGateFp, gateFp)) return null;

  const initialFeeYen = Number(initial);
  const monthlyFeeYen = Number(monthly);
  const issued = Number(issuedAt);
  if (
    !Number.isSafeInteger(initialFeeYen) ||
    !Number.isSafeInteger(monthlyFeeYen) ||
    !Number.isSafeInteger(issued) ||
    initialFeeYen < 0 ||
    monthlyFeeYen < 0 ||
    initialFeeYen > MAX_AMOUNT_YEN ||
    monthlyFeeYen > MAX_AMOUNT_YEN
  ) {
    return null;
  }

  return { service, plan, initialFeeYen, monthlyFeeYen, issuedAt: issued };
}

export async function clearConditions(): Promise<void> {
  const store = await cookies();
  store.delete(CONSENT_CONDITIONS_COOKIE);
}

/** 条件が変わったら React ツリーを作り直すための指紋（チェック状態の持ち越し防止）。 */
export function conditionsFingerprint(c: ApplyConditions): string {
  return `${c.service}.${c.plan}.${c.initialFeeYen}.${c.monthlyFeeYen}.${c.issuedAt}`;
}
