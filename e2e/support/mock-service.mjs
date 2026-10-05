// E2E 用のモック受信側（HRMS / aichat の代役）。
//
// soular の Server Action が PRECONTRACT_*_URL へ中継するリクエストを受け、
// docs/precontract-api-contract.md §3 のとおりに HMAC 署名を検証する。
// 署名が合わなければ 401 を返すので、署名が壊れると E2E が落ちる。
//
// 本物のサービスには一切つながない。メールも送らない。
// テストは GET /__received で受信記録（署名検証結果つき）を読める。

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_SERVICE_PORT ?? 4010);
const SECRET = process.env.MOCK_SERVICE_SECRET ?? "e2e-mock-secret";
/** モックが受け付ける正しい OTP。 */
const VALID_CODE = "123456";
const MAX_SKEW_SECONDS = 5 * 60;

/** @type {{path: string, signatureValid: boolean, body: any, createdId?: string}[]} */
const received = [];
/** submissionId → { service, email, status } */
const submissions = new Map();

function verifySignature(rawBody, timestamp, signatureHeader) {
  if (!timestamp || !signatureHeader?.startsWith("sha256=")) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > MAX_SKEW_SECONDS) return false;
  const expected = createHmac("sha256", SECRET).update(`${timestamp}.${rawBody}`).digest("hex");
  const got = signatureHeader.slice("sha256=".length);
  const a = Buffer.from(expected);
  const b = Buffer.from(got);
  return a.length === b.length && timingSafeEqual(a, b);
}

function mask(email) {
  const [local, domain] = String(email).split("@");
  return `${local.slice(0, 2)}***@${domain}`;
}

function send(res, status, data) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = createServer((req, res) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const url = new URL(req.url ?? "/", "http://localhost");

    if (req.method === "GET" && url.pathname === "/__health") return send(res, 200, { ok: true });
    if (req.method === "GET" && url.pathname === "/__received") return send(res, 200, received);
    if (req.method === "POST" && url.pathname === "/__reset") {
      received.length = 0;
      submissions.clear();
      return send(res, 200, { ok: true });
    }

    if (req.method !== "POST") return send(res, 405, { error: "method not allowed" });

    const rawBody = Buffer.concat(chunks).toString("utf8");
    const signatureValid = verifySignature(
      rawBody,
      req.headers["x-soular-timestamp"],
      req.headers["x-soular-signature"],
    );
    let body = null;
    try {
      body = JSON.parse(rawBody);
    } catch {
      /* body は null のまま */
    }
    const entry = { path: url.pathname, signatureValid, body };
    received.push(entry);
    if (!signatureValid) return send(res, 401, { error: "invalid signature" });

    switch (url.pathname) {
      case "/api/consents": {
        const id = randomUUID();
        entry.createdId = id;
        submissions.set(id, {
          service: body.service,
          email: body.applicant?.email ?? "",
          status: "pending",
        });
        return send(res, 201, { submissionId: id });
      }
      case "/api/consents/status": {
        const s = submissions.get(body?.submissionId);
        if (!s) return send(res, 404, { error: "not found" });
        return send(res, 200, { service: s.service, status: s.status, emailMasked: mask(s.email) });
      }
      case "/api/consents/verify": {
        const s = submissions.get(body?.submissionId);
        if (!s) return send(res, 404, { status: "not_found" });
        if (s.status === "verified") return send(res, 200, { status: "already_used" });
        if (body.code !== VALID_CODE) return send(res, 400, { status: "invalid" });
        s.status = "verified";
        return send(res, 200, { status: "ok" });
      }
      case "/api/consents/resend":
        return send(res, 200, { status: "sent" });
      default:
        return send(res, 404, { error: "not found" });
    }
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[mock-service] listening on http://127.0.0.1:${PORT}`);
});
