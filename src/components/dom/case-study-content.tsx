"use client";

import { useRef } from "react";
import type { Project } from "@/lib/types";
import { iconMap } from "@/lib/icons";
import { GlowCard } from "@/components/ui/glow-card";
import { typeClasses } from "@/lib/type-classes";
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
    <section ref={ref} className="pb-[10vh]">
      <div className="mx-auto max-w-5xl px-6 space-y-16">
        <div data-case-block>
          <h2 className={`${typeClasses.h3} mb-6`}>Overview</h2>
          {project.description?.split("\n").map((p, i) => (
            <p key={i} className="mb-3 text-muted-foreground leading-relaxed">
              {p}
            </p>
          ))}
        </div>

        {project.project_tools.length > 0 && (
          <div data-case-block>
            <h2 className={`${typeClasses.h3} mb-6`}>Tech Stack</h2>
            <div className="flex flex-wrap gap-3">
              {project.project_tools.map(({ tools: tool }) => {
                const Icon = iconMap[tool.icon];
                return (
                  <span
                    key={tool.id}
                    className="glass-panel inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
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
            <h2 className={`${typeClasses.h3} mb-6`}>Key Features</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {project.project_features.map((feat) => (
                <div
                  key={feat.id}
                  className="flex items-start gap-3 glass-panel rounded-xl px-5 py-4"
                >
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <p className="text-sm text-muted-foreground">{feat.feature}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {project.project_challenges.length > 0 && (
          <div data-case-block>
            <h2 className={`${typeClasses.h3} mb-6`}>Challenges & Solutions</h2>
            <div className="space-y-6">
              {project.project_challenges.map((challenge) => (
                <GlowCard key={challenge.id}>
                  <h3 className="mb-3 font-display text-base font-semibold">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {challenge.solution}
                  </p>
                </GlowCard>
              ))}
            </div>
          </div>
        )}

        {project.architecture && (
          <div data-case-block>
            <h2 className={`${typeClasses.h3} mb-6`}>Architecture</h2>
            <div className="glass-panel rounded-xl p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.architecture}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
