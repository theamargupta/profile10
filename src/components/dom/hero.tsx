"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import MagneticButton from "@/components/ui/magnetic-button";
import { AnimatedTagline } from "@/components/dom/animated-tagline";

gsap.registerPlugin();

const HeroScene = dynamic(() => import("@/components/canvas/hero-scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[var(--color-surface-0)]" />
  ),
});

interface HeroProps {
  headline: string;
  subtitle: string;
  /** Short bio paragraph under the headline. Sourced from the profile record. */
  description: string;
}

export function Hero({ headline, subtitle, description }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [mountScene, setMountScene] = useState(false);

  // Defer 3D mount until after first paint — keeps hero text LCP fast.
  useEffect(() => {
    const ric =
      typeof window !== "undefined" &&
      typeof (window as Window & { requestIdleCallback?: (cb: () => void) => number })
        .requestIdleCallback === "function"
        ? (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 200);
    const id = ric(() => setMountScene(true));
    return () => {
      if (typeof window !== "undefined") {
        const cancel = (window as Window & {
          cancelIdleCallback?: (id: number) => void;
        }).cancelIdleCallback;
        if (cancel) cancel(id as number);
        else window.clearTimeout(id as number);
      }
    };
  }, []);

  useGSAP(
    () => {
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-hero-badge]", { y: 12, duration: 0.5, delay: 0.1 })
        .from("[data-hero-subtitle]", { y: 18, duration: 0.6, delay: 0.4 })
        .from("[data-hero-tags]", { y: 14, duration: 0.5 }, "-=0.3")
        .from("[data-hero-cta]", { y: 14, duration: 0.5 }, "-=0.3");
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden"
    >
      <Suspense
        fallback={
          <div
            aria-hidden
            className="absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(50% 50% at 70% 35%, rgba(61,75,255,0.32) 0%, rgba(5,5,7,0) 60%)",
            }}
          />
        }
      >
        {mountScene ? (
          <div aria-hidden className="absolute inset-0 z-0 pointer-events-none">
            <HeroScene />
          </div>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(50% 50% at 70% 35%, rgba(61,75,255,0.32) 0%, rgba(5,5,7,0) 60%)",
            }}
          />
        )}
      </Suspense>

      {/* Gradient veil so headline reads against the blob */}
      <div
        aria-hidden
        className="absolute inset-0 z-[var(--z-hero-bg)] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,5,7,0.85) 0%, rgba(5,5,7,0.55) 45%, rgba(5,5,7,0) 75%)",
        }}
      />

      <div
        className="relative z-10 mx-auto w-full pb-24 pt-40"
        style={{ maxWidth: "var(--container-max)", padding: "10rem var(--gutter) 6rem" }}
      >
        <AnimatedTagline primary={headline} accentWord="production" />

        <p
          data-hero-subtitle
          className="mt-10 max-w-2xl font-body text-[var(--color-fg-1)]"
          style={{ fontSize: "var(--text-lg)", lineHeight: "var(--leading-snug)" }}
        >
          {description}
        </p>

        <div data-hero-tags className="mt-8 flex flex-wrap gap-2">
          {subtitle.split(/[·•,]/).map((tag) => (
            <span
              key={tag.trim()}
              className="rounded-full border border-[var(--color-surface-4)] bg-[var(--color-surface-1)]/40 px-3 py-1 font-mono text-xs text-[var(--color-fg-2)] backdrop-blur-sm"
            >
              {tag.trim()}
            </span>
          ))}
        </div>

        <div data-hero-cta className="mt-12 flex flex-col gap-4 sm:flex-row">
          <MagneticButton href="/projects" variant="primary" size="md">
            View My Work
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
              <path
                d="M3 8h10m0 0L9 4m4 4L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </MagneticButton>
          <MagneticButton href="/#contact" variant="ghost" size="md">
            Get in touch
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
