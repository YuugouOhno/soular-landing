// 契約プラン (縛り期間 + 料金) の定義。
// 2026-08-11 MTG: 営業がプランを選ぶと重要事項説明書 第1項の料金文言が切り替わる仕様にする。
//
// ⚠️ 金額は浜田さんの料金表を受領後に確定する (タスク015)。
// monthlyFeeYen が null のプランは「金額未確定」として扱い、重説 第1項に料金段落を
// 出力しない。これにより既定の 3年契約プランの本文は現行と 1 文字も変わらず、
// 稼働中の document_hash・配置済み PDF・既存の同意ログがそのまま有効に保たれる。
//
// 金額を入れると本文が変わる = ハッシュが変わるため、その際は必ず
//   1. POLICY_VERSIONS.important を上げる
//   2. pnpm generate:legal-pdfs で PDF を再生成して public/legal/ に配置
// の順で反映すること。

export type ContractPlan = "3y" | "5y" | "monitor3y";

export type ContractPlanTerms = {
  label: string;
  years: number;
  months: number;
  /** 導入時の初期費用。0 = 無料、null = 未確定 */
  initialFeeYen: number | null;
  /** 月額利用料。null = 未確定 (料金段落を出力しない) */
  monthlyFeeYen: number | null;
};

// 既定プラン。この値のときだけ従来どおりの URL・PDF 名・本文が維持される。
export const DEFAULT_CONTRACT_PLAN: ContractPlan = "3y";

export const CONTRACT_PLANS: Record<ContractPlan, ContractPlanTerms> = {
  // 初期費用0円は現行の重説 第1項に明記済み (確定情報)。
  "3y": { label: "3年契約プラン", years: 3, months: 36, initialFeeYen: 0, monthlyFeeYen: null },
  // TODO(タスク015): 5年 / モニターの初期費用・月額は浜田さんの料金表を待って埋める。
  "5y": { label: "5年契約プラン", years: 5, months: 60, initialFeeYen: null, monthlyFeeYen: null },
  monitor3y: {
    label: "モニター3年プラン",
    years: 3,
    months: 36,
    initialFeeYen: null,
    monthlyFeeYen: null,
  },
};

// 画面に並べる順序。
export const CONTRACT_PLAN_ORDER: ContractPlan[] = ["3y", "5y", "monitor3y"];

export function isContractPlan(value: string | null | undefined): value is ContractPlan {
  return value === "3y" || value === "5y" || value === "monitor3y";
}

// 不正値・未指定は既定プランに倒す (URL を手で触られても壊れないように)。
export function resolveContractPlan(value: string | null | undefined): ContractPlan {
  return isContractPlan(value) ? value : DEFAULT_CONTRACT_PLAN;
}

export function contractPlanTerms(plan: ContractPlan): ContractPlanTerms {
  return CONTRACT_PLANS[plan];
}

/** 案件ごとに営業が入力する金額。スタート画面で確定し、重説 第1項に反映される。 */
export type DealFees = { initialFeeYen: number; monthlyFeeYen: number };

/**
 * プラン定義に案件別の金額を重ねた実効条件を返す。
 * 金額が渡されなければプラン定義の既定値（多くは未確定=null）のまま。
 */
export function effectivePlanTerms(plan: ContractPlan, fees?: DealFees | null): ContractPlanTerms {
  const base = CONTRACT_PLANS[plan];
  if (!fees) return base;
  return { ...base, initialFeeYen: fees.initialFeeYen, monthlyFeeYen: fees.monthlyFeeYen };
}

export function formatYen(amount: number): string {
  return `${amount.toLocaleString("ja-JP")}円`;
}

// 料金が確定しているプランかどうか。false の間は重説に金額を書かない。
export function isPlanFeeConfirmed(plan: ContractPlan, fees?: DealFees | null): boolean {
  return effectivePlanTerms(plan, fees).monthlyFeeYen !== null;
}

// 同意チェックや控えメールに出す料金サマリー。未確定時は担当者案内に委ねる。
export function planFeeSummary(plan: ContractPlan, fees?: DealFees | null): string {
  const terms = effectivePlanTerms(plan, fees);
  if (terms.monthlyFeeYen === null) {
    return `${terms.label}（${terms.months}ヶ月）／料金は担当者よりご案内した内容`;
  }
  const initial =
    terms.initialFeeYen === null
      ? ""
      : `初期費用 ${terms.initialFeeYen === 0 ? "0円（無料）" : formatYen(terms.initialFeeYen)}・`;
  return `${terms.label}（${terms.months}ヶ月）／${initial}月額 ${formatYen(terms.monthlyFeeYen)}（税別）`;
}
