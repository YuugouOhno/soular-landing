"use client";

import { useEffect, useRef, useState } from "react";
import { TOPIC_SLIDES } from "@/data/landing";

export function Topics() {
  const showRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stripH, setStripH] = useState<number | undefined>();

  useEffect(() => {
    if (paused) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % TOPIC_SLIDES.length), 5500);
    return () => clearInterval(id);
  }, [paused, slide]);

  // 表示中スライドの高さにビューポートを合わせ、はみ出し・余白をなくす
  useEffect(() => {
    const root = showRef.current;
    if (!root) return;
    const measure = () => {
      const el = root.querySelectorAll<HTMLElement>(".topic-slide")[slide];
      if (el) setStripH(el.offsetHeight);
    };
    measure();
    const r = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(r);
      window.removeEventListener("resize", measure);
    };
  }, [slide]);

  return (
    <section className="zone" id="topics" style={{ background: "var(--sage)" }}>
      <div className="wrap">
        <div className="z-head center ru">
          <span className="tag">Topics</span>
          <h2>Recent <span className="hl">Work.</span></h2>
        </div>
        <div
          className="topic-show ru"
          ref={showRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="topic-viewport" style={{ height: stripH ? `${stripH}px` : undefined }}>
            <div className="topic-strip" style={{ transform: `translateX(-${slide * 100}%)` }}>
              {TOPIC_SLIDES.map((s, i) => (
                <div className="topic-slide" key={s.kicker} aria-hidden={i !== slide ? "true" : undefined}>
                  <div className="topic-media">
                    {/* eslint-disable-next-line @next/next/no-img-element -- 移行では markup を変えない。next/image 化は移行後の別件 */}
                    <img
                      src={s.img}
                      alt={s.alt}
                      loading="lazy"
                      onLoad={(e) => {
                        if (i === slide) {
                          const slideEl = e.currentTarget.closest<HTMLElement>(".topic-slide");
                          if (slideEl) setStripH(slideEl.offsetHeight);
                        }
                      }}
                    />
                  </div>
                  <div className="topic-body">
                    <div className="topic-kicker">{s.kicker}</div>
                    <h3 dangerouslySetInnerHTML={{ __html: s.title }} />
                    <p>{s.desc}</p>
                    <ul className="topic-feats">
                      {s.feats.map((f) => (
                        <li key={f}>
                          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="11" stroke="#22b34c" strokeWidth="1.6" />
                            <path d="M7 12.4l3.2 3.1L17 8.5" stroke="#22b34c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a
                      className="btn btn-blue"
                      href={s.link}
                      target={s.link.startsWith("http") ? "_blank" : undefined}
                      rel={s.link.startsWith("http") ? "noreferrer" : undefined}
                    >
                      詳細を見る <span className="arr">→</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="topic-dots">
            {TOPIC_SLIDES.map((s, i) => (
              <button
                key={s.kicker}
                className={i === slide ? "on" : ""}
                onClick={() => setSlide(i)}
                aria-label={`スライド${i + 1}を表示`}
                aria-current={i === slide ? "true" : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
