import "server-only";

import type { LegalService } from "@/lib/legal";

// どのサービスの申込を、どのアプリの API に届けるかの対応表。
// soular 側が持つのは「この対応表」と「法務文書の文面」だけで、
// 同意データそのものは一切保持しない（保存先は各サービスの DB）。

/** 同意データを所有するアプリ。 */
export type ServiceOwner = "hrms" | "aichat" | "ripichan";

/** サービス → 所有アプリ。dental / medical はどちらも HRMS が持つ。 */
export const SERVICE_OWNER: Record<LegalService, ServiceOwner> = {
  dental: "hrms",
  medical: "hrms",
  aichat: "aichat",
};

// 接続先とシークレットは環境変数から。シークレットは**アプリごとに別のものを使う**
// （1つ漏れても他サービスへ波及させないため）。
const OWNER_BASE_URL: Record<ServiceOwner, string | undefined> = {
  hrms: process.env.PRECONTRACT_HRMS_URL,
  aichat: process.env.PRECONTRACT_AICHAT_URL,
  ripichan: process.env.PRECONTRACT_RIPICHAN_URL,
};

const OWNER_SECRET: Record<ServiceOwner, string | undefined> = {
  hrms: process.env.PRECONTRACT_HRMS_SECRET,
  aichat: process.env.PRECONTRACT_AICHAT_SECRET,
  ripichan: process.env.PRECONTRACT_RIPICHAN_SECRET,
};

export type ServiceEndpoint = { baseUrl: string; secret: string };

/**
 * サービスの接続先を解決する。
 * URL かシークレットが未設定なら null を返し、呼び出し側は受付停止として扱う
 * （fail-closed。設定漏れのまま「送信できたように見える」のを防ぐ）。
 */
export function resolveServiceEndpoint(service: LegalService): ServiceEndpoint | null {
  const owner = SERVICE_OWNER[service];
  const baseUrl = OWNER_BASE_URL[owner];
  const secret = OWNER_SECRET[owner];
  if (!baseUrl || !secret) {
    console.error("[precontract] service endpoint not configured", { service, owner });
    return null;
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), secret };
}
