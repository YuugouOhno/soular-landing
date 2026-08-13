import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getOptionalEnv } from "@/lib/env";

// 公開フォーム (/precontract/*) を共有パスワードで保護する「雑なゲート」。
// ボットによるドライブバイ送信・メール爆撃の踏み台化を防ぐのが目的。
// 認証ではなく営業現場の合言葉レベル (漏れたら更新する運用)。
// 合言葉はデンタル/メディ共通 (1本)。

export const PRECONTRACT_GATE_COOKIE = "precontract_gate";

const GATE_TTL_SECONDS = 24 * 60 * 60; // 24時間
const GATE_TOKEN_MESSAGE = "precontract-gate-v1";

// 合言葉。env 優先。未設定なら開発のみフォールバック、本番は null = 受付停止 (fail-closed)。
function getGatePassword(): string | null {
  const v = getOptionalEnv("PRECONTRACT_ACCESS_PASSWORD");
  if (v) return v;
  if (process.env.NODE_ENV !== "production") return "soular";
  return null;
}

// 本番で合言葉が未設定なら受付停止状態 (誰も通れない)。
export function isGateConfigured(): boolean {
  return getGatePassword() !== null;
}

// cookie に入れる検証トークン。合言葉を鍵にした HMAC なので、合言葉を変えれば
// 既存 cookie は自動的に無効化される (別途秘密鍵を増やさない雑実装)。
function computeGateToken(password: string): string {
  return createHmac("sha256", password).update(GATE_TOKEN_MESSAGE).digest("base64url");
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function isGateUnlocked(): Promise<boolean> {
  const password = getGatePassword();
  if (!password) return false;
  const store = await cookies();
  const token = store.get(PRECONTRACT_GATE_COOKIE)?.value;
  if (!token) return false;
  return timingSafeEqualStr(token, computeGateToken(password));
}

export type GateUnlockResult = "ok" | "wrong" | "not_configured";

// 入力された合言葉を検証し、一致したら通過 cookie を発行する。
export async function unlockGate(input: string): Promise<GateUnlockResult> {
  const password = getGatePassword();
  if (!password) return "not_configured";
  if (!timingSafeEqualStr(input, password)) return "wrong";

  const isProd = process.env.NODE_ENV === "production";
  const store = await cookies();
  store.set(PRECONTRACT_GATE_COOKIE, computeGateToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/precontract",
    maxAge: GATE_TTL_SECONDS,
  });
  return "ok";
}
