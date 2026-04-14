import type { Metadata } from "next";
import { getProjects } from "@/lib/queries";
import { ProjectsListing } from "@/components/dom/projects-listing";
import { typeClasses } from "@/lib/type-classes";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Featured projects including MCP servers, SaaS platforms, eCommerce solutions, and AI-integrated applications.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <section className="pt-32 pb-[15vh]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className={`${typeClasses.micro} mb-4 text-primary`}>Portfolio</p>
          <h1 className={typeClasses.h1}>All Projects</h1>
        </div>
        <ProjectsListing projects={projects} />
      </div>
    </section>
  );
}
