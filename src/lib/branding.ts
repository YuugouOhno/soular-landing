// サービス表示名の解決を一箇所に集約する。
// soular が申込フォームを集約するため、HRMS の 2 ブランドに加えて
// 今後 aichat / りぴちゃん も同じ規則で並べられる形にしてある。

export const SYSTEM_BRAND = "soular";

/** サービスキーから顧客向けの表示名を決める。 */
export function resolveServiceLabel(service: string | null | undefined): string {
  switch (service) {
    case "dental":
      return "HRMS デンタルマネージャー";
    case "medical":
      return "HRMS メディマネージャー";
    case "aichat":
      return "まごころAIチャット";
    case "ripichan":
      return "ラインメイドりぴちゃん";
    default:
      return SYSTEM_BRAND;
  }
}
