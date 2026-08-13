"use server";

import { cookies, headers } from "next/headers";
import { getClientIp } from "@/lib/security/ip";
import { CONSENT_SID_COOKIE, isValidSubmissionId } from "@/lib/consent/cookie";
import { resendConsentOtp, verifyConsent, type VerifyStatus } from "@/lib/consent/service-client";
import { isLegalService, type LegalService } from "@/lib/legal";

// 検証も再送も、実体は対象サービスの API が行う。
// soular 側は cookie の submissionId を渡して結果を受け取るだけで、
// OTP そのものも申込者の情報も保持しない。

export type ConsentVerifyState = {
  phase: "sent" | "verified";
  error?: string;
  notice?: string;
  retryAfterSeconds?: number;
};

async function getContext(
  formData: FormData,
): Promise<{ sid: string; service: LegalService; ip: string } | null> {
  const store = await cookies();
  const sid = store.get(CONSENT_SID_COOKIE)?.value;
  if (!isValidSubmissionId(sid)) return null;

  const service = String(formData.get("service") ?? "");
  if (!isLegalService(service)) return null;

  return { sid, service, ip: getClientIp(await headers()) };
}

const SESSION_EXPIRED = "セッションが切れました。お手数ですが最初からやり直してください。";

export async function resendConsentOtpAction(
  _prev: ConsentVerifyState,
  formData: FormData,
): Promise<ConsentVerifyState> {
  const ctx = await getContext(formData);
  if (!ctx) return { phase: "sent", error: SESSION_EXPIRED };

  const result = await resendConsentOtp({
    service: ctx.service,
    submissionId: ctx.sid,
    ip: ctx.ip,
  });

  if (result.kind === "sent") {
    return {
      phase: "sent",
      notice: "確認コードを再送しました。メール（迷惑メールフォルダも）をご確認ください。",
    };
  }
  if (result.kind === "rate_limited") {
    return {
      phase: "sent",
      error: `送信の間隔が短すぎます。${result.retryAfterSeconds} 秒後に再度お試しください。`,
      retryAfterSeconds: result.retryAfterSeconds,
    };
  }
  return { phase: "sent", error: "コードの送信に失敗しました。時間をおいて再度お試しください。" };
}

const VERIFY_MESSAGES: Record<VerifyStatus, string> = {
  ok: "",
  already_used: "",
  invalid: "コードが正しくありません。もう一度入力してください。",
  expired: "コードの有効期限が切れました。コードを再送信してください。",
  locked: "試行回数の上限に達しました。コードを再送信してください。",
  no_otp: "有効なコードがありません。コードを再送信してください。",
  not_found: "申込情報が見つかりませんでした。最初からやり直してください。",
  unavailable: "確認に失敗しました。時間をおいて再度お試しください。",
};

export async function verifyConsentOtpAction(
  _prev: ConsentVerifyState,
  formData: FormData,
): Promise<ConsentVerifyState> {
  const ctx = await getContext(formData);
  if (!ctx) return { phase: "sent", error: SESSION_EXPIRED };

  const code = String(formData.get("code") ?? "").trim();
  const status = await verifyConsent({
    service: ctx.service,
    submissionId: ctx.sid,
    code,
    ip: ctx.ip,
  });

  if (status === "ok" || status === "already_used") {
    // 注意: ここで sid cookie を削除してはいけない。
    // Server Action 完了後に App Router が verify ページを再レンダリングするため、
    // cookie を消すと page.tsx のガード (sid 無し → /precontract へ redirect) が発火し、
    // 完了画面ではなくフォームに戻ってしまう。cookie は maxAge(30分) で自然失効させる。
    return { phase: "verified" };
  }
  return { phase: "sent", error: VERIFY_MESSAGES[status] };
}
