"use client";

import { useRef } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

interface AboutBriefProps {
  bioShort: string;
  howIWork: string;
}

export function AboutBrief({ bioShort, howIWork }: AboutBriefProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-about-text]", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
        },
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="py-28 md:py-40">
      <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
        <SectionHeading label="About" title="Get to Know Me" />
        <div className="mx-auto grid max-w-5xl gap-16 lg:grid-cols-2">
          <div data-about-text className="rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 p-8 backdrop-blur-xl md:p-10">
            <h3
              className="mb-4 font-display font-semibold text-[var(--color-fg-0)]"
              style={{ fontSize: "var(--text-xl)" }}
            >
              Background
            </h3>
            <p className="text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-normal)" }}>
              {bioShort}
            </p>
          </div>
          <div data-about-text className="rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 p-8 backdrop-blur-xl md:p-10">
            <h3
              className="mb-4 font-display font-semibold text-[var(--color-fg-0)]"
              style={{ fontSize: "var(--text-xl)" }}
            >
              How I Work
            </h3>
            <p className="text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-normal)" }}>
              {howIWork}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
