import { ContactForm } from "./ContactForm";
import { ObfuscatedMail } from "./ObfuscatedMail";

export function Cta() {
  return (
    <section className="cta" id="start">
      <div className="shards">
        <span className="shard s2" style={{ left: "8%", bottom: "10%" }} />
        <span className="shard s3" style={{ right: "12%", top: "24%" }} />
      </div>
      <div className="cta-in wrap">
        <span className="tag">Contact</span>
        <h2>その課題に、<br />魂を込めて<span className="dot">。</span></h2>
        <p>医療・人事・農業——どの領域も、まずは現場の声から。お仕事のご依頼・ご相談はお気軽にどうぞ。</p>
        <ContactForm />
        <div className="cta-mail">
          <span className="lab">メールで直接送る場合はこちら</span>
          <ObfuscatedMail />
        </div>
      </div>
    </section>
  );
}
