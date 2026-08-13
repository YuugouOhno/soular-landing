export function Company() {
  return (
    <section className="zone" id="company" style={{ background: "var(--sage)" }}>
      <div className="wrap">
        <div className="z-head ru">
          <span className="tag">Company</span>
          <h2>会社情報</h2>
        </div>
        <div className="ctable ru">
          <div className="crow"><div className="k">会社名</div><div className="v">株式会社soular</div></div>
          <div className="crow"><div className="k">設立</div><div className="v">2026年3月</div></div>
          <div className="crow"><div className="k">代表者</div><div className="v">{"代表取締役　浜田颯流"}</div></div>
          <div className="crow">
            <div className="k">事業内容</div>
            <div className="v">
              IT事業（医療特化型システムの開発・販売・運用）<br />
              人事事業（超・伴走型 外部人事支援）<br />
              農業・食事業（次世代農業プロデュース）
            </div>
          </div>
          <div className="crow"><div className="k">所在地</div><div className="v">〒110-0005 東京都台東区上野1丁目17番6号 広小路ビル8F-B</div></div>
        </div>
      </div>
    </section>
  );
}
