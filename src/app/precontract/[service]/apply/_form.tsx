"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  FEE_AGREEMENT_KEY,
  feeAgreementLabel,
  importantChecklistFor,
} from "@/lib/consent/schema";
import { effectivePlanTerms, planFeeSummary, type ContractPlan } from "@/lib/legal/plan";
import type { ApplyConditions } from "@/lib/consent/conditions";
import type { ConsentFormState } from "./actions";

type Action = (prev: ConsentFormState, formData: FormData) => Promise<ConsentFormState>;

const INITIAL: ConsentFormState = {};

const boxError: React.CSSProperties = {
  border: "1px solid #efb4a8",
  borderRadius: 12,
  padding: 12,
  color: "#a23b2a",
};
const fieldErrStyle: React.CSSProperties = { color: "#a23b2a", fontSize: 12, margin: "2px 0 0" };
const inputStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
};

// 「リンクを開いた」ことを必須化する規約類。開くまで関連チェックを無効化する。
const DOC_LINKS = [
  { key: "important", label: "重要事項説明書" },
  { key: "terms", label: "利用規約" },
  { key: "privacy", label: "プライバシーポリシー" },
] as const;

type DocKey = (typeof DOC_LINKS)[number]["key"];

// 送信に必須の同意チェック (これらが全て true になるまで送信ボタンを無効化する)。
function requiredChecks(plan: ContractPlan, service: string): string[] {
  return [
    ...importantChecklistFor(plan, null, service).map((i) => i.key),
    FEE_AGREEMENT_KEY,
    "agreedImportant",
    "agreedTerms",
    "agreedPrivacy",
    "selfInputConfirmed",
  ];
}

