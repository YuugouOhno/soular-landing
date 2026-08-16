import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { isLegalService } from "@/lib/legal";
import { CONSENT_SID_COOKIE, isValidSubmissionId } from "@/lib/consent/cookie";
import { fetchConsentStatus } from "@/lib/consent/service-client";
import { resendConsentOtpAction, verifyConsentOtpAction } from "./actions";
import { VerifyForm } from "./_verify-form";

export const metadata = {
  title: "本人確認",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const shell: React.CSSProperties = { maxWidth: 520, margin: "0 auto", padding: "32px 16px" };
const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 32,
};

export default async function PrecontractVerifyPage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  if (!isLegalService(service)) notFound();

  const store = await cookies();
  const sid = store.get(CONSENT_SID_COOKIE)?.value;
  if (!isValidSubmissionId(sid)) redirect(`/precontract/${service}/apply`);

  // 状態はサービス側の API から取る（soular は同意データを保持しない）。
  // 受け取るのはマスク済みメールと状態だけで、素のアドレスは soular に渡らない。
  const submission = await fetchConsentStatus({ service, submissionId: sid });
  if (!submission) redirect(`/precontract/${service}/apply`);
  // URL の service と提出済みサービスが食い違う場合は正しい URL に正規化する
  // (dental で送信後に /precontract/medical/verify を開いた等)。
  if (submission.service !== service) redirect(`/precontract/${submission.service}/apply/verify`);

  const alreadyVerified = submission.status === "verified";

  if (alreadyVerified) {
    return (
      <main style={shell}>
        <section style={card}>
          <p style={{ margin: 0, color: "#2563eb", fontWeight: 700 }}>本人確認</p>
          <h1 style={{ marginTop: 10, fontSize: 22 }}>お手続きが完了しました</h1>
          <div style={{ border: "1px solid #9bd4c7", borderRadius: 14, padding: 14, marginTop: 12 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>本人確認が完了しました ✓</p>
            <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.7 }}>
              ご同意の内容を確かに承りました。控えをメールでお送りしています。
              追って担当者よりシステム利用契約書をお送りいたします。この画面は閉じていただいて構いません。
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={shell}>
      <section style={card}>
        <p style={{ margin: 0, color: "#2563eb", fontWeight: 700 }}>本人確認</p>
        <h1 style={{ marginTop: 10, fontSize: 22 }}>確認コードの入力</h1>
        <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
          <strong>{submission.emailMasked}</strong> 宛に 6 桁の確認コードをお送りしました。
          メール（迷惑メールフォルダも）をご確認のうえ、コードを入力してください。
        </p>
        <VerifyForm
          service={service}
          resendAction={resendConsentOtpAction}
          verifyAction={verifyConsentOtpAction}
        />
      </section>
    </main>
  );
}
