// Cloudflare Worker (Static Assets 構成)。
// /api/contact への POST だけをこの Worker が処理し、それ以外は静的アセット(dist)へフォールスルーする。
// 問い合わせは Resend REST API 経由でメール送信する（新規 SaaS なし・Cloudflare 内蔵サーバーレス）。

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  RESEND_FROM_NAME?: string;
}

// 通知先（3サイト共通）。
const TO = "s-hamada@soular-inc.com";

// 軽量レート制限（best-effort。isolate ごとのメモリなので厳密ではない。主防御は honeypot）。
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // 直近アクセスの無い他IPの空エントリを掃除（メモリ肥大の抑制）。
  for (const [k, v] of hits) {
    if (v.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(k);
  }
  return recent.length > RATE_LIMIT_MAX;
}

// 入力を必ず文字列にし trim する。非文字列(数値/配列等)が来ても安全側に倒す。
const MAX_LEN = 5000;
function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

// 件名に入る値の改行・制御文字を除去し切り詰める。
function subjectSafe(v: string): string {
  return v.replace(/[\r\n]+/g, " ").slice(0, 120);
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleContact(request: Request, env: Env): Promise<Response> {
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
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  if (isRateLimited(ip)) return json({ error: "too many requests" }, 429);

  // honeypot: bot が埋めがちな不可視フィールド。値が入っていたら黙って成功扱いで破棄。
  if (str(body._hp)) {
    console.info("[contact] honeypot triggered", { ip });
    return json({ ok: true });
  }

  const company = str(body.company);
  const name = str(body.name);
  const email = str(body.email);
  const phone = str(body.phone);
  const message = str(body.message);
  if (!name || !email || !message) return json({ error: "missing required fields" }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "invalid email" }, 400);
  if (company.length > 200 || name.length > 100 || phone.length > 50 || message.length > MAX_LEN) {
    return json({ error: "field too long" }, 400);
  }

  const html = `
<table style="font-family:sans-serif;font-size:14px;line-height:1.8;color:#0a1330;max-width:600px;margin:0 auto;border-collapse:collapse">
  <tr><td colspan="2" style="padding:20px 0 12px;border-bottom:2px solid #1f6dff">
    <strong style="font-size:16px">【soular お問い合わせ】</strong>
  </td></tr>
  <tr><td style="padding:10px 16px 10px 0;white-space:nowrap;color:#4e5a7e;vertical-align:top">会社・お名前など</td><td style="padding:10px 0">${esc(company) || "—"}</td></tr>
  <tr><td style="padding:10px 16px 10px 0;white-space:nowrap;color:#4e5a7e;vertical-align:top">お名前</td><td style="padding:10px 0">${esc(name)}</td></tr>
  <tr><td style="padding:10px 16px 10px 0;white-space:nowrap;color:#4e5a7e;vertical-align:top">メール</td><td style="padding:10px 0"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
  <tr><td style="padding:10px 16px 10px 0;white-space:nowrap;color:#4e5a7e;vertical-align:top">電話番号</td><td style="padding:10px 0">${esc(phone) || "—"}</td></tr>
  <tr><td style="padding:10px 16px 10px 0;white-space:nowrap;color:#4e5a7e;vertical-align:top">お問い合わせ内容</td><td style="padding:10px 0;white-space:pre-wrap">${esc(message)}</td></tr>
</table>
`.trim();

  const from = env.RESEND_FROM_NAME
    ? `${env.RESEND_FROM_NAME.replace(/[\r\n]/g, "")} <${env.RESEND_FROM_EMAIL}>`
    : env.RESEND_FROM_EMAIL;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: TO,
        subject: subjectSafe(`【soular お問い合わせ】${company || name}`),
        html,
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") return json({ error: "method not allowed" }, 405);
      return handleContact(request, env);
    }
    // それ以外は静的アセット（SPA）へ。
    return env.ASSETS.fetch(request);
  },
};
