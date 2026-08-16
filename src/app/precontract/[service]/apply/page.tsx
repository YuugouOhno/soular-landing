import { notFound, redirect } from "next/navigation";
import { isLegalService } from "@/lib/legal";
import { isGateUnlocked } from "@/lib/consent/gate";
import { conditionsFingerprint, readConditions } from "@/lib/consent/conditions";
import { resolveServiceLabel } from "@/lib/branding";
import { submitConsentAction } from "./actions";
import { ConsentForm } from "./_form";

// 申込フォーム。条件（サービス・プラン・金額）はスタート画面で確定済みで、
// ここでは **表示のみ・変更不可**。条件は署名付き cookie からのみ読む。

export const metadata = {
  title: "ご契約前の事前確認",
  robots: { index: false, follow: false },
};

// cookie で内容が変わるため、必ずリクエスト毎に描画する。
export const dynamic = "force-dynamic";

export default async function PrecontractApplyPage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  if (!isLegalService(service)) notFound();

  // ゲート通過と条件確定の両方が揃っていなければスタート画面へ戻す。
  const [unlocked, conditions] = await Promise.all([isGateUnlocked(), readConditions()]);
  if (!unlocked || !conditions) redirect("/precontract");

  // cookie の service と URL の service が食い違う場合も差し戻す
  // (cookie の path が /precontract 全体に効いているため必ず突き合わせる)。
  if (conditions.service !== service) redirect("/precontract");

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
        <h1 style={{ marginTop: 10, fontSize: 22 }}>
          {resolveServiceLabel(service)} 事前確認フォーム
        </h1>
        <p style={{ color: "#6b7280", lineHeight: 1.7, fontSize: 14 }}>
          ご契約に先立ち、重要事項説明書・利用規約・プライバシーポリシーをご確認のうえ、
          内容にご同意いただくためのフォームです。ご入力後、メールでの本人確認をお願いします。
        </p>
        {/* 条件が変わったらツリーごと作り直し、チェック状態の持ち越しを防ぐ */}
        <ConsentForm
          key={conditionsFingerprint(conditions)}
          service={service}
          conditions={conditions}
          action={submitConsentAction}
        />
      </section>
    </main>
  );
}
