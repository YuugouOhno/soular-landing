const POLICIES = [
  "手厚いフォロー",
  "柔軟な対応",
  "手頃で明朗な価格",
  "早い対応と導入",
  "使いやすい仕様とデザイン",
];

export function Policy() {
  return (
    <section className="zone zone--ink" id="policy">
      <div className="wrap">
        <div className="z-head ru">
          <span className="tag">Our Policy</span>
          <h2>soularの、<span className="hl">5つのポリシー。</span></h2>
          <p style={{ maxWidth: "none" }}>「適正価格で、それ以上の伴走を」。私たちが現場にお約束する、5つの「どこよりも」です。</p>
        </div>
        <div className="policy">
          {POLICIES.map((text, i) => (
            <div className="p-item ru" key={text}>
              <div className="p-no">{String(i + 1).padStart(2, "0")}</div>
              <div className="p-txt"><span className="p-pre">どこよりも</span>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
