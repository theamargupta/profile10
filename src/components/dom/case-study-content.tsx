"use client";

import { useRef } from "react";
import type { Project } from "@/lib/types";
import { iconMap } from "@/lib/icons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function CaseStudyContent({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-case-block]", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
        },
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="pb-28 md:pb-40">
      <div className="mx-auto max-w-5xl space-y-16" style={{ padding: "0 var(--gutter)" }}>
        <div data-case-block>
          <h2
            className="mb-6 font-display font-semibold text-[var(--color-fg-0)]"
            style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
          >
            Overview
          </h2>
          {project.description?.split("\n").map((p, i) => (
            <p key={i} className="mb-3 text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-normal)" }}>
              {p}
            </p>
          ))}
        </div>

        {project.project_tools.length > 0 && (
          <div data-case-block>
            <h2
              className="mb-6 font-display font-semibold text-[var(--color-fg-0)]"
              style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
            >
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-3">
              {project.project_tools.map(({ tools: tool }) => {
                const Icon = iconMap[tool.icon];
                return (
                  <span
                    key={tool.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 px-4 py-2 text-sm font-medium text-[var(--color-fg-0)] backdrop-blur-xl"
                  >
                    {Icon && (
                      <Icon
                        className="h-4 w-4"
                        style={{ color: tool.color ?? undefined }}
                      />
                    )}
                    {tool.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {project.project_features.length > 0 && (
          <div data-case-block>
            <h2
              className="mb-6 font-display font-semibold text-[var(--color-fg-0)]"
              style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
            >
              Key Features
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {project.project_features.map((feat) => (
                <div
                  key={feat.id}
                  className="flex items-start gap-3 rounded-xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 px-5 py-4 backdrop-blur-xl"
                >
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent-400)]" />
                  <p className="text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-sm)" }}>{feat.feature}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {project.project_challenges.length > 0 && (
          <div data-case-block>
            <h2
              className="mb-6 font-display font-semibold text-[var(--color-fg-0)]"
              style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
            >
              Challenges & Solutions
            </h2>
            <div className="space-y-6">
              {project.project_challenges.map((challenge) => (
                <div key={challenge.id} className="rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 p-8 backdrop-blur-xl">
                  <h3 className="mb-3 font-display font-semibold text-[var(--color-fg-0)]" style={{ fontSize: "var(--text-base)" }}>
                    {challenge.title}
                  </h3>
                  <p className="text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)" }}>
                    {challenge.solution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {project.architecture && (
          <div data-case-block>
            <h2
              className="mb-6 font-display font-semibold text-[var(--color-fg-0)]"
              style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
            >
              Architecture
            </h2>
            <div className="rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 p-6 backdrop-blur-xl">
              <p className="text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)" }}>
                {project.architecture}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
