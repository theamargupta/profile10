"use client";

import { useRef } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Experience } from "@/lib/types";
import { formatDateRange } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function ExperienceTimeline({
  experiences,
}: {
  experiences: Experience[];
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-exp-item]", {
        x: -40,
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
        <SectionHeading label="Career" title="Experience" />
        <div className="mx-auto max-w-3xl">
          <div className="relative border-l border-[var(--color-surface-3)] pl-8">
            {experiences.map((exp) => (
              <div key={exp.id} data-exp-item className="relative mb-12 last:mb-0">
                <div className="absolute -left-[calc(2rem+5px)] top-1 h-2.5 w-2.5 rounded-full bg-[var(--color-accent-400)] shadow-[0_0_12px_rgba(168,245,0,0.5)]" />
                <div className="mb-1 flex flex-wrap items-center gap-3">
                  <h3 className="font-display font-semibold text-[var(--color-fg-0)]" style={{ fontSize: "var(--text-lg)" }}>
                    {exp.job_title}
                  </h3>
                  <span className="rounded-full border border-[var(--color-surface-4)] px-3 py-0.5 font-mono text-xs text-[var(--color-fg-2)]">
                    {exp.employment_type}
                  </span>
                </div>
                <p className="mb-1 text-sm font-medium text-[var(--color-accent-400)]/80">
                  {exp.company}
                </p>
                <p className="mb-3 font-mono text-xs text-[var(--color-fg-2)]">
                  {formatDateRange(exp.start_date, exp.end_date)} &middot;{" "}
                  {exp.location}
                </p>
                <p className="text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)" }}>
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
