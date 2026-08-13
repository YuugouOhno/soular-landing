// リクエストヘッダーからクライアント IP を取り出す。
// Vercel/プロキシ経由では x-forwarded-for の先頭が実クライアント IP。
// 取得できなければ "unknown" を返す (レート制限側で IP 制限をスキップする)。
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
