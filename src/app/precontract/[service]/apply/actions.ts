"use server";

import { createHash } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getClientIp } from "@/lib/security/ip";
import { isGateUnlocked } from "@/lib/consent/gate";
import { clearConditions, readConditions } from "@/lib/consent/conditions";
import { isSubmitLimited } from "@/lib/consent/rate-limit";
import { CONSENT_SID_COOKIE, consentSidCookieOptions } from "@/lib/consent/cookie";
import { consentFormSchema, FEE_AGREEMENT_KEY, importantChecklistFor } from "@/lib/consent/schema";
import { createConsent } from "@/lib/consent/service-client";
import { legalDocText, policyVersionsFor, resolveLegalDoc } from "@/lib/legal";

export type ConsentFormState = {
  formError?: string;
  errors?: Record<string, string>;
};

export async function submitConsentAction(
  _prev: ConsentFormState,
  formData: FormData,
): Promise<ConsentFormState> {
  // ゲート通過をページ表示だけでなく POST でも必須化する
  // (ボットはページを介さず直接 Server Action を叩きうるため)。
  if (!(await isGateUnlocked())) {
    return {
      formError:
        "セッションの有効期限が切れました。お手数ですがページを再読み込みし、合言葉を再入力してください。",
    };
  }

  // 契約条件（サービス・プラン・金額）は **署名付き cookie からのみ** 読む。
  // フォームの hidden input を信用すると、DevTools で value を書き換えるだけで
  // 契約金額を改竄できてしまう（security-reviewer の最重要指摘）。
  const conditions = await readConditions();
  if (!conditions) {
    return {
      formError:
        "お申し込み条件の有効期限が切れました。お手数ですが最初の画面からやり直してください。",
    };
  }
  const service = conditions.service;
  const plan = conditions.plan;
  const fees = {
    initialFeeYen: conditions.initialFeeYen,
    monthlyFeeYen: conditions.monthlyFeeYen,
  };

  // 申込者情報はフォームから受け取る（条件と違い改竄されても本人が困るだけの値）。
  // service / contractPlan は cookie 由来の値で上書きし、送信値は採用しない。
  const raw = {
    ...(Object.fromEntries(formData.entries()) as Record<string, unknown>),
    service,
    contractPlan: plan,
  };
  const parsed = consentFormSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { errors };
  }

  const h = await headers();
  const ip = getClientIp(h);
  if (isSubmitLimited(ip)) {
    return { formError: "送信が多すぎます。しばらく時間をおいてから再度お試しください。" };
  }

  // 顧客に実際に提示した重説の本文を組み立てて丸ごと送る。
  // サービス側は文面を持たず、受け取った本文を保存し、ハッシュを再計算して検証する。
  const versions = policyVersionsFor(service);
  const importantDoc = resolveLegalDoc(service, "important", plan, fees);
  const importantText = legalDocText(versions.important, importantDoc);
  const importantHash = createHash("sha256").update(importantText, "utf8").digest("hex");

  // 個別チェックを正規化（全 true で到達している前提）。料金同意も証跡に含める。
  const checklist: Record<string, boolean> = {};
  for (const item of importantChecklistFor(plan, fees, service)) checklist[item.key] = true;
  checklist[FEE_AGREEMENT_KEY] = true;

  const d = parsed.data;
  const result = await createConsent({
    service,
    contractPlan: plan,
    applicant: {
      clinicName: d.clinicName,
      applicantName: d.applicantName,
      applicantKana: d.applicantKana,
      roleTitle: d.roleTitle,
      email: d.email,
      phone: d.phone,
      salesRep: d.salesRep,
      servicePlan: d.servicePlan,
      scheduledContractDate: d.scheduledContractDate,
      note: d.note,
      preferredContact: d.preferredContact,
    },
    consent: {
      agreedTerms: true,
      agreedPrivacy: true,
      agreedImportant: true,
      selfInputConfirmed: true,
      checklist,
    },
    fees: {
      initialFeeYen: conditions.initialFeeYen,
      monthlyFeeYen: conditions.monthlyFeeYen,
      agreedAt: conditions.issuedAt,
    },
    documents: {
      termsVersion: versions.terms,
      privacyVersion: versions.privacy,
      importantVersion: versions.important,
      importantText,
      importantHash,
    },
    client: { ip, userAgent: (h.get("user-agent") ?? "").slice(0, 500) },
  });

  if (result.kind === "rate_limited") {
    return {
      formError: `送信の間隔が短すぎます。${result.retryAfterSeconds} 秒後に再度お試しください。`,
    };
  }
  if (result.kind === "validation_failed") {
    return { errors: result.fields };
  }
  if (result.kind !== "created") {
    return {
      formError: "送信に失敗しました。時間をおいて再度お試しいただくか、担当者までご連絡ください。",
    };
  }

  // submissionId だけを httpOnly cookie に持ち、確認画面へ引き継ぐ (URL には出さない)。
  // soular が保持するのはこの識別子のみで、申込者の情報は保存しない。
  const store = await cookies();
  store.set(CONSENT_SID_COOKIE, result.submissionId, consentSidCookieOptions());
  // 条件は役目を終えたので破棄する（使い終わった cookie を残さない）。
  await clearConditions();

  redirect(`/precontract/${service}/apply/verify`);
}
