import { createHash } from "crypto";
import type { LegalDoc, LegalDocKind } from "./types";
import { legalDocText } from "./types";
import { legalDocsFor } from "./content";
import { policyVersionsFor, type LegalService } from "./policy";
import { DEFAULT_CONTRACT_PLAN, type ContractPlan, type DealFees } from "./plan";

export type { LegalDoc, LegalDocKind, LegalSection } from "./types";
export { LEGAL_DOC_LABEL, legalDocText } from "./types";
export {
  POLICY_VERSIONS,
  policyVersionsFor,
  isLegalService,
  type LegalService,
  type DocVersions,
} from "./policy";
export {
  CONTRACT_PLANS,
  CONTRACT_PLAN_ORDER,
  DEFAULT_CONTRACT_PLAN,
  contractPlanTerms,
  effectivePlanTerms,
  formatYen,
  isContractPlan,
  isPlanFeeConfirmed,
  planFeeSummary,
  resolveContractPlan,
  type ContractPlan,
  type ContractPlanTerms,
  type DealFees,
} from "./plan";

// 指定サービス・種別の法務文書を解決する。
// plan は重要事項説明書の第1項 (契約期間・料金) にのみ影響する。
export function resolveLegalDoc(
  service: LegalService,
  kind: LegalDocKind,
  plan: ContractPlan = DEFAULT_CONTRACT_PLAN,
  fees?: DealFees | null,
): LegalDoc {
  return legalDocsFor(service, plan, fees)[kind];
}

// 重要事項説明書 本文の SHA-256。「この内容に同意した」の証跡として保存する。
// 利用規約・プライバシーは版番号 + 同 URL で当時の文面を特定できるため、最も
// 改定リスクが高く争点になりやすい重説のみ本文ハッシュを取る (証跡の費用対効果)。
// プランで第1項が変わるため、ハッシュもプラン込みで算出する。
export function importantDocHash(
  service: LegalService,
  plan: ContractPlan = DEFAULT_CONTRACT_PLAN,
  fees?: DealFees | null,
): string {
  const version = policyVersionsFor(service).important;
  const doc = resolveLegalDoc(service, "important", plan, fees);
  return createHash("sha256").update(legalDocText(version, doc), "utf8").digest("hex");
}
