# soular-landing

株式会社soular のコーポレートサイト（https://soular-inc.com/）。

Next.js (App Router) + TypeScript。ホスティングは Vercel。
**Vite SPA + Cloudflare Workers からの移行は完了済み**で、
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

## テスト

```bash
npm test                 # vitest（src/**/__tests__）
npx playwright install chromium   # 初回のみ
npm run test:e2e         # next build → next start + モック受信側に Playwright（e2e/local）
npm run test:synthetic   # 本番 https://soular-inc.com への読み取り専用チェック（e2e/synthetic）
```

- E2E は **本物のメールを送らない**（RESEND_API_KEY 空で起動し、有効な問い合わせはサーバーへ送らない）。
  事前確認の中継先は `e2e/support/mock-service.mjs`（HMAC 署名を検証するモック）。
- synthetic は本番に対して GET と「必ず 400 になる POST」しかしない。正規送信を足さないこと。
  CI では `synthetic.yml`（毎日 + 手動）で動く。
- ビジュアル回帰（`e2e/local/visual.spec.ts`）の基準画像は CI(Linux) 用のみで、macOS では skip される。
  見た目を意図的に変えたら `gh workflow run verify.yml --ref <branch> -f update_snapshots=true` →
  artifact `visual-snapshots` を `e2e/local/visual.spec.ts-snapshots/` に置いてコミットする。

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

## 移行後の注意

- 旧 Cloudflare Worker 構成（`worker/` と `wrangler.jsonc`）は撤去済み。
  必要になったら `git log -- worker wrangler.jsonc` から復元できる。
- 見た目は移行前と 1px も変えない方針。`globals.css` は旧実装の CSS をそのまま移設したもので、
  整形・最適化は別途行う。
