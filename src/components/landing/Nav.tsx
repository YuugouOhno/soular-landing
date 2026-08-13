"use client";

import { useState } from "react";
import { NAV_LINKS } from "@/data/landing";

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="nav" id="nav">
        <a href="#" className="brand">soular</a>
        <div className="nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
          <a href="#start" className="nav-cta">お問い合わせ</a>
        </div>
        <button
          type="button"
          className={`nav-burger${menuOpen ? " is-open" : ""}`}
          aria-label="メニューを開く"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </nav>

      <div
        className={`nav-drawer${menuOpen ? " is-open" : ""}`}
        onClick={() => setMenuOpen(false)}
      >
        <div className="nav-drawer-panel" onClick={(e) => e.stopPropagation()}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <a href="#start" className="nav-drawer-cta" onClick={() => setMenuOpen(false)}>お問い合わせ</a>
        </div>
      </div>
    </>
  );
}
