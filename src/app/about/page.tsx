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
import { typeClasses } from "@/lib/type-classes";

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
      <section className="pt-32 pb-[10vh]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="glass-panel glow-border overflow-hidden rounded-2xl">
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
                  <div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/10">
                    <span className="font-display text-6xl font-bold text-foreground/20">
                      AG
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-3">
              <p className={`${typeClasses.micro} mb-4 text-primary`}>
                About Me
              </p>
              <h1 className={`${typeClasses.h1} mb-8`}>{profile?.name}</h1>
              <p className={`${typeClasses.body} mb-6`}>
                {profile?.title}
              </p>
              {profile?.bio_long?.split("\n").map((paragraph, i) => (
                <p
                  key={i}
                  className="mb-4 text-muted-foreground leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}

              <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
                <div>
                  <p className="font-display text-3xl font-bold text-primary">
                    7+
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Years Experience
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-primary">
                    500+
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Projects Delivered
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-primary">
                    4+
                  </p>
                  <p className="text-sm text-muted-foreground">
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

      <section className="py-[10vh]">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className={`${typeClasses.h2} mb-8 text-center`}>How I Work</h2>
          <div className="mx-auto max-w-3xl glass-panel rounded-2xl p-8 md:p-10">
            <p className="text-muted-foreground leading-relaxed">
              {profile?.how_i_work}
            </p>
          </div>
        </div>
      </section>

      <ContactSection email={profile?.email ?? ""} />
    </>
  );
}
