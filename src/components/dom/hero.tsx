"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin();

const HeroScene = dynamic(() => import("@/components/canvas/hero-scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#0a0a12] animate-pulse" />
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
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Background glows */}
      <div className="pointer-events-none absolute top-[10%] right-[15%] h-[600px] w-[600px] rounded-full bg-[#7c6aef] opacity-[0.3] blur-[120px] animate-float" />
      <div className="pointer-events-none absolute bottom-[10%] left-[10%] h-[600px] w-[600px] rounded-full bg-[#5b8cf7] opacity-[0.3] blur-[120px]" style={{ animationDelay: '3s', animationDuration: '10s' }} />

      <div className="mesh-gradient grain-surface absolute inset-0 opacity-30" />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        {/* Left: Text Content */}
        <div className="max-w-xl pt-20 lg:pt-0">
          {/* Available badge */}
          <div
            data-hero-badge
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium text-primary backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Available for new projects
          </div>

          <h1
            data-hero-headline
            className="font-display text-[clamp(2.75rem,5.5vw,4.5rem)] font-bold tracking-[-0.04em] leading-[1.05] [text-wrap:balance] mb-6"
          >
            {parts.map((part, i) =>
              part.toLowerCase() === "ai-powered" ? (
                <span key={i} className="text-gradient">
                  {part}
                </span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </h1>

          <p
            data-hero-subtitle
            className="mb-6 text-base leading-relaxed text-muted-foreground max-w-md md:text-lg"
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
                className="rounded-full border border-border bg-surface/50 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
              >
                {tag.trim()}
              </span>
            ))}
          </div>

          <div data-hero-cta className="flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <Link href="/#contact">
                Start a Project
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
                  <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/projects">View My Work</Link>
            </Button>
          </div>
        </div>

        {/* Right: 3D Scene */}
        <div
          data-hero-3d
          className="relative aspect-square w-full max-w-lg justify-self-center lg:justify-self-end"
        >
          <Suspense
            fallback={
              <div className="absolute inset-0 rounded-full bg-[#0a0a12] animate-pulse" />
            }
          >
            <HeroScene />
          </Suspense>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="h-8 w-5 rounded-full border-2 border-foreground/20 p-1">
          <div className="mx-auto h-2 w-1 rounded-full bg-primary/60 animate-pulse-glow" />
        </div>
      </div>
    </section>
  );
}
