// 事前確認フォームの入力検証。プロジェクトに zod 依存が無いため、
// zod の safeParse と同形の軽量バリデータを手書きで提供する
// (actions.ts は consentFormSchema.safeParse(raw) を呼ぶだけで済む)。

import {
  effectivePlanTerms,
  formatYen,
  isPlanFeeConfirmed,
  planFeeSummary,
  resolveContractPlan,
  type ContractPlan,
  type DealFees,
} from "@/lib/legal/plan";

// 重要事項説明 (重説) の個別チェック項目。
// 重要な論点を個別に同意取得することで「各項目を説明・同意した」と立証でき、
// ダークパターン (まとめて1チェック) を避ける。key は consent_checklist の JSONB キー。
// 重要事項説明書 第1〜4項に対応する個別チェック（src/lib/legal/content.ts と整合）。
//
// 第1項のみ契約プランで文面が変わるため importantChecklistFor(plan) で組み立てる。
// IMPORTANT_CHECKLIST は既定プランのスナップショット (既存の呼び出し互換用)。
export function importantChecklistFor(
  plan: ContractPlan,
  fees?: DealFees | null,
): { key: string; label: string }[] {
  const terms = effectivePlanTerms(plan, fees);
  const initialFeeText =
    terms.initialFeeYen === null
      ? ""
      : `（導入時の初期費用${terms.initialFeeYen === 0 ? "0円" : formatYen(terms.initialFeeYen)}）`;
  return [
    {
      key: "term_penalty",
      label: `第1項：${terms.label}${initialFeeText}は${terms.months}ヶ月継続利用が条件で、中途解約時は残余期間分の月額利用料相当額を違約金（損害賠償額の予定）として一括精算することを理解しました`,
    },
    ...IMPORTANT_CHECKLIST_TAIL,
  ];
}

// 2026-08-11 MTG: 全体説明への同意とは「別枠」で料金への同意を取る。
export const FEE_AGREEMENT_KEY = "fee_agreement";

export function feeAgreementLabel(plan: ContractPlan, fees?: DealFees | null): string {
  return isPlanFeeConfirmed(plan, fees)
    ? `料金について理解し、同意しました（${planFeeSummary(plan, fees)}）`
    : "料金（初期費用・月額利用料・契約期間）について担当者から説明を受け、理解し同意しました";
}

const IMPORTANT_CHECKLIST_TAIL = [
  {
    key: "disclaimer",
    label:
      "第2項：本システムは離職ゼロ・採用の成功を法的に保証するものではなく、労働トラブル等について直接的な法的責任を負わないことを理解しました",
  },
  {
    key: "late_fee",
    label:
      "第3項：利用料金の支払遅延時に年14.6％の遅延損害金が発生し得ること、長期未払いでサービスを一時停止し得ることを理解しました",
  },
  {
    key: "data_backup",
    label:
      "第4項：データの完全な保全・復元は100%保証されず、これに起因するデータ消失について弊社が責任を負わないことを理解しました",
  },
] as const;

// 既定プランでの一覧 (管理画面のフォールバック表示・型導出用)。
export const IMPORTANT_CHECKLIST = importantChecklistFor("3y");

export type ChecklistKey = (typeof IMPORTANT_CHECKLIST_TAIL)[number]["key"] | "term_penalty";

export type ConsentFormInput = {
  service: "dental" | "medical";
  contractPlan: ContractPlan;
  clinicName: string;
  applicantName: string;
  applicantKana: string;
  roleTitle: string;
  email: string;
  emailConfirm: string;
  phone: string;
  salesRep: string;
  servicePlan: string;
  scheduledContractDate: string;
  term_penalty: boolean;
  disclaimer: boolean;
  late_fee: boolean;
  data_backup: boolean;
  fee_agreement: boolean;
  agreedImportant: boolean;
  agreedTerms: boolean;
  agreedPrivacy: boolean;
  selfInputConfirmed: boolean;
  note: string;
  preferredContact: string;
};

type Issue = { path: (string | number)[]; message: string };
type ParseResult =
  | { success: true; data: ConsentFormInput }
  | { success: false; error: { issues: Issue[] } };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function str(raw: Record<string, unknown>, key: string): string {
  const v = raw[key];
  return typeof v === "string" ? v.trim() : "";
}

