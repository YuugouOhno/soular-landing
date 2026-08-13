import { notFound } from "next/navigation";
import { isLegalService, resolveContractPlan } from "@/lib/legal";
import { resolveServiceLabel } from "@/lib/branding";
import { isGateUnlocked } from "@/lib/consent/gate";
import { submitConsentAction } from "./actions";
import { unlockGateAction } from "./gate-actions";
import { ConsentForm } from "./_form";
import { GatePrompt } from "./_gate";

export const metadata = {
  title: "ご契約前の事前確認",
  robots: { index: false, follow: false },
};

// 表示内容がゲート通過 cookie に依存するため、必ずリクエスト毎に描画する
// (静的プリレンダリングされると常にゲート画面が固定表示されてしまう)。
export const dynamic = "force-dynamic";

export default async function PrecontractPage({
  params,
  searchParams,
}: {
  params: Promise<{ service: string }>;
  searchParams: Promise<{ plan?: string }>;
}) {
  const { service } = await params;
  if (!isLegalService(service)) notFound();

  // 契約プランは URL クエリで持ち回す (営業がリンクを組み立てて共有できるように)。
  // 不正値・未指定は既定プランに倒れる。
  const plan = resolveContractPlan((await searchParams).plan);

  const unlocked = await isGateUnlocked();
  const label = resolveServiceLabel(service);

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
        <h1 style={{ marginTop: 10, fontSize: 22 }}>{label} 事前確認フォーム</h1>
        {unlocked ? (
          <>
            <p style={{ color: "#6b7280", lineHeight: 1.7, fontSize: 14 }}>
              ご契約に先立ち、重要事項説明書・利用規約・プライバシーポリシーをご確認のうえ、
              内容にご同意いただくためのフォームです。ご入力後、メールでの本人確認をお願いします。
            </p>
            <ConsentForm service={service} plan={plan} action={submitConsentAction} />
          </>
        ) : (
          <>
            <p style={{ color: "#6b7280", lineHeight: 1.7, fontSize: 14 }}>
              このフォームは関係者限定です。担当者からお伝えした合言葉を入力してください。
            </p>
            <GatePrompt service={service} plan={plan} action={unlockGateAction} />
          </>
        )}
      </section>
    </main>
  );
}
