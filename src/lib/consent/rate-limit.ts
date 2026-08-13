import "server-only";

// soular 側の軽量レート制限。
//
// ⚠️ best-effort。実行インスタンスごとのメモリなので厳密ではなく、
// インスタンスが増えるほど緩くなる。**本来の防衛線は各サービス側の API**
// （DB を持つのはそちらなので fail-closed なレート制限が組める）。
// ここでは「明らかな連打を入口で削る」程度の役割に留める。

type Bucket = { hits: number[]; max: number; windowMs: number };

const buckets = new Map<string, Bucket>();

export function hitLimit(key: string, max: number, windowMs: number, now: number): boolean {
  const b = buckets.get(key) ?? { hits: [], max, windowMs };
  b.hits = b.hits.filter((t) => now - t < windowMs);
  b.hits.push(now);
  buckets.set(key, b);

  // 古くなったエントリを掃除（メモリ肥大の抑制）。
  for (const [k, v] of buckets) {
    if (v.hits.every((t) => now - t >= v.windowMs)) buckets.delete(k);
  }
  return b.hits.length > max;
}

/** 合言葉の総当たり抑止（IP 毎 10分に10回）。 */
export function isGateAttemptLimited(ip: string): boolean {
  if (!ip || ip === "unknown") return false;
  return hitLimit(`gate:${ip}`, 10, 10 * 60 * 1000, Date.now());
}

/** フォーム送信の連打抑止（IP 毎 1時間に10件）。 */
export function isSubmitLimited(ip: string): boolean {
  if (!ip || ip === "unknown") return false;
  return hitLimit(`submit:${ip}`, 10, 60 * 60 * 1000, Date.now());
}
