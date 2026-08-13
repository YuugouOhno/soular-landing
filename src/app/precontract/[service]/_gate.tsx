"use client";

import { useActionState, useState } from "react";
import {
  CONTRACT_PLANS,
  CONTRACT_PLAN_ORDER,
  planFeeSummary,
  type ContractPlan,
} from "@/lib/legal/plan";
import type { GateState } from "./gate-actions";

type Action = (prev: GateState, formData: FormData) => Promise<GateState>;

const inputStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
};
const buttonStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 16px",
  fontSize: 15,
  cursor: "pointer",
};

export function GatePrompt({
  service,
  plan: initialPlan,
  action,
}: {
  service: string;
  plan: ContractPlan;
  action: Action;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  // 営業がここで選んだプランが、重要事項説明書 第1項の期間・料金文言に反映される。
  const [plan, setPlan] = useState<ContractPlan>(initialPlan);

  return (
    <form action={formAction} style={{ display: "grid", gap: 14, marginTop: 16 }}>
      <input type="hidden" name="service" value={service} />
      {state.error ? (
        <p style={{ border: "1px solid #efb4a8", borderRadius: 12, padding: 12, color: "#a23b2a" }}>
          {state.error}
        </p>
      ) : null}

      {/* 契約プランの選択 (合言葉の上に置く。2026-08-11 MTG の指定) */}
      <fieldset
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 14,
          margin: 0,
          display: "grid",
          gap: 8,
        }}
      >
        <legend style={{ fontSize: 13, fontWeight: 700, padding: "0 6px", color: "#2563eb" }}>
          契約プラン
        </legend>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "#6b7280" }}>
          ご案内した契約プランを選択してください。重要事項説明書の契約期間・料金の記載が切り替わります。
        </p>
        {CONTRACT_PLAN_ORDER.map((key) => (
          <label
            key={key}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              fontSize: 14,
              lineHeight: 1.6,
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="contractPlan"
              value={key}
              checked={plan === key}
              onChange={() => setPlan(key)}
              style={{ marginTop: 4 }}
            />
            <span>
              {CONTRACT_PLANS[key].label}
              <span style={{ display: "block", fontSize: 12, color: "#6b7280" }}>
                {planFeeSummary(key)}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13 }}>合言葉</span>
        <input
          style={inputStyle}
          name="password"
          type="password"
          autoComplete="off"
          required
          placeholder="担当者からお伝えした合言葉"
        />
      </label>
      <button
        style={{ ...buttonStyle, ...(pending ? { opacity: 0.7, cursor: "wait" } : {}) }}
        type="submit"
        disabled={pending}
      >
        {pending ? "確認中…" : "進む"}
      </button>
    </form>
  );
}