export function ConsentForm({
  service,
  conditions,
  action,
}: {
  service: string;
  conditions: ApplyConditions;
  action: Action;
}) {
  // 条件はスタート画面で確定済み。ここでは変更できない。
  // 送信時にサーバーが cookie から読み直すため、この値は表示専用。
  const plan = conditions.plan;
  const fees = { initialFeeYen: conditions.initialFeeYen, monthlyFeeYen: conditions.monthlyFeeYen };
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const planTerms = effectivePlanTerms(plan, fees);
  const checklist = importantChecklistFor(plan, fees, service);
  const [opened, setOpened] = useState<Record<DocKey, boolean>>({
    important: false,
    terms: false,
    privacy: false,
  });
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const err = (key: string) =>
    state.errors?.[key] ? <p style={fieldErrStyle}>{state.errors[key]}</p> : null;

  const markOpened = (key: DocKey) => setOpened((o) => ({ ...o, [key]: true }));
  const onCheck = (name: string, value: boolean) => setChecked((c) => ({ ...c, [name]: value }));
  const allChecked = requiredChecks(plan, service).every((k) => checked[k]);


  return (
    <form action={formAction} style={{ display: "grid", gap: 22, marginTop: 20 }}>
      <input type="hidden" name="service" value={service} />
      {/* 契約条件は hidden input で送らない。サーバーが署名付き cookie から読む
          (hidden を信用すると DevTools で金額を書き換えられる)。 */}
      {state.formError ? <p style={boxError}>{state.formError}</p> : null}

      {/* A. 申込者情報 */}
      <fieldset style={fs}>
        <legend style={lg}>1. 申込者情報</legend>
        <div
          style={{
            background: "#f4f7ff",
            border: "1px solid #d7e2ff",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 14,
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          <strong>ご契約プラン：{planTerms.label}</strong>
          <span style={{ display: "block", color: "#4b5563" }}>{planFeeSummary(plan, fees)}</span>
          <Link
            href="/precontract"
            style={{ display: "inline-block", marginTop: 6, fontSize: 12, color: "#2563eb" }}
          >
            条件を変更する（最初の画面に戻ります）
          </Link>
        </div>
        <div style={grid2}>
          <Field label="医院・法人名" required error={err("clinicName")}>
            <input name="clinicName" style={inputStyle} required maxLength={200} />
          </Field>
          <Field label="契約サービス・プラン" required error={err("servicePlan")}>
            <select name="servicePlan" style={inputStyle} required defaultValue="">
              <option value="" disabled>
                選択してください
              </option>
              <option value="スタンダードプラン">スタンダードプラン</option>
              <option value="コンサルティングプラン">コンサルティングプラン</option>
            </select>
          </Field>
          <Field label="代表者氏名" required error={err("applicantName")}>
            <input name="applicantName" style={inputStyle} required maxLength={100} />
          </Field>
          <Field label="代表者氏名（フリガナ）" required error={err("applicantKana")}>
            <input name="applicantKana" style={inputStyle} required maxLength={100} />
          </Field>
          <Field label="役職（任意）" error={err("roleTitle")}>
            <input name="roleTitle" style={inputStyle} maxLength={100} />
          </Field>
          <Field label="電話番号" required error={err("phone")}>
            <input name="phone" style={inputStyle} inputMode="tel" required maxLength={30} />
          </Field>
          <Field label="メールアドレス" required error={err("email")}>
            <input name="email" style={inputStyle} type="email" required maxLength={200} />
          </Field>
          <Field label="メールアドレス（確認用）" required error={err("emailConfirm")}>
            <input name="emailConfirm" style={inputStyle} type="email" required maxLength={200} />
          </Field>
          <Field label="営業担当者名" required error={err("salesRep")}>
            <input name="salesRep" style={inputStyle} required maxLength={100} />
          </Field>
          <Field label="契約予定日" required error={err("scheduledContractDate")}>
            <input name="scheduledContractDate" style={inputStyle} type="date" required />
          </Field>
        </div>
      </fieldset>

      {/* B. 書面の確認 */}
      <fieldset style={fs}>
        <legend style={lg}>2. 重要書面のご確認</legend>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 12px" }}>
          下記を必ずお開きください。<strong>開いていただくまで同意チェックは有効になりません。</strong>
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          {DOC_LINKS.map((doc) => (
            <a
              key={doc.key}
              href={`/precontract/${service}/legal/${doc.key}?plan=${plan}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => markOpened(doc.key)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #d1d5db",
                borderRadius: 10,
                padding: "10px 14px",
                textDecoration: "none",
                color: "#18181b",
              }}
            >
              <span>{doc.label} を開く ↗</span>
              <span style={{ fontSize: 12, color: opened[doc.key] ? "#1c8a6b" : "#6b7280" }}>
                {opened[doc.key] ? "確認済み ✓" : "未確認"}
              </span>
            </a>
          ))}
        </div>
      </fieldset>

      {/* C. 重説の個別同意 */}
      <fieldset style={fs}>
        <legend style={lg}>3. 重要事項説明の確認</legend>
        {/* プランを変えたら非制御チェックボックスを作り直し、見た目のチェックも確実に外す */}
        <div style={{ display: "grid", gap: 10 }}>
          {checklist.map((item) => (
            <Check key={item.key} name={item.key} disabled={!opened.important} onChange={onCheck} error={err(item.key)}>
              {item.label}
            </Check>
          ))}
          <Check name="agreedImportant" disabled={!opened.important} onChange={onCheck} error={err("agreedImportant")}>
            重要事項説明書の内容全体について説明を受け、理解しました
          </Check>
        </div>

        {/* 料金への同意は全体説明とは別枠で取る (2026-08-11 MTG の指定)。 */}
        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            border: "1px solid #d7e2ff",
            background: "#f4f7ff",
            borderRadius: 10,
          }}
        >
          <Check
            name={FEE_AGREEMENT_KEY}
            disabled={!opened.important}
            onChange={onCheck}
            error={err(FEE_AGREEMENT_KEY)}
          >
            <strong>{feeAgreementLabel(plan, fees)}</strong>
          </Check>
        </div>
      </fieldset>

      {/* D. 規約同意 + 本人入力 */}
      <fieldset style={fs}>
        <legend style={lg}>4. 規約への同意・本人確認</legend>
        <div style={{ display: "grid", gap: 10 }}>
          <Check name="agreedTerms" disabled={!opened.terms} onChange={onCheck} error={err("agreedTerms")}>
            利用規約の内容を確認し、同意します
          </Check>
          <Check name="agreedPrivacy" disabled={!opened.privacy} onChange={onCheck} error={err("agreedPrivacy")}>
            プライバシーポリシーの内容を確認し、同意します
          </Check>
          <Check name="selfInputConfirmed" onChange={onCheck} error={err("selfInputConfirmed")}>
            本フォームは契約者本人、または正当な権限を有する者が入力しました
          </Check>
        </div>
      </fieldset>

      {/* E. その他 */}
      <fieldset style={fs}>
        <legend style={lg}>5. その他</legend>
        <div style={{ display: "grid", gap: 14 }}>
          <Field label="その他（任意）" error={err("note")}>
            <textarea
              name="note"
              style={{ ...inputStyle, resize: "vertical" }}
              rows={4}
              maxLength={1000}
              placeholder="ご希望の連絡日時・ご質問・ご要望などがあればご自由にご記入ください"
            />
          </Field>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending || !allChecked}
        style={{
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "14px 16px",
          fontSize: 15,
          cursor: "pointer",
          ...(pending ? { opacity: 0.7, cursor: "wait" } : {}),
          ...(!pending && !allChecked ? { opacity: 0.5, cursor: "not-allowed" } : {}),
        }}
      >
        {pending ? "送信中…" : "同意して本人確認に進む"}
      </button>
      <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>
        {allChecked
          ? "送信後、ご入力のメールアドレスに 6 桁の確認コードをお送りします。"
          : "すべての同意項目にチェックすると送信できます（書面を開くとチェックが有効になります）。"}
      </p>
    </form>
  );
}

const fs: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, margin: 0 };
const lg: React.CSSProperties = { fontWeight: 700, fontSize: 14, padding: "0 8px", color: "#2563eb" };
const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13 }}>
        {label}
        {required ? <span style={{ color: "#a23b2a" }}> *</span> : null}
      </span>
      {children}
      {error}
    </label>
  );
}

function Check({
  name,
  disabled,
  onChange,
  error,
  children,
}: {
  name: string;
  disabled?: boolean;
  onChange?: (name: string, checked: boolean) => void;
  error?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          fontSize: 14,
          lineHeight: 1.6,
          opacity: disabled ? 0.45 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <input
          type="checkbox"
          name={name}
          disabled={disabled}
          required
          onChange={(e) => onChange?.(name, e.target.checked)}
          style={{ marginTop: 3 }}
        />
        <span>{children}</span>
      </label>
      {error}
    </div>
  );
}
