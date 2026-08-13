// ランディングの表示コンテンツ定義。文言・リンクの変更はここだけを触る。

export type TopicSlide = {
  kicker: string;
  /** <br /> を含むため描画側で dangerouslySetInnerHTML する */
  title: string;
  desc: string;
  feats: string[];
  img: string;
  alt: string;
  link: string;
};

export const TOPIC_SLIDES: TopicSlide[] = [
  {
    kicker: "Medical HRMS",
    title: "医療特化型HRMS<br />メディマネージャー / デンタルマネージャー",
    desc: "「ケースクエスチョン」でスタッフの深層心理を可視化し、「明日Aさんにこう声をかけて」という具体的な行動指示を自動生成。院長とスタッフの相性診断に基づく適材適所で、離職を防ぎます。",
    feats: ["深層心理の可視化", "行動指示の自動生成", "院長×スタッフの相性診断", "離職防止・定着支援"],
    img: "/hrms.png",
    alt: "医療特化型HRMS メディマネージャーのイメージ",
    link: "#domains",
  },
  {
    kicker: "AI Concierge",
    title: "まごころAIチャット",
    desc: "HPに常駐して定型質問へ即答し、現場の電話対応を軽減。夜間や休診日の問い合わせの取りこぼしを防ぎ、機会損失を抑制。患者の「本当のニーズ」を可視化し、広告費の無駄を抑えます。",
    feats: ["24時間自動対応", "電話対応の軽減", "本当のニーズを可視化", "広告費の最適化"],
    img: "/magokoro-ai.png",
    alt: "まごころAIチャットのイメージ",
    link: "#domains",
  },
  {
    kicker: "Official LINE Management",
    title: '公式ライン管理サービス<br />「ラインメイドリピちゃん」',
    desc: "顧客管理、自動応答、物販、スタッフの勤怠管理などさまざまな機能をこれひとつで。一度来院した患者様がまた来たくなる仕組みを、LINE公式アカウントで実現します。",
    feats: ["リッチメニュー管理", "予約リマインド配信", "24時間365日の自動対応", "物販管理"],
    img: "/linemade-square.png",
    alt: "公式ライン管理サービス「ラインメイドリピちゃん」のイメージ",
    link: "https://linemade.link/lp",
  },
];

export type TickerItem = { label: string; body: string };

// 無限スクロール (translateX(-50%)) が成立するよう、描画側でこの配列を 2 回繰り返す。
export const TICKER_ITEMS: TickerItem[] = [
  { label: "医療特化型HRMS", body: "メディマネージャー / デンタルマネージャー" },
  { label: "まごころAIチャット", body: "24時間働くデジタル受付" },
  { label: "LINEメイド", body: "月給1.5万円の電子お手伝いさん" },
  { label: "超・伴走型 外部人事", body: "採用から定着まで" },
  { label: "次世代農業", body: "よもぎと米の新しい循環" },
];

// ヒーローで入れ替わるキーワード。
export const HERO_KEYWORDS = ["医療現場", "クリニック経営", "採用", "組織づくり", "農業", "地域"];

export const NAV_LINKS = [
  { href: "#philosophy", label: "理念" },
  { href: "#story", label: "創業" },
  { href: "#domains", label: "事業領域" },
  { href: "#topics", label: "実績" },
  { href: "#company", label: "会社情報" },
];
