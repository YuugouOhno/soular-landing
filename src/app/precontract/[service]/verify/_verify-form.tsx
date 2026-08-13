"use client";

import { useActionState, useEffect, useState } from "react";
import type { ConsentVerifyState } from "./actions";

type Action = (prev: ConsentVerifyState, formData: FormData) => Promise<ConsentVerifyState>;

const boxError: React.CSSProperties = { border: "1px solid #efb4a8", borderRadius: 12, padding: 12 };
const boxNotice: React.CSSProperties = { border: "1px solid #9bd4c7", borderRadius: 12, padding: 12 };
const inputStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "10px 12px",
  letterSpacing: 6,
  fontSize: 18,
  width: "100%",
  boxSizing: "border-box",
};

export function VerifyForm({
  service,
  resendAction,
  verifyAction,
}: {
  service: string;
  resendAction: Action;
  verifyAction: Action;
}) {
  const initial: ConsentVerifyState = { phase: "sent" };
  const [resendState, resend, resending] = useActionState(resendAction, initial);
  const [verifyState, verify, verifying] = useActionState(verifyAction, initial);
  const [cooldown, setCooldown] = useState(60);

  const [prevResend, setPrevResend] = useState(resendState);
  if (resendState !== prevResend) {
    setPrevResend(resendState);
    if (resendState.notice) setCooldown(60);
    else if (resendState.retryAfterSeconds) setCooldown(resendState.retryAfterSeconds);
  }

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (verifyState.phase === "verified" || resendState.phase === "verified") {
    return (
      <div style={{ ...boxNotice, marginTop: 16 }}>
        <p style={{ margin: 0, fontWeight: 700 }}>本人確認が完了しました ✓</p>
        <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.7 }}>
          ご同意の内容を確かに承りました。控えをメールでお送りしています。
          追って担当者よりシステム利用契約書をお送りいたします。この画面は閉じていただいて構いません。
        </p>
      </div>
    );
  }

  const resendDisabled = resending || cooldown > 0;

  return (
    <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
      {resendState.notice ? <p style={boxNotice}>{resendState.notice}</p> : null}
      {resendState.error ? <p style={boxError}>{resendState.error}</p> : null}
      {verifyState.error ? <p style={boxError}>{verifyState.error}</p> : null}

      <form action={verify} style={{ display: "grid", gap: 12 }}>
        {/* どのサービスの API に問い合わせるかを Server Action へ渡す */}
        <input type="hidden" name="service" value={service} />
        <label style={{ display: "grid", gap: 6 }}>
          <span>確認コード（6 桁）</span>
          <input
            style={inputStyle}
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            placeholder="123456"
          />
        </label>
        <button
          type="submit"
          disabled={verifying}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 15,
            cursor: "pointer",
            ...(verifying ? { opacity: 0.7, cursor: "wait" } : {}),
          }}
        >
          {verifying ? "確認中…" : "確認する"}
        </button>
      </form>

      <form action={resend} style={{ textAlign: "center" }}>
        <input type="hidden" name="service" value={service} />
        <button
          type="submit"
          disabled={resendDisabled}
          style={{
            background: "none",
            border: "none",
            color: "#2563eb",
            cursor: resendDisabled ? "default" : "pointer",
            textDecoration: "underline",
            padding: 0,
            fontSize: 14,
            opacity: resendDisabled ? 0.6 : 1,
          }}
        >
          {cooldown > 0 ? `コードを再送信（${cooldown} 秒後に可能）` : resending ? "送信中…" : "コードを再送信"}
        </button>
      </form>
    </div>
  );
}
