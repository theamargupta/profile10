"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const ROTATING_TAGS = [
  "MCP Servers · LLM Integration · Workflow Automation",
  "Production-ready, not just prototypes.",
  "Backends that ship. Interfaces that feel alive.",
  "Built by engineers, not templates.",
] as const;

interface AnimatedTaglineProps {
  primary: string;
  accentWord?: string;
  rotating?: readonly string[];
}

function buildWords(text: string, accentWord?: string) {
  const lower = accentWord?.toLowerCase();
  return text.split(" ").map((word, w) => {
    const isAccent = lower !== undefined && word.toLowerCase().replace(/[.,!?]/g, "") === lower;
    return {
      word,
      key: `w-${w}-${word}`,
      accent: isAccent,
      chars: Array.from(word).map((char, i) => ({ char, key: `${w}-${i}-${char}` })),
    };
  });
}

export function AnimatedTagline({
  primary,
  accentWord = "AI-powered",
  rotating = ROTATING_TAGS,
}: AnimatedTaglineProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [rotatingIndex, setRotatingIndex] = useState(0);
  const rotatingRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chars = headingRef.current?.querySelectorAll<HTMLSpanElement>("[data-char]");
    if (!chars) return;
    gsap.fromTo(
      chars,
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.52, stagger: 0.018, ease: "power4.out" }
    );
  }, []);

  useEffect(() => {
    if (rotating.length < 2) return;
    const id = window.setInterval(() => {
      setRotatingIndex((i) => (i + 1) % rotating.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [rotating.length]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = rotatingRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { yPercent: 100, opacity: 0, filter: "blur(6px)" },
      { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.52, ease: "power4.out" }
    );
  }, [rotatingIndex]);

  const words = buildWords(primary, accentWord);

  return (
    <>
      <h1
        ref={headingRef}
        className="max-w-5xl font-display font-semibold text-[var(--color-fg-0)]"
        style={{
          fontSize: "var(--text-display)",
          lineHeight: "var(--leading-display)",
          letterSpacing: "var(--tracking-tighter)",
        }}
        aria-label={primary}
      >
        {words.map(({ key, chars, accent }, i) => (
          <span
            key={key}
            className={`inline-flex overflow-hidden align-baseline ${accent ? "text-[var(--color-accent-400)]" : ""}`}
            style={{ marginRight: i < words.length - 1 ? "0.28em" : 0 }}
            aria-hidden
          >
            {chars.map(({ char, key: ck }) => (
              <span key={ck} data-char className="inline-block will-change-transform">
                {char}
              </span>
            ))}
          </span>
        ))}
      </h1>

      <div className="mt-5 h-8 overflow-hidden" aria-live="polite">
        <span
          ref={rotatingRef}
          key={rotatingIndex}
          className="block font-mono text-sm uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent-400)]"
        >
          {rotating[rotatingIndex]}
        </span>
      </div>
    </>
  );
}
