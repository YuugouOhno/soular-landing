# soular-landing

株式会社soular のコーポレートサイト（https://soular-inc.com/）。

Next.js (App Router) + TypeScript。**Vite SPA + Cloudflare Workers からの移行中**で、
移行の設計と手順は [`docs/nextjs-migration-design.md`](docs/nextjs-migration-design.md) にある。

## 開発

```bash
npm install
cp .env.example .env.local   # RESEND_API_KEY を入れる
npm run dev                  # http://localhost:3000
```

```bash
npm run build      # 本番ビルド
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## 構成

```
src/
├── app/
│   ├── layout.tsx            # metadata / JSON-LD / フォント / まごころAI ウィジェット
│   ├── page.tsx              # セクションを並べるだけの Server Component
│   ├── globals.css           # ランディングのスタイル一式
│   └── api/contact/route.ts  # 問い合わせ → Resend
├── components/landing/       # セクション別コンポーネント
├── data/landing.ts           # 表示コンテンツ（文言・リンクはここを触る）
└── lib/contact.ts            # 問い合わせの検証・整形・レート制限
```

状態を持つのは `Nav`（ドロワー）/ `Topics`（スライダー）/ `ContactForm` / `ObfuscatedMail` と、
ページ全体の演出を担う `LandingRoot` のみ。残りは Server Component。

## 移行中の注意

- `worker/` と `wrangler.jsonc` は**旧 Cloudflare Worker 構成**。ロールバック用に
  移行完了（設計書の Phase 4）まで残してある。lint・tsc の対象からは外している。
- 見た目は移行前と 1px も変えない方針。`globals.css` は旧実装の CSS をそのまま移設したもので、
  整形・最適化は移行完了後に別途行う。
