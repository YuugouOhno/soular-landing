"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getClientIp } from "@/lib/security/ip";
import { unlockGate } from "@/lib/consent/gate";
import { isGateAttemptLimited } from "@/lib/consent/rate-limit";
import { isLegalService, resolveContractPlan } from "@/lib/legal";

export type GateState = { error?: string };

export async function unlockGateAction(_prev: GateState, formData: FormData): Promise<GateState> {
  const service = String(formData.get("service") ?? "");
  if (!isLegalService(service)) {
    return { error: "不正なリクエストです。" };
  }

  // 合言葉の総当たり抑止。soular は DB を持たないためメモリ上の best-effort
  // （ゲートは第一防衛線ではなく、送信は各サービス側でも別途保護される）。
  const ip = getClientIp(await headers());
  if (isGateAttemptLimited(ip)) {
    return { error: "試行回数が多すぎます。しばらく時間をおいてから再度お試しください。" };
  }

  const input = String(formData.get("password") ?? "");
  const result = await unlockGate(input);

  if (result === "ok") {
    // 選択された契約プランを URL に載せてフォーム側へ引き継ぐ。
    const plan = resolveContractPlan(String(formData.get("contractPlan") ?? ""));
    redirect(`/precontract/${service}?plan=${plan}`);
  }
  if (result === "not_configured") {
    return { error: "現在、受付を停止しています。担当者までお問い合わせください。" };
  }
  return { error: "合言葉が違います。" };
}
