import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 親ディレクトリの lockfile を拾って root を誤検出しないよう固定する。
  turbopack: { root: __dirname },
};

export default nextConfig;
