import type { Metadata } from "next";
import Image from "next/image";
import {
  getProfile,
  getExperiences,
  getSkillCategories,
} from "@/lib/queries";
import { ExperienceTimeline } from "@/components/dom/experience-timeline";
import { SkillsGrid } from "@/components/dom/skills-grid";
import { ContactSection } from "@/components/dom/contact-section";

export const metadata: Metadata = {
  title: "About",
  description:
    "AI-Powered Full Stack Developer with 7+ years of experience. Specializing in MCP Servers, LLM Integration, System Design.",
};

export default async function AboutPage() {
  const [profile, experiences, skills] = await Promise.all([
    getProfile(),
    getExperiences(),
    getSkillCategories(),
  ]);

  return (
    <>
      <section className="pt-40 pb-20">
        <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
          <div className="grid items-center gap-16 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 backdrop-blur-xl">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.name}
                    width={480}
                    height={600}
                    className="w-full object-cover"
                    priority
                  />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center" style={{ background: "radial-gradient(70% 60% at 50% 40%, rgba(61,75,255,0.25) 0%, rgba(5,5,7,0) 60%)" }}>
                    <span className="font-display text-6xl font-bold text-[var(--color-fg-3)]">
                      AG
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-3">
              <p className="mb-4 font-mono text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent-400)]">
                About Me
              </p>
              <h1
                className="mb-8 font-display font-bold text-[var(--color-fg-0)]"
                style={{ fontSize: "var(--text-4xl)", lineHeight: "var(--leading-tight)" }}
              >
                {profile?.name}
              </h1>
              <p
                className="mb-6 text-[var(--color-fg-0)]"
                style={{ fontSize: "var(--text-lg)", lineHeight: "var(--leading-normal)" }}
              >
                {profile?.title}
              </p>
              {profile?.bio_long?.split("\n").map((paragraph, i) => (
                <p
                  key={i}
                  className="mb-4 text-[var(--color-fg-1)]"
                  style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-normal)" }}
                >
                  {paragraph}
                </p>
              ))}

              <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
                <div>
                  <p className="font-display text-3xl font-bold text-[var(--color-accent-400)]">
                    7+
                  </p>
                  <p className="font-mono text-xs text-[var(--color-fg-2)]">
                    Years Experience
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-[var(--color-accent-400)]">
                    500+
                  </p>
                  <p className="font-mono text-xs text-[var(--color-fg-2)]">
                    Projects Delivered
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-[var(--color-accent-400)]">
                    4+
                  </p>
                  <p className="font-mono text-xs text-[var(--color-fg-2)]">
                    Countries Served
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ExperienceTimeline experiences={experiences} />
      <SkillsGrid categories={skills} />

      <section className="py-28 md:py-40">
        <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
          <h2
            className="mb-8 text-center font-display font-semibold text-[var(--color-fg-0)]"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            How I Work
          </h2>
          <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 p-8 backdrop-blur-xl md:p-10">
            <p className="text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-normal)" }}>
              {profile?.how_i_work}
            </p>
          </div>
        </div>
      </section>

      <ContactSection email={profile?.email ?? ""} />
    </>
  );
}
