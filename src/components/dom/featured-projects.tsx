"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <section ref={ref} className="py-[15vh]">
      <div className="mx-auto max-w-7xl px-6">
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
          <Button variant="secondary" size="lg" asChild>
            <Link href="/projects">See All Projects</Link>
          </Button>
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
        <div className="glass-panel glow-border overflow-hidden rounded-2xl">
          {project.demo_img ? (
            <Image
              src={project.demo_img}
              alt={project.title}
              width={700}
              height={400}
              className="w-full object-cover"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/10">
              <span className="font-display text-2xl font-semibold text-foreground/60">
                {project.title}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={`${reversed ? "lg:order-1" : ""}`}>
        <h3 className="mb-4 font-display text-2xl font-semibold md:text-3xl">
          {project.title}
        </h3>
        <p className="mb-6 text-muted-foreground leading-relaxed">
          {project.description?.split("\n")[0]}
        </p>

        {project.project_tools.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Tech Stack
            </p>
            <div className="flex flex-wrap gap-2">
              {project.project_tools.map(({ tools: tool }) => {
                const Icon = iconMap[tool.icon];
                return (
                  <span
                    key={tool.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium"
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
          <Button size="sm" asChild>
            <Link href={`/project/${project.id}`}>Case Study</Link>
          </Button>
          {project.live_url && (
            <Button variant="glass" size="sm" asChild>
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Live
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
