import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

// 移行前 index.html の <head> を移設したもの。
// title / description / OG / Twitter / JSON-LD は SEO に直結するため、内容を勝手に変えないこと。
//
// ただしドメインだけは意図的に変更している。移行前は canonical / og:url / JSON-LD が
// すべて soular.co.jp を指していたが、このドメインは未登録で名前解決しない（whois: No match）。
// 存在しないURLを正規URLとして宣言している状態だったため、稼働実体である
// soular-inc.com に揃えた（2026-08-13 判断）。
//
// ⚠️ og-image.png は public/ に存在しない（移行前から 404）。OG 画像は別途用意が必要。

const SITE_URL = "https://soular-inc.com/";
const DESCRIPTION =
  "株式会社Soularは、LINE運用ツール開発、人事・集客支援、農業推進を軸に、魂を込めた価値創造に挑む企業です。本質を見極め、地域と企業の未来を照らし、独自性と共創で社会に新たな光をもたらします。";
const OG_TITLE = "株式会社soular | システム開発・DX支援・デジタルマーケティング";
const OG_IMAGE = "https://soular-inc.com/og-image.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "株式会社soular",
  description: DESCRIPTION,
  keywords: [
    "株式会社soular", "soular", "ソウラー", "浜田颯流", "颯流",
    "システム開発", "DX支援", "デジタルマーケティング", "LINE公式アカウント",
    "ラインメイドリピちゃん", "Web開発", "IT企業",
  ],
  authors: [{ name: "株式会社soular" }],
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  icons: { icon: "/logo.png" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: OG_TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
    siteName: "株式会社soular",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

// 移行前 index.html の JSON-LD をそのまま。
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "株式会社soular",
  alternateName: ["soular", "ソウラー"],
  url: SITE_URL,
  logo: "https://soular-inc.com/favicon.svg",
  description: DESCRIPTION,
  founder: { "@type": "Person", name: "浜田颯流", alternateName: "颯流" },
  foundingDate: "2025",
  address: { "@type": "PostalAddress", addressCountry: "JP", addressRegion: "東京都" },
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Japanese",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* 移行前と同じ Google Fonts。next/font 化はパフォーマンス改善として移行後に切り出す。
            no-page-custom-font は pages/_document 向けのルールで、App Router のルート
            レイアウトに置いている本ケースでは全ページに適用されるため該当しない。 */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=DM+Mono:wght@400;500&family=Murecho:wght@400;700;900&family=Schibsted+Grotesk:wght@400;500;700&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body>
        {children}
        {/* 自社の まごころAI ウィジェット。移行前は body 末尾で async 読み込みしていた */}
        <Script
          src="https://magokoro-ai.com/magokoro-ai.js?tenant=soular-hp"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
