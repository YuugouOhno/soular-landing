// 問い合わせフォームの受け口。移行前は Cloudflare Worker (worker/index.ts) が
// 担っていたエンドポイントを Route Handler へ移設したもの。
// Resend REST API へ直接 POST する構成は変えていない。

import { NextResponse } from "next/server";
import {
  CONTACT_TO,
  buildContactHtml,
  isRateLimited,
  parseContactInput,
  str,
  subjectSafe,
} from "@/lib/contact";

// メモリ上のレート制限を持つため、静的化・キャッシュはさせない。
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function getClientIp(request: Request): string {
  const h = request.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: "invalid body" }, 400);
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return json({ error: "invalid body" }, 400);
  }
  const body = raw as Record<string, unknown>;

  // レート制限を honeypot 分岐より先に適用し、単純 bot の連投コストも抑える。
  const ip = getClientIp(request);
  if (ip !== "unknown" && isRateLimited(ip, Date.now())) {
    return json({ error: "too many requests" }, 429);
  }

  // honeypot: bot が埋めがちな不可視フィールド。値が入っていたら黙って成功扱いで破棄。
  if (str(body._hp)) {
    console.info("[contact] honeypot triggered", { ip });
    return json({ ok: true });
  }

  const parsed = parseContactInput(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    // 設定漏れで黙って握りつぶすと「送ったのに届かない」になるため、明示的に失敗させる。
    console.error("[contact] missing RESEND_API_KEY or RESEND_FROM_EMAIL");
    return json({ error: "send failed" }, 500);
  }

  const fromName = process.env.RESEND_FROM_NAME;
  const from = fromName ? `${fromName.replace(/[\r\n]/g, "")} <${fromEmail}>` : fromEmail;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: CONTACT_TO,
        subject: subjectSafe(`【soular お問い合わせ】${parsed.data.company || parsed.data.name}`),
        html: buildContactHtml(parsed.data),
      }),
    });
    if (!res.ok) {
      console.error("[contact] resend failed", res.status, await res.text());
      return json({ error: "send failed" }, 500);
    }
    return json({ ok: true });
  } catch (err) {
    console.error("[contact] send failed", err);
    return json({ error: "send failed" }, 500);
  }
}
