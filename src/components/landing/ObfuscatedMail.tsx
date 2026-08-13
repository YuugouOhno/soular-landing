"use client";

import { useState } from "react";

// メールアドレスを平文でソースに残さず、実行時に base64 復号して表示する（bot のアドレス収集対策）。
export function ObfuscatedMail() {
  const [addr] = useState(() => {
    try {
      return atob("cy1oYW1hZGFAc291bGFyLWluYy5jb20=");
    } catch {
      return "";
    }
  });
  if (!addr) return null;
  return <a href={`mailto:${addr}`}>{addr}</a>;
}
