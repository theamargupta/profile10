"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Project } from "@/lib/types";
import { iconMap } from "@/lib/icons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-project-item]").forEach((el) => {
        gsap.from(el, {
          y: 80,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="py-28 md:py-40">
      <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
        <SectionHeading label="Selected Work" title="Projects" />
        <div className="space-y-32">
          {projects.slice(0, 3).map((project, index) => (
            <ProjectShowcase
              key={project.id}
              project={project}
              reversed={index % 2 !== 0}
            />
          ))}
        </div>
        <div className="mt-20 text-center">
          <Link
            href="/projects"
            data-cursor="magnet"
            className="inline-flex h-14 items-center rounded-full border border-[var(--color-surface-4)] px-8 font-medium text-[var(--color-fg-0)] transition-all duration-300 hover:border-[var(--color-accent-400)]/60 hover:bg-[var(--color-surface-2)]"
          >
            See All Projects
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProjectShowcase({
  project,
  reversed,
}: {
  project: Project;
  reversed: boolean;
}) {
  return (
    <div
      data-project-item
      className={`grid items-center gap-12 lg:grid-cols-2 ${reversed ? "lg:direction-rtl" : ""}`}
    >
      <div className={`${reversed ? "lg:order-2" : ""}`}>
        <div className="overflow-hidden rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 backdrop-blur-xl transition-all duration-500 hover:border-[var(--color-accent-400)]/60">
          {project.demo_img ? (
            <Image
              src={project.demo_img}
              alt={project.title}
              width={700}
              height={400}
              className="w-full object-cover"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center" style={{ background: "radial-gradient(70% 60% at 100% 0%, rgba(61,75,255,0.30) 0%, rgba(5,5,7,0) 60%)" }}>
              <span className="font-display text-2xl font-semibold text-[var(--color-fg-2)]">
                {project.title}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={`${reversed ? "lg:order-1" : ""}`}>
        <h3
          className="mb-4 font-display font-semibold text-[var(--color-fg-0)]"
          style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
        >
          {project.title}
        </h3>
        <p
          className="mb-6 text-[var(--color-fg-1)]"
          style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-normal)" }}
        >
          {project.description?.split("\n")[0]}
        </p>

        {project.project_tools.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 font-mono text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-2)]">
              Tech Stack
            </p>
            <div className="flex flex-wrap gap-2">
              {project.project_tools.map(({ tools: tool }) => {
                const Icon = iconMap[tool.icon];
                return (
                  <span
                    key={tool.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-surface-4)] px-3 py-1 font-mono text-xs text-[var(--color-fg-2)]"
                  >
                    {Icon && (
                      <Icon
                        className="h-3.5 w-3.5"
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

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/project/${project.id}`}
            data-cursor="magnet"
            className="inline-flex h-11 items-center rounded-full bg-[var(--color-accent-400)] px-5 text-sm font-medium text-[var(--color-surface-0)] transition-all duration-300 hover:bg-[var(--color-accent-300)]"
          >
            Case Study
          </Link>
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="magnet"
              className="inline-flex h-11 items-center rounded-full border border-[var(--color-surface-4)] px-5 text-sm font-medium text-[var(--color-fg-0)] transition-all duration-300 hover:border-[var(--color-accent-400)]/60 hover:bg-[var(--color-surface-2)]"
            >
              View Live
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
