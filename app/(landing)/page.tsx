import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Stats } from "@/components/landing/stats";
import { CTA } from "@/components/landing/cta";
import { Header } from "@/components/landing/header";

export default function Home() {
  return (
    <div className="min-h-screen dark">
      <Header />
      <main>
        <div id="hero">
          <Hero />
        </div>
        <div id="stats">
          <Stats />
        </div>
        <div id="features">
          <Features />
        </div>
        <div id="cta">
          <CTA />
        </div>
      </main>
    </div>
  );
}
