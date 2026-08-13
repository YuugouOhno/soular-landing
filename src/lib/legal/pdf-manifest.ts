import { policyVersionsFor, type DocVersions, type LegalService } from "./policy";
import { CONTRACT_PLAN_ORDER, DEFAULT_CONTRACT_PLAN, type ContractPlan } from "./plan";

// 同意した文書を「サービス × 版に紐づく PDF」として控えメールに添付するための定義。
// PDF は事前生成して public/legal/ に配置する (サーバーレスでの日本語フォント
// 埋め込みを避けるため)。版を上げたら対応する PDF を必ず追加する。
// 配置漏れは scripts/check-legal-pdfs.mjs がビルド時に検出する。

export const LEGAL_PDF_PUBLIC_DIR = "legal"; // public/legal/

export type LegalPdfRef = { label: string; filename: string };

// 既定プラン以外だけファイル名にプランを挟む。既定プラン (3年) は従来どおりの
// 名前を保ち、配置済み PDF と既存の同意ログの添付をそのまま生かす。
export function legalPdfPlanSuffix(plan: ContractPlan): string {
  return plan === DEFAULT_CONTRACT_PLAN ? "" : `_${plan}`;
}

// service と版から PDF ファイル名を組み立てる。
// 例: terms_dental_2026-06-20.pdf / important_medical_2026-06-20.pdf
// 重説のみ契約プランで本文が変わるため、既定プラン以外はプラン名を挟む。
// 例: important_dental_5y_2026-06-22.pdf
export function legalPdfRefsFor(
  service: LegalService,
  versions: DocVersions,
  plan: ContractPlan = DEFAULT_CONTRACT_PLAN,
): LegalPdfRef[] {
  return [
    { label: "利用規約", filename: `terms_${service}_${versions.terms}.pdf` },
    { label: "プライバシーポリシー", filename: `privacy_${service}_${versions.privacy}.pdf` },
    {
      label: "重要事項説明書",
      filename: `important_${service}${legalPdfPlanSuffix(plan)}_${versions.important}.pdf`,
    },
  ];
}

// 現行版・既定プラン分の PDF 参照 (ビルドガードの必須対象)。
export function allCurrentLegalPdfRefs(): LegalPdfRef[] {
  const services: LegalService[] = ["dental", "medical"];
  return services.flatMap((s) => legalPdfRefsFor(s, policyVersionsFor(s)));
}

// 既定プラン以外の重説 PDF 参照 (任意配置。未配置なら添付を graceful skip する)。
export function optionalPlanLegalPdfRefs(): LegalPdfRef[] {
  const services: LegalService[] = ["dental", "medical"];
  const plans = CONTRACT_PLAN_ORDER.filter((p) => p !== DEFAULT_CONTRACT_PLAN);
  return services.flatMap((s) =>
    plans.map((p) => ({
      label: "重要事項説明書",
      filename: `important_${s}${legalPdfPlanSuffix(p)}_${policyVersionsFor(s).important}.pdf`,
    })),
  );
}
