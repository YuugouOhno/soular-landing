"use client";

import { useActionState, useState } from "react";
import { CONTRACT_PLANS, plansForService, type ContractPlan } from "@/lib/legal/plan";
import { resolveServiceLabel } from "@/lib/branding";
import type { StartState } from "./actions";

// スタート画面。営業がここで申込条件（サービス・プラン・金額）と合言葉を入力し、
// 送信すると条件が確定して申込フォームへ遷移する。
// 以降の画面で条件は変更できない（変えたいときはここへ戻る）。

type Action = (prev: StartState, formData: FormData) => Promise<StartState>;

const input: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
};
const fs: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  margin: 0,
  display: "grid",
  gap: 12,
};
const lg: React.CSSProperties = { fontWeight: 700, fontSize: 14, padding: "0 8px", color: "#2563eb" };
const errStyle: React.CSSProperties = { color: "#a23b2a", fontSize: 12, margin: "2px 0 0" };

// 今 soular から申し込めるサービス。将来 aichat / ripichan をここに足す。
const SERVICES = ["dental", "medical", "aichat"] as const;

export function StartForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [service, setService] = useState<string>("dental");
  const [plan, setPlan] = useState<ContractPlan>("3y");
  // サービスによって選べるプランが違う（モニターは HRMS のみ）。
  // サービスを変えたとき、そのサービスに無いプランが残らないよう寄せ直す。
  const availablePlans = plansForService(service);
  const effectivePlan = availablePlans.includes(plan) ? plan : availablePlans[0];

  const err = (k: string) => (state.errors?.[k] ? <p style={errStyle}>{state.errors[k]}</p> : null);

  return (
    <form action={formAction} style={{ display: "grid", gap: 18, marginTop: 20 }}>
      {state.formError ? (
        <p style={{ border: "1px solid #efb4a8", borderRadius: 12, padding: 12, color: "#a23b2a" }}>
          {state.formError}
        </p>
      ) : null}

      <fieldset style={fs}>
        <legend style={lg}>1. サービス</legend>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 13 }}>お申し込みいただくサービス</span>
          <select
            name="service"
            style={input}
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
          >
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {resolveServiceLabel(s)}
              </option>
            ))}
          </select>
          {err("service")}
        </label>
      </fieldset>

      <fieldset style={fs}>
        <legend style={lg}>2. 契約プランと料金</legend>
        <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.7 }}>
          ここで入力した内容が、重要事項説明書の契約期間・料金の記載にそのまま反映されます。
        </p>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 13 }}>契約プラン</span>
          <select
            name="contractPlan"
            style={input}
            value={effectivePlan}
            onChange={(e) => setPlan(e.target.value as ContractPlan)}
            required
          >
            {availablePlans.map((k) => (
              <option key={k} value={k}>
                {CONTRACT_PLANS[k].label}（{CONTRACT_PLANS[k].months}ヶ月）
              </option>
            ))}
          </select>
          {err("contractPlan")}
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13 }}>
              導入時の初期費用（円・税別）<span style={{ color: "#a23b2a" }}> *</span>
            </span>
            <input
              name="initialFeeYen"
              style={input}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              required
            />
            <span style={{ fontSize: 11, color: "#6b7280" }}>無料の場合は 0 と入力</span>
            {err("initialFeeYen")}
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13 }}>
              月額利用料（円・税別）<span style={{ color: "#a23b2a" }}> *</span>
            </span>
            <input
              name="monthlyFeeYen"
              style={input}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="39800"
              required
            />
            <span style={{ fontSize: 11, color: "#6b7280" }}>
              {CONTRACT_PLANS[effectivePlan].months}ヶ月の継続利用が前提
            </span>
            {err("monthlyFeeYen")}
          </label>
        </div>
      </fieldset>

      <fieldset style={fs}>
        <legend style={lg}>3. 合言葉</legend>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 13 }}>担当者からお伝えした合言葉</span>
          <input name="password" style={input} type="password" autoComplete="off" required />
          {err("password")}
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        style={{
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "14px 16px",
          fontSize: 15,
          cursor: pending ? "wait" : "pointer",
          opacity: pending ? 0.7 : 1,
        }}
      >
        {pending ? "確認中…" : "この内容で申込フォームへ進む"}
      </button>
      <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.7 }}>
        次の画面では、ここで確定した条件は変更できません。
        変更が必要な場合はこの画面に戻ってやり直してください。
      </p>
    </form>
  );
}
