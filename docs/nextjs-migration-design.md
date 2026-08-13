# soular-landing Next.js 移行 設計書

**目的**: soular-landing を Vite SPA (Cloudflare Workers) から Next.js + TypeScript へ移行し、
将来的に申込フォーム（precontract）を soular ドメインに統一できる土台を作る。

**絶対条件**: **本番 HP を止めない。** いつでも数分で元に戻せる状態を保ったまま進める。

---

## 0. 結論（先に）

- 移行対象の**本番表面積は極めて小さい**（1ページ + 1API + 静的アセット）。技術的リスクは低い。
- **唯一の実質的リスクは DNS 切替**。ここだけを慎重に設計すれば残りは安全に進められる。
- 見た目は**1px も変えない**。CSS は改変せずそのまま移す。リファクタは移行後の別件にする。
- 切替後も **Cloudflare Worker を消さない**。ロールバック＝DNS を戻すだけ、を数日維持する。

---

## 1. 現状の正確な把握

### 本番として動いているもの（これが全て）

| 面 | 実体 |
|---|---|
| ページ | `/` の 1 ルートのみ（`react-router` で単一 Route） |
| API | `/api/contact` の 1 本（Cloudflare Worker `worker/index.ts`） |
| 静的 | `public/`（画像・favicon・og-image） |
| 外部 | `magokoro-ai.com/magokoro-ai.js?tenant=soular-hp` を `<script async>` で読込 |

### 中身の実態（調査結果）

- **UI は `src/components/SoularLanding.jsx` の 751 行に全部入っている。**
  CSS も同ファイル内の 264 行の文字列を `<style dangerouslySetInnerHTML>` で注入している。
- **Tailwind は実質使われていない。** `index.css` で `@import "tailwindcss"` しているが、
  JSX 側は `.soular-new` 配下の独自クラスのみ。Tailwind ユーティリティの使用箇所はゼロ。
- **死んでいる依存**（import 箇所 0）:
  `three` / `vanta` / `framer-motion` / `lucide-react`。
  `react-router-dom` は単一ルートのためだけに使われている。
- **死んでいる CSS**: `index.css` の `@layer components`（`.hero-bg` `.btn-primary` 等）は
  オレンジ基調＋Unsplash 画像で、現行の青基調デザインと無関係。
  「新ランディングをルート(/)に昇格し旧実装を削除」時の消し残り。`App.css` は Vite の雛形のまま。

> **移行にとっては good news。** 実際に移すべきものは「1コンポーネント + 1CSS + 1API + メタデータ」だけで、
> 依存の大半とCSSの一部は移行時にそのまま捨てられる。

### ⚠️ 稼働ドメインの実測結果（2026-08-13・重要な訂正）

当初この設計書は稼働ドメインを `soular.co.jp` と想定していたが、**誤りだった。**

| ドメイン | 実測 |
|---|---|
| **`soular-inc.com`** | **HTTP 200。これが稼働中の本番。** `server: cloudflare` / `cf-ray` あり |
| `soular.co.jp` | **名前解決しない。JPRS whois で `No match` = 未登録** |
| `www.soular.co.jp` | 同上 |

**つまり切替対象は `soular-inc.com`。**

さらに、現行本番の `index.html` は canonical / og:url / twitter:url / JSON-LD の `url` と `logo` を
**すべて未登録の `soular.co.jp` に向けている**。検索エンジンに「正規URLは存在しないドメイン」と
宣言している状態で、実害のある SEO バグ。移行時にどう扱うかの判断が必要（第7章）。

### Cloudflare 側の構成（2026-08-13・API で実測確認済み）

| 項目 | 実測結果 |
|---|---|
| Cloudflare アカウント | `yuugou.purple@gmail.com`（Account ID `d7d189ab…`） |
| ゾーン | `soular-inc.com` — status `active` / Free プラン |
| ネームサーバー | `randall.ns.cloudflare.com` / `uma.ns.cloudflare.com`（**Cloudflare が権威 DNS**） |
| Worker | `soular-landing`（他に `relu-branch-hp` / `yuugou-portfolio` が同アカウントに存在） |
| **紐付け方式** | **Custom Domain**。`soular-inc.com` と `www.soular-inc.com` の**両方**が Worker に紐付く |
| Worker Routes | **なし**（`/zones/{id}/workers/routes` が空） |

