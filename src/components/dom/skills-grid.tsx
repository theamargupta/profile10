"use client";

import { useRef } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import type { SkillCategory } from "@/lib/types";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function SkillsGrid({
  categories,
}: {
  categories: SkillCategory[];
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-skill-row]", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
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
        <SectionHeading label="Expertise" title="Technical Skills" />
        <div className="mx-auto max-w-3xl space-y-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              data-skill-row
              className="flex flex-col gap-2 rounded-2xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 px-6 py-4 backdrop-blur-xl sm:flex-row sm:items-start sm:gap-6"
            >
              <span className="shrink-0 font-mono text-xs font-medium uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent-400)] sm:w-32 sm:pt-0.5">
                {cat.category}
              </span>
              <p className="text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)" }}>
                {cat.skills}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
