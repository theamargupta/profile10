"use client";

/**
 * FloatingCta — Small floating "Start a project" chip that appears
 * after scrolling past the hero and hides near the footer.
 */

import { useEffect, useState } from "react";

export default function FloatingCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(
        window.scrollY > window.innerHeight * 0.8 &&
          window.scrollY + window.innerHeight <
            document.documentElement.scrollHeight - 400
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="#contact"
      data-cursor="magnet"
      className={[
        "fixed bottom-6 right-6 z-40 inline-flex h-12 items-center gap-2 rounded-full border border-[var(--color-accent-400)]/60 bg-[var(--color-surface-0)]/80 px-5 font-mono text-sm uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-0)] backdrop-blur-xl transition-all duration-500",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0",
      ].join(" ")}
      aria-hidden={!visible}
    >
      <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-accent-400)]" />
      Start a project
    </a>
  );
}
