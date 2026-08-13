import { LandingRoot } from "@/components/landing/LandingRoot";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Ticker } from "@/components/landing/Ticker";
import { Philosophy } from "@/components/landing/Philosophy";
import { Topics } from "@/components/landing/Topics";
import { Story } from "@/components/landing/Story";
import { Domains } from "@/components/landing/Domains";
import { Policy } from "@/components/landing/Policy";
import { Company } from "@/components/landing/Company";
import { Cta } from "@/components/landing/Cta";
import { Footer } from "@/components/landing/Footer";

// セクションの並びは移行前 SoularLanding.jsx と同一。
// 状態を持つのは Nav / Topics / ContactForm / ObfuscatedMail のみで、
// 残りは Server Component のまま描画される。
export default function Page() {
  return (
    <LandingRoot>
      <Nav />
      <Hero />
      <Ticker />
      <Philosophy />
      <Topics />
      <Story />
      <Domains />
      <Policy />
      <Company />
      <Cta />
      <Footer />
    </LandingRoot>
  );
}
