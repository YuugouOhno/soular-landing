import { StartForm } from "./_start-form";
import { startPrecontractAction } from "./actions";

// 申込のスタート画面。ここで営業が条件（サービス・プラン・金額）と合言葉を入力し、
// 送信すると条件が確定して /precontract/[service]/apply へ進む。
// 将来 aichat / りぴちゃんもこの画面からまとめて申し込めるようにする。

export const metadata = {
  title: "ご契約前の事前確認",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function PrecontractStartPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
      <section
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 32,
        }}
      >
        <p style={{ margin: 0, color: "#2563eb", fontWeight: 700 }}>ご契約前の事前確認</p>
        <h1 style={{ marginTop: 10, fontSize: 22 }}>お申し込み内容の確認</h1>
        <p style={{ color: "#6b7280", lineHeight: 1.7, fontSize: 14 }}>
          この画面は関係者限定です。担当者とご一緒に、お申し込みいただくサービスと
          ご契約条件をご確認ください。次の画面で重要事項説明書・利用規約・
          プライバシーポリシーをご確認いただきます。
        </p>
        <StartForm action={startPrecontractAction} />
      </section>
    </main>
  );
}
