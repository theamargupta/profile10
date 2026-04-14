"use client";

import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { iconMap } from "@/lib/icons";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/project/${project.id}`}>
      <div className="group h-full overflow-hidden rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 backdrop-blur-xl transition-all duration-500 hover:border-[var(--color-accent-400)]/60">
        <div className="overflow-hidden">
          {project.demo_img ? (
            <Image
              src={project.demo_img}
              alt={project.title}
              width={600}
              height={340}
              className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex aspect-video items-center justify-center"
              style={{ background: "radial-gradient(70% 60% at 50% 40%, rgba(61,75,255,0.20) 0%, rgba(5,5,7,0) 60%)" }}
            >
              <span className="font-display text-xl font-semibold text-[var(--color-fg-3)]">
                {project.title}
              </span>
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="mb-2 font-display font-semibold text-[var(--color-fg-0)] transition-colors group-hover:text-[var(--color-accent-400)]" style={{ fontSize: "var(--text-lg)" }}>
            {project.title}
          </h3>
          <p className="mb-4 line-clamp-2 text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-sm)" }}>
            {project.description?.split("\n")[0]}
          </p>
          {project.project_tools.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.project_tools.slice(0, 5).map(({ tools: tool }) => {
                const Icon = iconMap[tool.icon];
                return (
                  <span
                    key={tool.id}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--color-surface-4)] px-2.5 py-0.5 font-mono text-[11px] text-[var(--color-fg-2)]"
                  >
                    {Icon && (
                      <Icon
                        className="h-3 w-3"
                        style={{ color: tool.color ?? undefined }}
                      />
                    )}
                    {tool.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
