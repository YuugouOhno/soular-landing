// 契約前に提示する法務文書のバージョン管理。
// サービス × 文書 (利用規約・プライバシー・重要事項説明書) ごとに版を持つ。
// 文面を改定したら該当の版を更新する。
// consent_submissions.{terms,privacy,important}_version に保存され、後から
// 「当時のどの版に同意したか」を立証できる。

// 申込を受け付けるサービスの正本。**増やすときはここだけを直す。**
// 許可リストを他所に複製すると、片方だけ古くなって「画面には出るのに
// 送信すると無言で弾かれる」状態になる（2026-08-16 に aichat で実際に起きた）。
export const LEGAL_SERVICES = ["dental", "medical", "aichat"] as const;

export type LegalService = (typeof LEGAL_SERVICES)[number];

export type DocVersions = { terms: string; privacy: string; important: string };

export const POLICY_VERSIONS: Record<LegalService, DocVersions> = {
  dental: { terms: "2026-06-20", privacy: "2026-06-20", important: "2026-06-22" },
  medical: { terms: "2026-06-20", privacy: "2026-06-20", important: "2026-06-22" },
  // まごころAIチャット。版は aichat 側 policy.ts の定数と一致させること
  // (CURRENT_POLICY_VERSION / IMPORTANT_MATTERS_VERSION)。
  aichat: { terms: "2026-06-25", privacy: "2026-06-25", important: "2026-06-25" },
};

export function isLegalService(value: string | null | undefined): value is LegalService {
  return LEGAL_SERVICES.includes(value as LegalService);
}

export function policyVersionsFor(service: LegalService): DocVersions {
  return POLICY_VERSIONS[service];
}
