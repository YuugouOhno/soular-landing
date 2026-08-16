import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import { legalDocText, policyVersionsFor, resolveLegalDoc } from "@/lib/legal";

// aichat（soular-aichat-for-hp）側は、届いた本文を自分で再生成して照合する。
// つまり両リポの生成結果は **完全に一致していなければならない**。ズレると
// 申込が document_mismatch で全部弾かれる。
//
// 下のハッシュは aichat 側 src/lib/legal/__tests__/soular-doc.test.ts と同じ値。
// 文面を変えるときは **両リポを同時に更新**すること。片方だけだとここが落ちる。
const EXPECTED: Record<string, string> = {
  "3y/nofees": "db4c860cc436abca49e302b0244a4708355f29dee4db20eb66dda7b237f4ecd4",
  "3y/fees": "cf197bcbdef8b02536a793427f328a394cf3deccd2fbd79c3cd1758e1ef79c6a",
  "5y/nofees": "206c4d6053f19f994bb0f472c40d76027827396b470ec871a578961919298679",
  "5y/fees": "66e6f55e241eda6f7cbcec5e07835971f96c753728ca9d065277db75a8a0da90",
};

describe("まごころAIチャットの重要事項説明書", () => {
  it("aichat 側と同じ本文を生成する（ハッシュ固定）", () => {
    const version = policyVersionsFor("aichat").important;
    for (const plan of ["3y", "5y"] as const) {
      for (const [label, fees] of [
        ["nofees", null],
        ["fees", { initialFeeYen: 0, monthlyFeeYen: 39800 }],
      ] as const) {
        const text = legalDocText(version, resolveLegalDoc("aichat", "important", plan, fees));
        const hash = createHash("sha256").update(text).digest("hex");
        expect(hash, `${plan}/${label}`).toBe(EXPECTED[`${plan}/${label}`]);
      }
    }
  });

  it("利用規約・プライバシーはプランで変わらない", () => {
    for (const kind of ["terms", "privacy"] as const) {
      expect(resolveLegalDoc("aichat", kind, "5y")).toEqual(resolveLegalDoc("aichat", kind, "3y"));
    }
  });

  it("移設した規約類が欠けていない（条数の回帰防止）", () => {
    expect(resolveLegalDoc("aichat", "terms").sections).toHaveLength(14);
    expect(resolveLegalDoc("aichat", "privacy").sections).toHaveLength(17);
    expect(resolveLegalDoc("aichat", "important").sections).toHaveLength(6);
  });
});
