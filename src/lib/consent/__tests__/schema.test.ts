import { describe, it, expect } from "vitest";
import { consentFormSchema, importantChecklistFor, FEE_AGREEMENT_KEY } from "../schema";
import { LEGAL_SERVICES } from "@/lib/legal/policy";
import { plansForService } from "@/lib/legal/plan";

// 2026-08-16 の回帰:
// aichat を画面・法務文書には足したのに、この検証だけ dental|medical のままだった。
// service は画面に無いフィールドなのでエラーが表示されず、
// 「押しても入力欄が消えるだけで何も起きない」という壊れ方をした。
// サービスを増やしたらこのテストが自動的に対象を広げる形にしてある。

function validForm(service: string, plan: string): Record<string, unknown> {
  const base: Record<string, unknown> = {
    service,
    contractPlan: plan,
    clinicName: "テスト医院",
    applicantName: "山田 太郎",
    applicantKana: "ヤマダ タロウ",
    roleTitle: "院長",
    email: "test@example.com",
    emailConfirm: "test@example.com",
    phone: "03-1234-5678",
    salesRep: "浜田",
    servicePlan: "スタンダードプラン",
    scheduledContractDate: "2026-09-01",
    [FEE_AGREEMENT_KEY]: "on",
    agreedImportant: "on",
    agreedTerms: "on",
    agreedPrivacy: "on",
    selfInputConfirmed: "on",
    note: "",
    preferredContact: "",
  };
  // 画面に出る個別チェックと同じ集合を入れる。
  for (const item of importantChecklistFor(plan as never, null, service)) base[item.key] = "on";
  return base;
}

describe("consentFormSchema", () => {
  it("全サービス・全プランの正常な申込を受け付ける", () => {
    for (const service of LEGAL_SERVICES) {
      for (const plan of plansForService(service)) {
        const result = consentFormSchema.safeParse(validForm(service, plan));
        expect(result.success, `${service}/${plan} が弾かれた`).toBe(true);
      }
    }
  });

  it("チェック項目はサービスごとの集合をそのまま必須にする", () => {
    for (const service of LEGAL_SERVICES) {
      const plan = plansForService(service)[0];
      const keys = importantChecklistFor(plan, null, service).map((i) => i.key);
      expect(keys.length).toBeGreaterThan(0);

      for (const key of keys) {
        const form = validForm(service, plan);
        delete form[key];
        const result = consentFormSchema.safeParse(form);
        expect(result.success, `${service}: ${key} 未チェックが通ってしまった`).toBe(false);
      }
    }
  });

  it("他サービスのチェック項目は要求しない", () => {
    // aichat のフォームには term_penalty / late_fee / data_backup が無い。
    // これらを必須にすると、画面から埋めようがないまま弾かれる。
    const aichat = validForm("aichat", "3y");
    for (const foreign of ["term_penalty", "late_fee", "data_backup"]) {
      expect(aichat[foreign]).toBeUndefined();
    }
    expect(consentFormSchema.safeParse(aichat).success).toBe(true);
  });

  it("未知のサービスは拒否する", () => {
    const result = consentFormSchema.safeParse(validForm("linebot", "3y"));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "service")).toBe(true);
    }
  });

  it("メールアドレスの不一致を検出する", () => {
    const form = validForm("dental", "3y");
    form.emailConfirm = "other@example.com";
    const result = consentFormSchema.safeParse(form);
    expect(result.success).toBe(false);
  });
});
