export function Story() {
  return (
    <section className="zone zone--ink" id="story">
      <div className="wrap">
        <div className="story-top">
          <div className="z-head ru">
            <span className="tag">Our Story</span>
            <h2>原体験から生まれた、<span className="hl">3つの挑戦。</span></h2>
            <p>これら3つの領域は、代表自身が培ってきた「属人的な強み」を「再現性のある仕組み」へと昇華・言語化できる確固たるジャンルです。</p>
          </div>
          <div className="venn-wrap ru">
            <svg className="venn" viewBox="0 0 600 470" role="img" aria-label="医療×IT・人事・農業の3領域とその重なり">
              <circle className="vc" cx="225" cy="195" r="150" />
              <circle className="vc" cx="375" cy="195" r="150" />
              <circle className="vc" cx="300" cy="305" r="150" />
              <text className="lab" x="160" y="178" textAnchor="middle">医療 × IT</text>
              <text className="en" x="160" y="200" textAnchor="middle">HEALTHCARE IT</text>
              <text className="lab" x="442" y="178" textAnchor="middle">人事</text>
              <text className="en" x="442" y="200" textAnchor="middle">HUMAN RESOURCES</text>
              <text className="lab" x="300" y="400" textAnchor="middle">農業・食</text>
              <text className="en" x="300" y="422" textAnchor="middle">AGRICULTURE</text>
              <text className="ctr" x="300" y="236" textAnchor="middle">SOUL × SOLAR</text>
            </svg>
          </div>
        </div>
        <div className="story">
          <div className="s ru">
            <div className="n">Healthcare × IT</div>
            <h4>適正な価値と、それ以上の伴走を。</h4>
            <p>医療業界はクローズドな側面が強く、ITやAI導入が進む一方で「適正価格を大幅に超える販売」や「導入後の雑なフォロー」が横行しています。新卒から医療業界に身を置き、人事や集患などあらゆる切り口から現場を見てきたからこそ、「適正な金額での提供」と「適正価格を遥かに超える手厚い伴走」をお約束します。</p>
          </div>
          <div className="s ru">
            <div className="n">Human Resources</div>
            <h4>企業の課題に寄り添う「外部人事」として。</h4>
            <p>人材紹介と人事、双方の現場を経験してきたからこそできる支援の形があります。「求職者の意向度や企業理解度の向上」「入社後のオンボーディング・研修」「採用戦略の構築」を活かし、外注人事として企業ごとの課題感に深くコミットします。</p>
          </div>
          <div className="s ru">
            <div className="n">Agriculture</div>
            <h4>法人と農業の架け橋に。18歳からの情熱。</h4>
            <p>18歳で経営学部に入学した時から「30歳までに農業に携わる事業を創る」と決意し、「よもぎ」と「米」に強い関心を抱き続けてきました。医療の世界で多くの院長や経営者と話す中、参入ハードルの高い現実に直面。「法人と農業を繋げられるのは自分しかいない」と確信し、長年の情熱を具現化します。</p>
          </div>
        </div>
      </div>
    </section>
  );
}