**→ 切替手順は「Custom Domain 版」で確定。** Route が無いので、エッジでの横取りを心配する必要はなく、
Custom Domain を2つ外せばホスト名が解放される。

**www も対象**である点に注意（apex だけ切り替えると www が切替後に行き先を失う）。

#### DNS レコードだけ未取得

`wrangler login` の OAuth トークンには `zone:dns:read` が含まれず、DNS レコードの取得は
`Authentication error` になった（ゾーンのメタ情報は取得可）。現行の TTL・レコード内容は
**Cloudflare ダッシュボードで目視確認**するか、`Zone:DNS:Edit` 権限のスコープ付き API トークンを
別途発行すること。

なお Custom Domain 方式では対象レコードは Cloudflare/Workers が自動生成・管理する proxied レコードで、
Custom Domain を削除すると一緒に消える。

---

## 2. 移行先の選択

| | **Vercel**（推奨） | Cloudflare + `@opennextjs/cloudflare` |
|---|---|---|
| DNS 切替 | **必要**（唯一のリスク） | **不要**（ゼロカットオーバー） |
| 他2リポとの統一 | ○ hrms / aichat と同じ | × ここだけ別運用 |
| Next.js の機能追従 | ◎ 一次サポート | △ アダプタ経由。機能差・不具合の可能性 |
| 将来の申込フォーム | ◎ Server Actions・cookie・Supabase が素直 | △ 検証が必要 |
| 運用ナレッジ | 蓄積あり（`knowledge/development/cloudflare/vercel-integration.md`） | ほぼ無し |

**Vercel を推奨する。** 移行の目的が「他2リポと揃える」「将来ここに申込フォームを載せる」である以上、
Next.js の一次サポート環境に置くのが素直。DNS 切替リスクは Phase 設計で十分に管理できる。

> 「DNS を一切触りたくない」を最優先するなら `@opennextjs/cloudflare` もあり得る。
> ただし将来の申込フォーム（Server Actions + cookie + Supabase）で検証コストを払うことになる。

---

## 3. 本番を止めないための段階設計

### Phase 0 — 準備（**本番は一切変更しない**）

1. **DNS の現状を記録**（レコード・TTL・Proxy 状態）。`dig` と Cloudflare ダッシュボードの両方で。
2. **TTL を下げる**（例 300 秒）。切替の**数時間〜1日前**に実施。
   → これをやらないとロールバックに時間がかかる。**最重要の準備**。
3. **`RESEND_API_KEY` を確保。**
   ⚠️ **Cloudflare の secret は読み出せない。** Resend ダッシュボードで既存キーを確認するか、新規発行する。
4. **現行本番のベースラインを保存**。
   ```bash
   curl -s https://soular.co.jp/ > /tmp/baseline.html   # <head> 比較用
   ```

### Phase 1 — Next.js 版を構築（**本番は一切変更しない**）

ブランチ `feat/nextjs-migration` で作業。**この段階では何もデプロイしない。**

移植の原則: **出力を変えない。**

- **CSS**: 264行の文字列を `src/app/globals.css` へ**一字一句そのまま**移す。整形・最適化はしない。
- **メタデータ**: `index.html` の title / description / keywords / canonical / OG / Twitter / JSON-LD を
  Next.js Metadata API + `<script type="application/ld+json">` へ **1:1** で移植。
- **フォント**: Google Fonts の `<link>` は `layout.tsx` へ移動（`next/font` 化は移行後の別件）。
- **外部スクリプト**: magokoro-ai ウィジェットは `next/script`（`strategy="afterInteractive"`）。
- **`/api/contact`**: Worker のロジックを Route Handler へ移植。
  honeypot・レート制限・`escapeHtml`・件名の改行除去・長さ上限を**全部維持**する。
- **除去してよいもの**（出力に影響しないことを確認のうえ、**別コミット**で）:
  `three` / `vanta` / `framer-motion` / `lucide-react` / `react-router-dom`、
  `index.css` の死んだ `@layer components`、`App.css`。

**この段階の完了条件**: ローカルで `next build` が通り、見た目がベースラインと一致していること。

#### Phase 1 実施結果（2026-08-13・完了）

ブランチ `feat/nextjs-migration`。**デプロイ・DNS には一切触れていない。**

