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
    <section ref={ref} className="py-[15vh]">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading label="Expertise" title="Technical Skills" />
        <div className="mx-auto max-w-3xl space-y-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              data-skill-row
              className="glass-panel flex flex-col gap-2 rounded-xl px-6 py-4 sm:flex-row sm:items-start sm:gap-6"
            >
              <span className="shrink-0 font-mono text-xs font-medium uppercase tracking-widest text-primary sm:w-32 sm:pt-0.5">
                {cat.category}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {cat.skills}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
