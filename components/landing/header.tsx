"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

export function Header() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // scroll tới section với offset để header fixed không che
  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -64; // chiều cao header = 16 * 4 = 64px
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleSignIn = () => {
    setIsLoading(true);
    router.push("/setup");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--primary-main)] text-[var(--foreground)] transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <MessageSquare className="h-6 w-6 text-[var(--primary-accent)]" />
            <span className="text-xl font-bold text-[var(--foreground)]">
              ChatCall
            </span>
          </div>

          {/* Navigation */}
          <div className="hidden md:!flex items-center gap-8">
            {[
              { label: "Home", id: "hero" },
              { label: "Stats", id: "stats" },
              { label: "Features", id: "features" },
              { label: "CTA", id: "cta" },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => handleScroll(section.id)}
                className="mx-5 text-lg font-bold text-white hover:text-[var(--primary-accent)] transition-colors"
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              variant="ghost"
              className="hidden sm:!inline-flex text-md text-white bg-gradient-to-r from-[#cc707033] to-[var(--primary-accent)] 
                  hover:from-[var(--primary-accent)] hover:to-[#5341a233] transition-all duration-1000"
            >
              {isLoading ? "Loading..." : "Sign In"}
            </Button>
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="hidden sm:!inline-flex text-md text-white bg-gradient-to-r from-[#cc707033] to-[var(--primary-accent)] 
                  hover:from-[var(--primary-accent)] hover:to-[#5341a233] transition-all duration-1000"
            >
              {isLoading ? "Loading..." : "Get Started"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
