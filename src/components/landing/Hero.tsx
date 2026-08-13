import { HERO_KEYWORDS } from "@/data/landing";

// #kw の文字列は LandingRoot の演出が直接書き換える（React 管理外）。
export function Hero() {
  return (
    <header className="hero">
      <div className="hero-grid" />
      <div className="shards">
        <span className="shard s1" /><span className="shard s2" /><span className="shard s3" />
      </div>
      <div className="hero-inner wrap">
        <h1>
          <span className="ln"><span>魂を込め、</span></span>
          <span className="ln"><span>尽くし、</span></span>
          <span className="ln"><span>熱く挑む<span className="dot">。</span></span></span>
        </h1>
        <div className="kw-line">
          <span className="pr">{">"}</span>
          <span>[{" "}</span>
          <span className="kw-wrap"><span className="kw" id="kw">{HERO_KEYWORDS[0]}</span></span>
          <span>{" "}]</span>
          <span>{" "}に、魂を。</span>
          <span className="caret">_</span>
        </div>
        <p className="hero-sub">
          株式会社soularは、医療・人事・農業の現場に魂を込めて伴走する事業会社です。<br />
          不可能を可能にする挑戦を通じて、人々の明るい未来を設計します。
        </p>
        <div className="hero-actions">
          <a href="#domains" className="btn btn-fill">事業領域を見る <span className="arr">→</span></a>
          <a href="#philosophy" className="btn btn-line">理念を読む</a>
        </div>
      </div>
    </header>
  );
}
