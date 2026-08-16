"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getClientIp } from "@/lib/security/ip";
import { unlockGate } from "@/lib/consent/gate";
import { isGateAttemptLimited } from "@/lib/consent/rate-limit";
import { issueConditions, parseAmountYen } from "@/lib/consent/conditions";
import { isContractPlan, isLegalService } from "@/lib/legal";

// スタート画面の送信。合言葉を検証し、申込条件を確定して申込フォームへ送り出す。
//
// ここが「条件の唯一の入口」。以降の画面は署名付き cookie からしか条件を読まないため、
// フォームの hidden input を書き換えても金額は変えられない。

export type StartState = {
  formError?: string;
  errors?: Record<string, string>;
};

export async function startPrecontractAction(
  _prev: StartState,
  formData: FormData,
): Promise<StartState> {
  const errors: Record<string, string> = {};

  const serviceRaw = String(formData.get("service") ?? "");
  const planRaw = String(formData.get("contractPlan") ?? "");
  // 金額は営業が入力するが、実行時はブラウザ経由で届く未信頼入力として厳密に検証する。
  const initialFeeYen = parseAmountYen(formData.get("initialFeeYen"));
  const monthlyFeeYen = parseAmountYen(formData.get("monthlyFeeYen"));

  if (!isLegalService(serviceRaw)) errors.service = "サービスを選択してください";
  if (!isContractPlan(planRaw)) errors.contractPlan = "契約プランを選択してください";
  if (initialFeeYen === null) {
    errors.initialFeeYen = "初期費用を半角数字で入力してください（無料なら 0）";
  }
  if (monthlyFeeYen === null) {
    errors.monthlyFeeYen = "月額利用料を半角数字で入力してください";
  }

  if (
    !isLegalService(serviceRaw) ||
    !isContractPlan(planRaw) ||
    initialFeeYen === null ||
    monthlyFeeYen === null
  ) {
    return { errors };
  }
  const service = serviceRaw;
  const plan = planRaw;

  // 合言葉の総当たり抑止（best-effort。本来の防衛線は各サービス側の API）。
  const ip = getClientIp(await headers());
  if (isGateAttemptLimited(ip)) {
    return { formError: "試行回数が多すぎます。しばらく時間をおいてから再度お試しください。" };
  }

  const result = await unlockGate(String(formData.get("password") ?? ""));
  if (result === "not_configured") {
    return { formError: "現在、受付を停止しています。担当者までお問い合わせください。" };
  }
  if (result !== "ok") {
    return { errors: { password: "合言葉が違います" } };
  }

  // ゲート通過後に条件を発行する（署名にゲートの指紋を含めるため順序が重要）。
  const issued = await issueConditions({
    service,
    plan,
    initialFeeYen,
    monthlyFeeYen,
    issuedAt: Math.floor(Date.now() / 1000),
  });
  if (!issued) {
    return { formError: "受付の準備ができていません。担当者までお問い合わせください。" };
  }

  redirect(`/precontract/${service}/apply`);
}