- `next build` / `eslint` / `tsc --noEmit` すべてクリーン。`/` は静的プリレンダリング、`/api/contact` は動的
- ローカル本番サーバで描画結果を検証: セクション id 10件・tile 11件（4+4+3）・
  ticker 10件（5件×2周）・`.ru` 21件・JSON-LD・全外部リンクを確認
- `/api/contact` の挙動を移行前と照合: 不正JSON/配列→400、必須欠落→400、不正メール→400、
  長さ超過→400、honeypot→200（送信せず）、設定漏れ→500、GET→405
- 依存を 21 → 9 パッケージに削減（死んでいた three / vanta / framer-motion / lucide-react /
  react-router-dom / vite / tailwind 系を除去）

**既知の差分（許容）**: `canonical` と `og:url` が `https://soular.co.jp`（末尾スラッシュなし）になる。
Next.js が既定で末尾スラッシュを正規化するため。ルートURLはスラッシュ有無が同一リソースとして
扱われるので実害はないが、厳密に揃えたい場合は `trailingSlash: true` を設定する。

**意図的に変えた点（1つだけ）**: ティッカーの複製方法。移行前は mount 後に
`track.innerHTML += track.innerHTML` で DOM を複製していたが、React の管理外で
ノードを増やす形は hydration と相性が悪いため、JSX 側で 2 周分描画する形にした。
**最終的な DOM は移行前と同じ**（10件）。

### Phase 2 — Vercel プレビューで検証（**本番は一切変更しない**）

Vercel にプロジェクトを作り、**プレビューURL**（`*.vercel.app`）でのみ検証する。DNS はまだ触らない。

検証項目:

- [ ] `<head>` を `/tmp/baseline.html` と diff（title / description / canonical / OG / Twitter / JSON-LD）
- [ ] 全セクションの表示（Hero / Ticker / Philosophy / Topics / Story / Domains / Policy / Company / CTA / Footer）
- [ ] 動的挙動: キーワード入れ替え、スライダー自動送り・ドット、スクロール連動フェードイン、
      数値カウントアップ、ナビの `is-stuck`、モバイルのドロワー
- [ ] レスポンシブ（560 / 640 / 900 / 980px のブレークポイント）
- [ ] `prefers-reduced-motion` で動きが止まること
- [ ] **問い合わせフォームの実送信テスト** ← 最重要。Resend が Vercel から通るか、
      差出人（`noreply@soular-inc.com`）と宛先（`s-hamada@soular-inc.com`）が現行と同一か
- [ ] honeypot が効くこと（`_hp` に値を入れて 200 かつメールが飛ばない）
- [ ] Lighthouse をベースラインと比較（特に SEO と CLS）

**ここを全部通るまで DNS には触らない。**

### Phase 3 — 切替

> **⚠️ 「Cloudflare を止める」のではない。** Worker スクリプトはロールバック経路そのものなので、
> 停止も削除もしない。切替時に外すのは **ドメインの紐付け（Custom Domain / Route）だけ**。
>
> なぜ紐付けを外す必要があるか:
> - **Custom Domain** の場合、Cloudflare が Worker 所有の proxied DNS レコードを自動生成しており、
>   これがある限り同じホスト名に Vercel 向けのレコードを置けない。
> - **Route**（`soular-inc.com/*` 等）の場合、DNS が Vercel を指していても
>   **エッジで先に Worker が横取りする**ため、そもそも Vercel に到達しない。

実測にもとづく確定手順（Custom Domain 方式・apex と www の2本）。

**事前（切替の数時間〜1日前）**

- 現行 DNS の TTL を確認し、下げられるなら 300 秒程度にしておく（ロールバックを速くするため）

**当日**

1. **Vercel にドメインを追加**（先にやる。未追加のまま DNS を向けると証明書が発行できない）
   ```bash
   vercel domains add soular-inc.com
   vercel domains add www.soular-inc.com
   ```
   この時点では `misconfigured` 表示で正常。
2. **Cloudflare で Worker の Custom Domain を2つとも外す**
   Workers & Pages → `soular-landing` → Settings → Domains & Routes →
   `soular-inc.com` と `www.soular-inc.com` を削除。
   **Worker スクリプト自体は消さない**（これがロールバック経路）。
   Custom Domain の削除で、対応する proxied DNS レコードも一緒に消える。
