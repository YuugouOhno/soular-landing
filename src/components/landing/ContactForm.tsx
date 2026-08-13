"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status !== "idle" && status !== "error") return;
    setStatus("sending");

    const fd = new FormData(e.currentTarget);
    const body = {
      company: fd.get("company") || "",
      name: fd.get("name") || "",
      email: fd.get("email") || "",
      phone: fd.get("phone") || "",
      message: fd.get("message") || "",
      _hp: fd.get("_hp") || "", // honeypot
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="cf-done">
        <strong>お問い合わせを受け付けました</strong>
        <span>ご連絡ありがとうございます。内容を確認のうえ、担当者よりご返信いたします。</span>
      </div>
    );
  }

  const disabled = status === "sending";

  return (
    <form className="cf" onSubmit={handleSubmit}>
      {/* honeypot: 人間には見えない。bot が埋めたら破棄される */}
      <input className="cf-hp" type="text" name="_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="cf-field">
        <label htmlFor="cf-company">会社・お名前など</label>
        <input id="cf-company" name="company" type="text" disabled={disabled} placeholder="株式会社〇〇" />
      </div>

      <div className="cf-row">
        <div className="cf-field">
          <label htmlFor="cf-name">お名前 <span className="req">*</span></label>
          <input id="cf-name" name="name" type="text" required disabled={disabled} placeholder="山田 太郎" />
        </div>
        <div className="cf-field">
          <label htmlFor="cf-phone">電話番号</label>
          <input id="cf-phone" name="phone" type="tel" disabled={disabled} placeholder="03-0000-0000" />
        </div>
      </div>

      <div className="cf-field">
        <label htmlFor="cf-email">メールアドレス <span className="req">*</span></label>
        <input id="cf-email" name="email" type="email" required disabled={disabled} placeholder="example@example.com" />
      </div>

      <div className="cf-field">
        <label htmlFor="cf-message">お問い合わせ内容 <span className="req">*</span></label>
        <textarea id="cf-message" name="message" rows={4} required disabled={disabled} placeholder="ご依頼・ご相談の内容をお気軽にご記入ください。" />
      </div>

      {status === "error" && (
        <div className="cf-note err">送信に失敗しました。お手数ですが時間をおいて再度お試しいただくか、下記メール宛にご連絡ください。</div>
      )}

      <button className="cf-submit" type="submit" disabled={disabled}>
        {disabled ? "送信中…" : "送信する →"}
      </button>
    </form>
  );
}
