"use client";

import Image from "next/image";
import Link from "next/link";
import { GlowCard } from "@/components/ui/glow-card";
import type { Project } from "@/lib/types";
import { iconMap } from "@/lib/icons";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/project/${project.id}`}>
      <GlowCard className="group h-full overflow-hidden p-0">
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
            <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-primary/10 to-purple-500/5">
              <span className="font-display text-xl font-semibold text-foreground/30">
                {project.title}
              </span>
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="mb-2 font-display text-lg font-semibold group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {project.description?.split("\n")[0]}
          </p>
          {project.project_tools.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.project_tools.slice(0, 5).map(({ tools: tool }) => {
                const Icon = iconMap[tool.icon];
                return (
                  <span
                    key={tool.id}
                    className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-medium"
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
      </GlowCard>
    </Link>
  );
}
