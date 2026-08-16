import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readConditions } from "@/lib/consent/conditions";
import {
  isLegalService,
  resolveLegalDoc,
  policyVersionsFor,
  resolveContractPlan,
  contractPlanTerms,
  type LegalDocKind,
} from "@/lib/legal";

// 契約前フォームから開く法務文書ページ。サービス × 文書種別で本文を出し分ける。
// scripts/generate-legal-pdfs.mjs はこの URL を PDF 化する。

const DOC_KINDS: LegalDocKind[] = ["terms", "privacy", "important"];

export const dynamicParams = false;

export function generateStaticParams() {
  const services = ["dental", "medical"];
  return services.flatMap((service) => DOC_KINDS.map((doc) => ({ service, doc })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string; doc: string }>;
}): Promise<Metadata> {
  const { service, doc } = await params;
  if (!isLegalService(service) || !DOC_KINDS.includes(doc as LegalDocKind)) {
    return { title: "規約", robots: { index: false, follow: false } };
  }
  const d = resolveLegalDoc(service, doc as LegalDocKind);
  return { title: d.title, robots: { index: false, follow: false } };
}

export default async function PrecontractLegalDocPage({
  params,
  searchParams,
}: {
  params: Promise<{ service: string; doc: string }>;
  searchParams: Promise<{ plan?: string }>;
}) {
  const { service, doc } = await params;
  if (!isLegalService(service) || !DOC_KINDS.includes(doc as LegalDocKind)) notFound();

  const kind = doc as LegalDocKind;
  // 重説のみ契約プランで第1項が変わる (利用規約・プライバシーは不変)。
  // 金額は確定条件（署名付き cookie）からのみ取る。URL では変えられない。
  // 条件が無い/期限切れなら金額なしの版を表示する（プランは URL 指定を許容）。
  const conditions = await readConditions();
  const plan =
    conditions && conditions.service === service
      ? conditions.plan
      : resolveContractPlan((await searchParams).plan);
  const fees =
    conditions && conditions.service === service
      ? { initialFeeYen: conditions.initialFeeYen, monthlyFeeYen: conditions.monthlyFeeYen }
      : null;
  const d = resolveLegalDoc(service, kind, plan, fees);
  const version = policyVersionsFor(service)[kind];

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 16px", color: "#18181b" }}>
      <article>
        <h1 style={{ fontSize: 24, lineHeight: 1.4, marginBottom: 6 }}>{d.title}</h1>
        {d.subtitle ? (
          <p style={{ color: "#6b7280", fontSize: 14, marginTop: 0 }}>{d.subtitle}</p>
        ) : null}
        <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 0 }}>
          版: {version}
          {/* 重説は契約プランで本文が変わるため、PDF 化しても判別できるよう明記する。 */}
          {kind === "important" ? `／契約プラン: ${contractPlanTerms(plan).label}` : ""}
        </p>

        {d.intro.map((p, i) => (
          <p key={`intro-${i}`} style={{ fontSize: 14, lineHeight: 1.9, margin: "12px 0" }}>
            {p}
          </p>
        ))}

        {d.sections.map((section, si) => (
          <section key={`sec-${si}`} style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>{section.heading}</h2>
            {section.body.map((p, pi) => (
              <p key={`sec-${si}-p-${pi}`} style={{ fontSize: 14, lineHeight: 1.9, margin: "8px 0" }}>
                {p}
              </p>
            ))}
          </section>
        ))}

        <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "32px 0 16px" }} />
        <div style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.8 }}>
          {d.company.map((line, i) => (
            <div key={`co-${i}`}>{line}</div>
          ))}
        </div>
      </article>
    </main>
  );
}