// チェックボックスは値が "on" のときだけ送られる。true 必須として扱う。
function isChecked(raw: Record<string, unknown>, key: string): boolean {
  const v = raw[key];
  return v === "on" || v === "true" || v === true;
}

export const consentFormSchema = {
  safeParse(raw: Record<string, unknown>): ParseResult {
    const issues: Issue[] = [];
    const req = (key: string, label: string, max: number): string => {
      const v = str(raw, key);
      if (v.length === 0) issues.push({ path: [key], message: `${label}を入力してください` });
      else if (v.length > max) issues.push({ path: [key], message: `${label}が長すぎます` });
      return v;
    };
    const check = (key: string): boolean => {
      const ok = isChecked(raw, key);
      if (!ok) issues.push({ path: [key], message: "チェックが必要です" });
      return ok;
    };

    const serviceRaw = str(raw, "service");
    const service = serviceRaw === "dental" || serviceRaw === "medical" ? serviceRaw : null;
    if (!service) issues.push({ path: ["service"], message: "不正なリクエストです" });

    // 契約プランは不正値・未指定を既定プランに倒す (URL 由来のため落とさない)。
    const contractPlan = resolveContractPlan(str(raw, "contractPlan"));

    const clinicName = req("clinicName", "医院名", 200);
    const applicantName = req("applicantName", "代表者氏名", 100);
    const applicantKana = req("applicantKana", "フリガナ", 100);
    const roleTitle = str(raw, "roleTitle");
    if (roleTitle.length > 100) issues.push({ path: ["roleTitle"], message: "役職が長すぎます" });

    const email = str(raw, "email");
    if (email.length > 200) issues.push({ path: ["email"], message: "メールアドレスが長すぎます" });
    else if (!EMAIL_RE.test(email))
      issues.push({ path: ["email"], message: "メールアドレスの形式が正しくありません" });
    const emailConfirm = str(raw, "emailConfirm");
    if (emailConfirm.length > 200)
      issues.push({ path: ["emailConfirm"], message: "確認用メールアドレスが長すぎます" });
    else if (!EMAIL_RE.test(emailConfirm))
      issues.push({ path: ["emailConfirm"], message: "確認用メールアドレスの形式が正しくありません" });
    else if (EMAIL_RE.test(email) && email !== emailConfirm)
      issues.push({ path: ["emailConfirm"], message: "メールアドレスが一致しません" });

    const phone = req("phone", "電話番号", 30);
    const salesRep = req("salesRep", "営業担当者名", 100);
    const servicePlan = req("servicePlan", "契約サービス・プラン", 200);

    const scheduledContractDate = str(raw, "scheduledContractDate");
    if (!DATE_RE.test(scheduledContractDate))
      issues.push({ path: ["scheduledContractDate"], message: "契約予定日を選択してください" });

    const term_penalty = check("term_penalty");
    const disclaimer = check("disclaimer");
    const late_fee = check("late_fee");
    const data_backup = check("data_backup");
    const fee_agreement = check(FEE_AGREEMENT_KEY);
    const agreedImportant = check("agreedImportant");
    const agreedTerms = check("agreedTerms");
    const agreedPrivacy = check("agreedPrivacy");
    const selfInputConfirmed = check("selfInputConfirmed");

    const note = str(raw, "note");
    if (note.length > 1000) issues.push({ path: ["note"], message: "備考が長すぎます" });
    const preferredContact = str(raw, "preferredContact");
    if (preferredContact.length > 200)
      issues.push({ path: ["preferredContact"], message: "希望連絡日時が長すぎます" });

    if (issues.length > 0 || !service) {
      return { success: false, error: { issues } };
    }

    return {
      success: true,
      data: {
        service,
        contractPlan,
        clinicName,
        applicantName,
        applicantKana,
        roleTitle,
        email,
        emailConfirm,
        phone,
        salesRep,
        servicePlan,
        scheduledContractDate,
        term_penalty,
        disclaimer,
        late_fee,
        data_backup,
        fee_agreement,
        agreedImportant,
        agreedTerms,
        agreedPrivacy,
        selfInputConfirmed,
        note,
        preferredContact,
      },
    };
  },
};
