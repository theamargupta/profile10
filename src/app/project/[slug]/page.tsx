import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/lib/queries";
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
      <section className="pt-40 pb-20">
        <div className="mx-auto max-w-5xl" style={{ padding: "0 var(--gutter)" }}>
          <Link
            href="/projects"
            className="mb-8 inline-flex items-center font-mono text-xs uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-2)] hover:text-[var(--color-fg-0)] transition-colors"
          >
            &larr; All Projects
          </Link>

          <h1
            className="mb-6 font-display font-bold text-[var(--color-fg-0)]"
            style={{ fontSize: "var(--text-4xl)", lineHeight: "var(--leading-tight)" }}
          >
            {project.title}
          </h1>

          <div className="mb-8 flex flex-wrap gap-3">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="magnet"
                className="inline-flex h-11 items-center rounded-full bg-[var(--color-accent-400)] px-5 text-sm font-medium text-[var(--color-surface-0)] transition-all duration-300 hover:bg-[var(--color-accent-300)]"
              >
                View Live
              </a>
            )}
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="magnet"
                className="inline-flex h-11 items-center rounded-full border border-[var(--color-surface-4)] px-5 text-sm font-medium text-[var(--color-fg-0)] transition-all duration-300 hover:border-[var(--color-accent-400)]/60 hover:bg-[var(--color-surface-2)]"
              >
                Source Code
              </a>
            )}
          </div>

          <div className="mb-16 overflow-hidden rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 backdrop-blur-xl">
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
              <div
                className="flex aspect-video items-center justify-center"
                style={{ background: "radial-gradient(70% 60% at 50% 40%, rgba(61,75,255,0.25) 0%, rgba(5,5,7,0) 60%)" }}
              >
                <span className="font-display text-4xl font-bold text-[var(--color-fg-3)]">
                  {project.title}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <CaseStudyContent project={project} />

      <section className="py-28 md:py-40">
        <div className="mx-auto max-w-5xl text-center" style={{ padding: "0 var(--gutter)" }}>
          <p className="mb-4 font-mono text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent-400)]">
            Next Project
          </p>
          <Link
            href={`/project/${nextProject.id}`}
            className="group inline-block"
          >
            <h2
              className="font-display font-semibold text-[var(--color-fg-0)] transition-colors group-hover:text-[var(--color-accent-400)]"
              style={{ fontSize: "var(--text-3xl)" }}
            >
              {nextProject.title}
            </h2>
          </Link>
        </div>
      </section>
    </>
  );
}
