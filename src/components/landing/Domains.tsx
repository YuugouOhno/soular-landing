/* eslint-disable @next/next/no-img-element -- 移行では markup を変えない。next/image 化は移行後の別件 */

export function Domains() {
  return (
    <section className="zone" id="domains" style={{ background: "var(--sage)" }}>
      <div className="wrap">
        <div className="z-head ru">
          <span className="tag">Our Services</span>
          <h2>3つの領域で、<span className="hl">現場の課題に挑む。</span></h2>
        </div>

        <div className="domain ru">
          <div className="dhead">
            <div className="no">01</div>
            <div>
              <div className="en">Healthcare IT ／ 最重点領域</div>
              <h3>IT事業（医療特化型システム）</h3>
              <p className="dd">医療現場の<b>「底の抜けたバケツ（離職や機会損失）」</b>を塞ぎ、院長をマネジメントの重圧から解放する経営オートメーションシステム。適正価格と、それを遥かに超える手厚い伴走で真の価値を還元します。</p>
            </div>
          </div>
          <div className="svc-grid scroll-x">
            <div className="tile">
              <div className="tile-thumb"><img src="/hrms.png" alt="医療特化型HRMSのイメージ" loading="lazy" /></div>
              <div className="t-no">01 / Medical HRMS</div>
              <h4>医療特化型HRMS<br />メディマネージャー / デンタルマネージャー</h4>
              <div className="cc">組織の定期健診と、明日使える処方箋</div>
              <p>「ケースクエスチョン」で深層心理を可視化し、「明日Aさんにこう声をかけて」という具体的な行動指示を自動生成。院長とスタッフの相性診断に基づく適材適所で、離職を防ぎ、組織の定着を支えます。</p>
              <div className="more-row">
                <a className="more" href="https://soular-hrms.com/medical/lp" target="_blank" rel="noreferrer">医科版 →</a>
                <a className="more" href="https://soular-hrms.com/dental/lp" target="_blank" rel="noreferrer">歯科版 →</a>
              </div>
            </div>
            <div className="tile">
              <div className="tile-thumb"><img src="/doubutsu-shindan.png" alt="医科・歯科 動物タイプ診断のイメージ" loading="lazy" /></div>
              <div className="t-no">02 / Type Diagnosis</div>
              <h4>医科・歯科 動物タイプ診断</h4>
              <div className="cc">一般向け 無料の相性診断</div>
              <p>6つの質問に答えるだけで、あなたの「動物タイプ」と強み・相性がわかる無料の診断サービス。院内のスタッフ同士はもちろん、患者さんやご家族とのコミュニケーションのきっかけにもどうぞ。</p>
              <div className="more-row">
                <a className="more" href="https://soular-hrms.com/medical" target="_blank" rel="noreferrer">医科版で診断 →</a>
                <a className="more" href="https://soular-hrms.com/dental" target="_blank" rel="noreferrer">歯科版で診断 →</a>
              </div>
            </div>
            <div className="tile">
              <div className="tile-thumb"><img src="/magokoro-ai.png" alt="まごころAIチャットのイメージ" loading="lazy" /></div>
              <div className="t-no">03 / AI Concierge</div>
              <h4>まごころAIチャット</h4>
              <div className="cc">24時間働くデジタル受付</div>
              <p>HPに常駐し定型質問へ即答し、現場の電話対応を軽減。夜間や休診日の問い合わせの取りこぼしを防ぎ、機会損失を抑制。患者の「本当のニーズ（検索キーワード）」を可視化し、広告費の無駄を抑えます。</p>
              <a className="more" href="https://magokoro-ai.com/" target="_blank" rel="noreferrer">VIEW DETAIL →</a>
            </div>
            <div className="tile">
              <div className="tile-thumb"><img src="/linemade-square.png" alt="LINEメイドのイメージ" loading="lazy" /></div>
              <div className="t-no">04 / Official LINE</div>
              <h4>LINEメイド</h4>
              <div className="cc">月給1.5万円の電子お手伝いさん</div>
              <p>予約・リマインド・リコール（定期検診案内）・デジタル診察券をLINEで全自動化。【独自】スタッフ専用メニューでの出退勤・シフト管理・業務日報を完結。【独自】訪問歯科の請求書を訪問先から直接ご家族のLINEへ送信。</p>
              <a className="more" href="https://linemade.link/lp" target="_blank" rel="noreferrer">VIEW DETAIL →</a>
            </div>
          </div>
        </div>

        <div className="domain ru">
          <div className="dhead">
            <div className="no">02</div>
            <div>
              <div className="en">Human Resources</div>
              <h3>人事事業（超・伴走型 外部人事）</h3>
              <p className="dd">採用から定着、組織文化の醸成まで、企業の<b>「熱き人事部門」</b>として二人三脚で伴走する完全オーダーメイドの人事支援。</p>
            </div>
          </div>
          <div className="svc-grid cols4">
            <div className="tile"><div className="t-no">01 / Strategy</div><h4>採用計画・戦略立案</h4><p>経営ビジョンや現場課題に基づいた、上流の採用戦略構築。</p></div>
            <div className="tile"><div className="t-no">02 / Operation</div><h4>運用代行・クロージング</h4><p>媒体運用から面接の実施、候補者の心を動かす「口説き落とし」まで実行。</p></div>
            <div className="tile"><div className="t-no">03 / Onboarding</div><h4>入社前インターン・研修</h4><p>入社前の助走期間をサポートし、ミスマッチ防止と即戦力化を実現。</p></div>
            <div className="tile"><div className="t-no">04 / Culture</div><h4>社内イベントの企画運営</h4><p>組織の士気を高める集会や社内イベントのゼロからのプロデュースと進行管理。</p></div>
          </div>
        </div>

        <div className="domain ru">
          <div className="dhead">
            <div className="no">03</div>
            <div>
              <div className="en">Agriculture &amp; Food</div>
              <h3>農業・食事業（次世代農業プロデュース）<span className="soon">準備中</span></h3>
              <p className="dd">医療と農業を繋ぎ、生産者も消費者も豊かになる<b>「新しい食の循環」</b>を創る。</p>
            </div>
          </div>
          <div className="svc-grid">
            <div className="tile"><div className="t-no">01 / Farmer Support</div><h4>農家の包括的支援</h4><p>よもぎ・米農家の環境改善、就労支援を通じた雇用創出。</p></div>
            <div className="tile"><div className="t-no">02 / Direct Trade</div><h4>加工・ダイレクトトレード</h4><p>中間マージンを排除し、適正価格での卸売で農家の収入を直接向上。</p></div>
            <div className="tile"><div className="t-no">03 / Product</div><h4>オリジナル商品の開発</h4><p>美容やストレス緩和に効くよもぎ、グルテンフリーのお米など、働く人への「処方箋」となる食の提供。</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
