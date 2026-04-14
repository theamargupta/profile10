import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { typeClasses } from "@/lib/type-classes";
import { CaseStudyContent } from "@/components/dom/case-study-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: project.title,
    description: project.description?.split("\n")[0] ?? "",
    openGraph: {
      title: project.title,
      description: project.description?.split("\n")[0] ?? "",
      images: project.demo_img ? [project.demo_img] : [],
    },
  };
}

export default async function ProjectCaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const allProjects = await getProjects();
  const currentIndex = allProjects.findIndex((p) => p.id === slug);
  const nextProject =
    currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : allProjects[0];

  return (
    <>
      <section className="pt-32 pb-[10vh]">
        <div className="mx-auto max-w-5xl px-6">
          <Link
            href="/projects"
            className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; All Projects
          </Link>

          <h1 className={`${typeClasses.h1} mb-6`}>{project.title}</h1>

          <div className="mb-8 flex flex-wrap gap-3">
            {project.live_url && (
              <Button size="sm" asChild>
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Live
                </a>
              </Button>
            )}
            {project.repo_url && (
              <Button variant="glass" size="sm" asChild>
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source Code
                </a>
              </Button>
            )}
          </div>

          <div className="glass-panel glow-border mb-16 overflow-hidden rounded-2xl">
            {project.demo_img ? (
              <Image
                src={project.demo_img}
                alt={project.title}
                width={1200}
                height={680}
                className="w-full object-cover"
                priority
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/10">
                <span className="font-display text-4xl font-bold text-foreground/20">
                  {project.title}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <CaseStudyContent project={project} />

      <section className="py-[10vh]">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className={`${typeClasses.micro} mb-4 text-primary`}>
            Next Project
          </p>
          <Link
            href={`/project/${nextProject.id}`}
            className="group inline-block"
          >
            <h2 className="font-display text-3xl font-semibold transition-colors group-hover:text-primary md:text-4xl">
              {nextProject.title}
            </h2>
          </Link>
        </div>
      </section>
    </>
  );
}
