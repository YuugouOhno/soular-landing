import "server-only";

// 事前確認の submission id を確認画面へ引き継ぐための一時 cookie。
// UUID は推測困難 + httpOnly なので URL に出さずに済む。確認完了で破棄する。
export const CONSENT_SID_COOKIE = "precontract_sid";

const COOKIE_TTL_SECONDS = 30 * 60; // 30分 (OTP 有効期限 + 余裕)

export function consentSidCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    // 事前確認フロー内でのみ読めれば十分。スコープを絞る多層防御。
    path: "/precontract",
    maxAge: COOKIE_TTL_SECONDS,
  };
}

// cookie は改竄されうる前提で、DB へ渡す前に UUID 形式を検証する。
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidSubmissionId(value: string | undefined | null): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}
