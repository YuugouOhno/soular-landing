// 問い合わせフォームの入力検証・整形。
// 移行前の Cloudflare Worker (worker/index.ts) のロジックをそのまま移設している。
// honeypot / レート制限 / エスケープ / 長さ上限は防御の要なので削らないこと。

export const MAX_LEN = 5000;

/** 通知先（3サイト共通）。 */
export const CONTACT_TO = "s-hamada@soular-inc.com";

/** 入力を必ず文字列にし trim する。非文字列(数値/配列等)が来ても安全側に倒す。 */
export function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** 件名に入る値の改行・制御文字を除去し切り詰める（ヘッダーインジェクション対策）。 */
export function subjectSafe(v: string): string {
  return v.replace(/[\r\n]+/g, " ").slice(0, 120);
}

export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type ContactInput = {
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type ContactParseResult =
  | { ok: true; data: ContactInput }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseContactInput(body: Record<string, unknown>): ContactParseResult {
  const company = str(body.company);
  const name = str(body.name);
  const email = str(body.email);
  const phone = str(body.phone);
  const message = str(body.message);

  if (!name || !email || !message) return { ok: false, error: "missing required fields" };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "invalid email" };
  if (company.length > 200 || name.length > 100 || phone.length > 50 || message.length > MAX_LEN) {
    return { ok: false, error: "field too long" };
  }

  return { ok: true, data: { company, name, email, phone, message } };
}

export function buildContactHtml(input: ContactInput): string {
  return `
<table style="font-family:sans-serif;font-size:14px;line-height:1.8;color:#0a1330;max-width:600px;margin:0 auto;border-collapse:collapse">
  <tr><td colspan="2" style="padding:20px 0 12px;border-bottom:2px solid #1f6dff">
    <strong style="font-size:16px">【soular お問い合わせ】</strong>
  </td></tr>
  <tr><td style="padding:10px 16px 10px 0;white-space:nowrap;color:#4e5a7e;vertical-align:top">会社・お名前など</td><td style="padding:10px 0">${esc(input.company) || "—"}</td></tr>
  <tr><td style="padding:10px 16px 10px 0;white-space:nowrap;color:#4e5a7e;vertical-align:top">お名前</td><td style="padding:10px 0">${esc(input.name)}</td></tr>
  <tr><td style="padding:10px 16px 10px 0;white-space:nowrap;color:#4e5a7e;vertical-align:top">メール</td><td style="padding:10px 0"><a href="mailto:${esc(input.email)}">${esc(input.email)}</a></td></tr>
  <tr><td style="padding:10px 16px 10px 0;white-space:nowrap;color:#4e5a7e;vertical-align:top">電話番号</td><td style="padding:10px 0">${esc(input.phone) || "—"}</td></tr>
  <tr><td style="padding:10px 16px 10px 0;white-space:nowrap;color:#4e5a7e;vertical-align:top">お問い合わせ内容</td><td style="padding:10px 0;white-space:pre-wrap">${esc(input.message)}</td></tr>
</table>
`.trim();
}

// --- 軽量レート制限 -------------------------------------------------------
// best-effort。Worker のときは isolate ごと、Vercel では実行インスタンスごとの
// メモリなので厳密ではない（インスタンスが増えるぶん Worker より緩くなる）。
// 主防御は honeypot である、という前提は移行前後で変わらない。
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

export function isRateLimited(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // 直近アクセスの無い他IPの空エントリを掃除（メモリ肥大の抑制）。
  for (const [k, v] of hits) {
    if (v.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(k);
  }
  return recent.length > RATE_LIMIT_MAX;
}
