// 契約前に提示する法務文書 (利用規約・プライバシーポリシー・重要事項説明書) の
// 構造化スキーマ。この型を唯一の出典 (SSoT) とし、
//   - /precontract/[service]/legal/[doc] ページの表示
//   - 同意ログに残す document_hash の算出 (legalDocText)
//   - PDF 生成 (scripts/generate-legal-pdfs.mjs)
// がすべてここから導出される。表示内容とハッシュが必ず一致する。

export type LegalDocKind = "terms" | "privacy" | "important";

export type LegalSection = { heading: string; body: string[] };

export type LegalDoc = {
  kind: LegalDocKind;
  title: string;
  subtitle?: string;
  intro: string[];
  sections: LegalSection[];
  company: string[];
};

export const LEGAL_DOC_LABEL: Record<LegalDocKind, string> = {
  terms: "利用規約",
  privacy: "プライバシーポリシー",
  important: "重要事項説明書",
};

// document_hash 算出のための正規化テキスト。版 + 表示する全文を連結する。
// 1文字でも変えればハッシュが変わるため、同意済みの内容を後から改竄していない
// ことの証跡になる。
export function legalDocText(version: string, doc: LegalDoc): string {
  return [
    `version:${version}`,
    doc.title,
    doc.subtitle ?? "",
    ...doc.intro,
    ...doc.sections.flatMap((s) => [s.heading, ...s.body]),
    ...doc.company,
  ].join("\n");
}
