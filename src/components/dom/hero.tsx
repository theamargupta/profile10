"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import gsap from "gsap";
import MagneticButton from "@/components/ui/magnetic-button";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin();

const HeroScene = dynamic(() => import("@/components/canvas/hero-scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[var(--color-surface-0)] animate-pulse" />
  ),
});

interface HeroProps {
  headline: string;
  subtitle: string;
}

export function Hero({ headline, subtitle }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-hero-badge]", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
      })
        .from(
          "[data-hero-headline]",
          { y: 60, opacity: 0, duration: 1 },
          "-=0.3"
        )
        .from(
          "[data-hero-subtitle]",
          { y: 40, opacity: 0, duration: 0.8 },
          "-=0.5"
        )
        .from(
          "[data-hero-tags]",
          { y: 30, opacity: 0, duration: 0.6 },
          "-=0.4"
        )
        .from(
          "[data-hero-cta]",
          { y: 30, opacity: 0, duration: 0.6 },
          "-=0.3"
        )
        .from(
          "[data-hero-3d]",
          { opacity: 0, scale: 0.9, duration: 1.2 },
          "-=1"
        );
    },
    { scope: containerRef }
  );

  // Parse headline to highlight "AI-powered" with gradient
  const parts = headline.split(/(AI-powered)/i);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* Background glows — devfrend-agency style: indigo + lime radials */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 15% 25%, rgba(61, 75, 255, 0.18), transparent 40%),
            radial-gradient(circle at 75% 15%, rgba(168, 245, 0, 0.10), transparent 35%),
            radial-gradient(circle at 50% 80%, rgba(255, 122, 92, 0.08), transparent 30%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
        {/* Left: Text Content */}
        <div className="max-w-xl pt-40 pb-24 lg:pt-0 lg:pb-0">
          {/* Available badge */}
          <div
            data-hero-badge
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-surface-4)] px-3 py-1 font-mono text-xs text-[var(--color-fg-2)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
            Available for new projects
          </div>

          <h1
            data-hero-headline
            className="font-display font-bold tracking-[var(--tracking-tighter)] mb-6 text-[var(--color-fg-0)]"
            style={{
              fontSize: "var(--text-5xl)",
              lineHeight: "var(--leading-display)",
            }}
          >
            {parts.map((part, i) =>
              part.toLowerCase() === "ai-powered" ? (
                <span key={i} className="text-[var(--color-accent-400)]">
                  {part}
                </span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </h1>

          <p
            data-hero-subtitle
            className="mb-6 max-w-md text-[var(--color-fg-1)]"
            style={{ fontSize: "var(--text-lg)", lineHeight: "var(--leading-normal)" }}
          >
            Full-stack developer specializing in MCP servers, LLM integration,
            and workflow automation. Turning complex AI capabilities into
            production-ready products.
          </p>

          <div
            data-hero-tags
            className="mb-8 flex flex-wrap gap-2"
          >
            {subtitle.split(/[·•,]/).map((tag) => (
              <span
                key={tag.trim()}
                className="rounded-full border border-[var(--color-surface-4)] px-3 py-1 font-mono text-xs text-[var(--color-fg-2)]"
              >
                {tag.trim()}
              </span>
            ))}
          </div>

          <div data-hero-cta className="flex flex-wrap items-center gap-4">
            <MagneticButton href="/#contact" variant="primary" size="md">
              Start a Project
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </MagneticButton>
            <MagneticButton href="/projects" variant="ghost" size="md">
              View My Work
            </MagneticButton>
          </div>
        </div>

        {/* Right: 3D Scene */}
        <div
          data-hero-3d
          className="relative aspect-square w-full max-w-lg justify-self-center lg:justify-self-end"
        >
          <Suspense
            fallback={
              <div className="absolute inset-0 rounded-full bg-[var(--color-surface-1)] animate-pulse" />
            }
          >
            <HeroScene />
          </Suspense>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="h-8 w-5 rounded-full border-2 border-[var(--color-fg-0)]/20 p-1">
          <div className="mx-auto h-2 w-1 rounded-full bg-[var(--color-accent-400)]/60 animate-pulse-glow" />
        </div>
      </div>
    </section>
  );
}
