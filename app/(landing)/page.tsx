"use client";
import { motion } from "framer-motion";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Stats } from "@/components/landing/stats";
import { CTA } from "@/components/landing/cta";
import { Header } from "@/components/landing/header";

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true },
});

export default function Home() {
  return (
    <div className="min-h-screen bg-background dark text-foreground">
      <Header />
      <main className="overflow-hidden">
        <motion.div id="hero" {...fadeIn(0.1)}>
          <Hero />
        </motion.div>

        <motion.div id="stats" {...fadeIn(0.4)}>
          <Stats />
        </motion.div>

        <motion.div id="features" {...fadeIn(0.4)}>
          <Features />
        </motion.div>

        <motion.div id="cta" {...fadeIn(0.6)}>
          <CTA />
        </motion.div>
      </main>
    </div>
  );
}
