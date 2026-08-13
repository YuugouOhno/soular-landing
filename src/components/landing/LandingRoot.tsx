"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { HERO_KEYWORDS } from "@/data/landing";

// ランディング全体のルート。移行前 SoularLanding.jsx が持っていた
// 「ページ全体に効く演出」をここに集約している。
//   - マウント直後に .reveal を付けてヒーローのイントロを走らせる
//   - スクロールでナビに .is-stuck を付ける
//   - ヒーローのキーワードを一定間隔で入れ替える
//   - IntersectionObserver で .ru を .in にする（フェードイン）／.stat のカウントアップ
//
// いずれも DOM を直接触る演出で、React の再描画とは独立している。
// 子は Server Component のまま渡せる（children 経由のため）。
export function LandingRoot({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const raf = requestAnimationFrame(() => root.classList.add("reveal"));

    const nav = root.querySelector("#nav");
    const onScroll = () => nav && nav.classList.toggle("is-stuck", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });

    const kw = root.querySelector("#kw");
    let wi = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    if (kw && !reduce) {
      interval = setInterval(() => {
        kw.classList.add("swap");
        setTimeout(() => {
          wi = (wi + 1) % HERO_KEYWORDS.length;
          kw.textContent = HERO_KEYWORDS[wi];
          kw.classList.remove("swap");
        }, 230);
      }, 2200);
    }

    const countUp = (el: Element | null) => {
      if (!el) return;
      const target = parseFloat(el.getAttribute("data-count") ?? "") || 0;
      const unitEl = el.querySelector(".u");
      const unit = unitEl ? unitEl.outerHTML : "";
      if (reduce) {
        el.innerHTML = target + unit;
        return;
      }
      const s = performance.now();
      const dur = 1200;
      const f = (now: number) => {
        const p = Math.min((now - s) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.innerHTML = Math.floor(e * target) + unit;
        if (p < 1) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    };

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          if (entry.target.classList.contains("stat")) {
            countUp(entry.target.querySelector(".s-num"));
          }
          io.unobserve(entry.target);
        }),
      { threshold: 0.16 },
    );
    root.querySelectorAll(".ru").forEach((el) => io.observe(el));

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      if (interval) clearInterval(interval);
      io.disconnect();
      root.classList.remove("reveal");
    };
  }, []);

  return (
    <div ref={rootRef} className="soular-new">
      {children}
    </div>
  );
}
