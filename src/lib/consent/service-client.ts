import "server-only";

import { createHmac } from "crypto";
import type { LegalService } from "@/lib/legal";
import { resolveServiceEndpoint } from "./services";

// 各サービスの同意 API を叩くクライアント。
// 契約は docs/precontract-api-contract.md を参照。
//
// soular 側は結果を保持しない。submissionId を cookie に載せて次の画面へ渡すだけで、
// 申込者の氏名・メール・電話は通過するのみ（保存も転記もしない）。

const TIMEOUT_MS = 15_000;

/** 署名対象は "<timestamp>.<生のボディ>"。パース後の値ではなく送るバイト列そのものに署名する。 */
function sign(secret: string, timestamp: string, rawBody: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
}

type CallResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; data: unknown }
  | { ok: false; status: 0; data: null; networkError: true };

async function call<T>(
  service: LegalService,
  path: string,
  payload: unknown,
): Promise<CallResult<T> | null> {
  const endpoint = resolveServiceEndpoint(service);
  if (!endpoint) return null;

  const rawBody = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  try {
    const res = await fetch(`${endpoint.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Soular-Timestamp": timestamp,
        "X-Soular-Signature": `sha256=${sign(endpoint.secret, timestamp, rawBody)}`,
      },
      body: rawBody,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      // ボディはログに残さない（申込者の個人情報が含まれうるため）。
      console.error("[precontract] service API returned error", {
        service,
        path,
        status: res.status,
      });
      return { ok: false, status: res.status, data };
    }
    return { ok: true, status: res.status, data: data as T };
  } catch (error) {
    console.error("[precontract] service API call failed", {
      service,
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, status: 0, data: null, networkError: true };
  }
}

// --- 型 -------------------------------------------------------------------

export type ConsentApplicant = {
  clinicName: string;
  applicantName: string;
  applicantKana: string;
  roleTitle: string;
  email: string;
  phone: string;
  salesRep: string;
  servicePlan: string;
  scheduledContractDate: string;
  note: string;
  preferredContact: string;
};

export type CreateConsentInput = {
  service: LegalService;
  contractPlan: string;
  applicant: ConsentApplicant;
  consent: {
    agreedTerms: boolean;
    agreedPrivacy: boolean;
    agreedImportant: boolean;
    selfInputConfirmed: boolean;
    checklist: Record<string, boolean>;
  };
  documents: {
    termsVersion: string;
    privacyVersion: string;
    importantVersion: string;
    /** 顧客に実際に提示した重説の本文。サービス側はこれを保存し、ハッシュを再計算して検証する。 */
    importantText: string;
    importantHash: string;
  };
  client: { ip: string; userAgent: string };
};

export type CreateConsentResult =
  | { kind: "created"; submissionId: string }
  | { kind: "rate_limited"; retryAfterSeconds: number }
  | { kind: "validation_failed"; fields: Record<string, string> }
  | { kind: "unavailable" };

export type VerifyStatus =
  | "ok"
  | "already_used"
  | "invalid"
  | "expired"
  | "locked"
  | "no_otp"
  | "not_found"
  | "unavailable";

export type ConsentStatus = {
  service: LegalService;
  status: "pending" | "verified";
  /** マスク済みメール（例 ta***@example.com）。soular は素のアドレスを受け取らない。 */
  emailMasked: string;
};

// --- 呼び出し -------------------------------------------------------------

export async function createConsent(input: CreateConsentInput): Promise<CreateConsentResult> {
  const res = await call<{ submissionId: string }>(input.service, "/api/consents", input);
  if (!res) return { kind: "unavailable" };

  if (res.ok && res.data?.submissionId) {
    return { kind: "created", submissionId: res.data.submissionId };
  }

  const body = res.data as { error?: string; retryAfterSeconds?: number; fields?: Record<string, string> } | null;
  if (res.status === 429) {
    return { kind: "rate_limited", retryAfterSeconds: body?.retryAfterSeconds ?? 60 };
  }
  if (res.status === 400 && body?.fields) {
    return { kind: "validation_failed", fields: body.fields };
  }
  return { kind: "unavailable" };
}

export async function verifyConsent(params: {
  service: LegalService;
  submissionId: string;
  code: string;
  ip: string;
}): Promise<VerifyStatus> {
  const { service, submissionId, code, ip } = params;
  const res = await call<{ status: VerifyStatus }>(service, "/api/consents/verify", {
    submissionId,
    code,
    client: { ip },
  });
  if (!res) return "unavailable";
  if (res.ok && res.data?.status) return res.data.status;
  const body = res.data as { status?: VerifyStatus } | null;
  return body?.status ?? "unavailable";
}

export type ResendResult =
  | { kind: "sent" }
  | { kind: "rate_limited"; retryAfterSeconds: number }
  | { kind: "unavailable" };

export async function resendConsentOtp(params: {
  service: LegalService;
  submissionId: string;
  ip: string;
}): Promise<ResendResult> {
  const { service, submissionId, ip } = params;
  const res = await call<{ status: string }>(service, "/api/consents/resend", {
    submissionId,
    client: { ip },
  });
  if (!res) return { kind: "unavailable" };
  if (res.ok && res.data?.status === "sent") return { kind: "sent" };
  const body = res.data as { retryAfterSeconds?: number } | null;
  if (res.status === 429) {
    return { kind: "rate_limited", retryAfterSeconds: body?.retryAfterSeconds ?? 60 };
  }
  return { kind: "unavailable" };
}

/** 確認画面の描画に必要な最小情報だけを取る（マスク済みメールと状態）。 */
export async function fetchConsentStatus(params: {
  service: LegalService;
  submissionId: string;
}): Promise<ConsentStatus | null> {
  const res = await call<ConsentStatus>(params.service, "/api/consents/status", {
    submissionId: params.submissionId,
  });
  if (!res || !res.ok) return null;
  return res.data ?? null;
}
