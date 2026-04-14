import type { Metadata } from "next";
import { getProjects } from "@/lib/queries";
import { ProjectsListing } from "@/components/dom/projects-listing";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Featured projects including MCP servers, SaaS platforms, eCommerce solutions, and AI-integrated applications.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <section className="pt-40 pb-28 md:pb-40">
      <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
        <div className="mb-16">
          <p className="mb-4 font-mono text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent-400)]">
            Portfolio
          </p>
          <h1
            className="font-display font-bold text-[var(--color-fg-0)]"
            style={{ fontSize: "var(--text-4xl)", lineHeight: "var(--leading-tight)" }}
          >
            All Projects
          </h1>
        </div>
        <ProjectsListing projects={projects} />
      </div>
    </section>
  );
}