3. **DNS を Vercel に向ける**（DNS-only = グレー雲を推奨）
   | 名前 | 種別 | 値 | Proxy |
   |---|---|---|---|
   | `@` | **A** | `76.76.21.21` | OFF（グレー） |
   | `www` | **CNAME** | `cname.vercel-dns.com` | OFF（グレー） |

   Proxied（オレンジ雲）を維持する選択もあるが、その場合 **SSL/TLS を必ず Full (strict)** に。
   忘れるとリダイレクトループになる。コーポレートサイトなので DNS-only で十分。
4. **証明書の発行を確認**
   ```bash
   vercel domains inspect soular-inc.com
   ```
5. **切替直後の確認**
   - `curl -sI https://soular-inc.com/` → 200 かつ `cf-ray` が**消えている**こと（= Cloudflare を経由していない）
   - `https://www.soular-inc.com/` が apex に寄るか、同じ内容を返すこと
   - **フォームを実送信**して浜田さん宛に届くこと
   - `<head>` の canonical / OG / JSON-LD

**ロールバック**: Cloudflare で Worker の Custom Domain を2つ**再登録するだけ**。
Worker は生きたままなので再デプロイも secret 再設定も不要。DNS レコードも Custom Domain の
登録時に自動で戻る。TTL を下げてあれば数分で復旧する。

**ロールバック**: Cloudflare で Worker の Custom Domain / Route を**戻すだけ**。
Worker は生きたままなので、再デプロイも secret の再設定も不要で数分で復旧する。
これが「Worker を止めない」ことの意味。

### Phase 4 — 後片付け（**数日〜1週間後**）

問題が出ないことを確認してから、`wrangler.jsonc` と `worker/` を削除する。急がない。

### ロールバック手順

| 事象 | 対応 |
|---|---|
| 切替後に不具合 | **DNS を元に戻す。** TTL を下げてあるので数分で復旧。Worker は生きたまま |
| フォームだけ壊れた | 同上（部分ロールバックはしない。切り分けはプレビューで済ませておく） |
| Phase 2 で問題発覚 | 本番は無傷。ブランチで直してやり直すだけ |

---

## 4. 移行後の構成（hrms / aichat に合わせる）

```
src/
├── app/
│   ├── layout.tsx              # metadata / JSON-LD / フォント / magokoro-ai script
│   ├── page.tsx                # Server Component。セクションを組むだけ
│   ├── globals.css             # 現行 CSS をそのまま移設
│   └── api/contact/route.ts    # Worker から移植
├── components/landing/
│   ├── Nav.tsx / Hero.tsx / Ticker.tsx / Philosophy.tsx / Topics.tsx
│   ├── Story.tsx / Domains.tsx / Policy.tsx / Company.tsx / Cta.tsx / Footer.tsx
│   ├── ContactForm.tsx         # "use client"
│   └── ObfuscatedMail.tsx      # "use client"
├── data/
│   └── landing.ts              # TOPIC_SLIDES 等のコンテンツ定義
└── lib/
    └── contact.ts              # 入力検証・エスケープ（route.ts と共有）
```

Server / Client の境界: 静的な markup は Server Component のまま置き、
状態を持つ **Nav（ドロワー）/ Topics（スライダー）/ ContactForm / ObfuscatedMail のみ `"use client"`** にする。
スクロール連動の演出は現在 `useEffect` + `IntersectionObserver` なので、その塊も Client 側へ寄せる。

---

## 5. 将来: 申込フォームを soular に統一する

移行が終われば `soular.co.jp/precontract/[service]` に **全サービスの申込フォームを集約**できる。

**得られるもの**

- URL 体系・UI・法務文書エンジンが 1 つになる（今は hrms と aichat に実装が 2 本ある）
- 契約主体が soular なのでブランド的に自然。りぴちゃんも同じ導線に乗る
- プラン・金額・重説の切替ロジックを 1 箇所で保守できる

**そのために追加が必要なもの**

| 要素 | 状況 |
|---|---|
| DB（同意ログ） | **新規**。Supabase プロジェクトを用意する（hrms/aichat と同じ流儀） |
| メール OTP・レート制限 | hrms から移植可（Supabase RPC 前提なので Supabase なら素直に移せる） |
| メール送信 | **既にある**（Resend・差出人は3サイト共通） |
| 管理画面 | 新規。`/admin/consents` 相当 |

これは移行とは**別フェーズ**。今回の移行のゴールは「これができる土台を作る」までとする。

