export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="f-top">
          <div>
            <div className="brand">soular</div>
            <p className="f-tag">すべての事業に魂（Soul）を宿し、社会を照らす太陽（Solar）となる。株式会社soular。</p>
          </div>
          <div className="f-cols">
            <div className="f-col">
              <h5>Services</h5>
              <a href="#domains">IT事業（医療特化）</a>
              <a href="#domains">人事事業</a>
              <a href="#domains">農業・食事業</a>
              <a href="https://linemade.link/lp" target="_blank" rel="noreferrer">LINEメイド</a>
            </div>
            <div className="f-col">
              <h5>Company</h5>
              <a href="#philosophy">理念</a>
              <a href="#story">創業ストーリー</a>
              <a href="#company">会社情報</a>
              <a href="#start">お問い合わせ</a>
            </div>
          </div>
        </div>
        <div className="f-bot">
          <span>© 2026 SOULAR, INC.</span>
          <span>〒110-0005 東京都台東区上野1-17-6 広小路ビル8F-B</span>
        </div>
      </div>
    </footer>
  );
}