---

## 6. 将来: サービス間連携の設計

「各サービスの管理画面でも同意データを見たい」への設計。

### 誰が正（SSOT）か

**soular を SSOT にする。** 重説の本文を組み立て `document_hash` を算出したのは soular であり、
証跡の正本はそこにしか置けない。ここが曖昧だと「どちらのDBが正しいか」が争点になる。

### 連携方式

**soular → 各サービスへ push（webhook）** + **詳細は soular 側へリンク**、を推奨する。

```
soular: OTP確認完了 → 同意確定（SSOT として保存）
   │
   └─ POST https://<service>/api/consents/ingest   （HMAC署名）
        payload: 最小限の要約 + soular側の詳細URL
   │
各サービス: 受け取った要約を自分のDBに保存 → 既存の管理画面に一覧表示
            詳細を見たいときは soular の同意ログへリンク
```

**なぜ push か**（「各サービスにAPIを作って soular から叩く」という方針に沿う）

- 各サービスの管理画面は**既存のままローカルDBを読むだけ**で済む。改修が最小
- soular が落ちても各サービスは過去分を表示できる
- push に失敗しても**証跡自体は soular に残る**（＝失われない）。後からリトライすればいい

**API 設計の必須要件**

| 項目 | 設計 |
|---|---|
| 認証 | HMAC 署名（`X-Soular-Signature: sha256=...`）。**サービスごとに別シークレット** |
| リプレイ防止 | 署名対象にタイムスタンプを含め、一定時間外は拒否 |
| 冪等性 | `consent_id` を冪等キーに。再送は上書き or 無視。**必ず冪等にする**（リトライ前提のため） |
| リトライ | 指数バックオフ。最終失敗は soular 側で「未達」として可視化し、手動再送できるようにする |
| ペイロード | **最小限に絞る**。個人情報を各サービスへ撒く量を増やさない |

ペイロード案:
```json
{
  "consent_id": "uuid", "service": "dental", "contract_plan": "3y",
  "clinic_name": "…", "applicant_name": "…", "email": "…",
  "verified_at": "2026-08-13T10:00:00+09:00",
  "document_hash": "…", "detail_url": "https://soular.co.jp/admin/consents/<id>"
}
```

> pull 型（各サービスが soular の API を叩いて取得）も成立するが、
> 各サービスの管理画面に外部API呼び出しとエラーハンドリングを実装する必要があり、
> soular 障害時に表示が落ちる。今回の目的（既存管理画面をなるべく触らない）には push のほうが合う。

---

## 7. 判断が必要な事項

0. **`soular.co.jp` をどうするか**（最優先の判断）。現行の canonical / og:url / JSON-LD が
   すべて未登録のこのドメインを指している。選択肢は3つ:
   - **(a) `soular-inc.com` に書き換える**（推奨）— 実態と一致させる。SEO バグが直る
   - (b) `soular.co.jp` を取得して `soular-inc.com` からリダイレクトする — ブランド上こちらを
     正式ドメインにしたいなら。ただし取得と設定が終わるまで canonical は壊れたまま
   - (c) そのまま据え置き — 移行では何も変えないという原則には忠実だが、バグを温存する
1. **移行先**: Vercel（推奨）か `@opennextjs/cloudflare`（DNS 触らない）か
2. **`www` の扱い**: apex へリダイレクトするか、両方受けるか
3. **Cloudflare の Proxy**: DNS-only にするか Proxied を維持するか
   （コーポレートサイトなので DNS-only で十分。Proxied を残すなら SSL は Full (strict) 必須）
4. **`RESEND_API_KEY`**: 既存キーを流用するか、Vercel 用に新規発行するか
5. **切替の実施タイミング**: アクセスの少ない時間帯に。実施は手動で行う（自動化しない）

## 8. この移行でやらないこと

スコープを膨らませないため、以下は**別件**として明示的に外す。

- デザイン・コンテンツの変更（1px も変えない）
- `next/image` 化・フォント最適化などのパフォーマンス改善
- **プライバシーポリシーの新規作成**
  ※ ただし現状、問い合わせフォームで氏名・メール・電話を収集しているのに
    プライバシーポリシーが 1 ページも存在しない。**移行とは独立に対応が必要**
- 申込フォームの実装（第5章。移行完了後の別フェーズ）
