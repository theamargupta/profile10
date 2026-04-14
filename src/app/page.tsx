import {
  getProfile,
  getFeaturedProjects,
  getServices,
  getExperiences,
  getSkillCategories,
} from "@/lib/queries";
import { Hero } from "@/components/dom/hero";
import { ServicesGrid } from "@/components/dom/services-grid";
import { FeaturedProjects } from "@/components/dom/featured-projects";
import { AboutBrief } from "@/components/dom/about-brief";
import { ExperienceTimeline } from "@/components/dom/experience-timeline";
import { SkillsGrid } from "@/components/dom/skills-grid";
import { ContactSection } from "@/components/dom/contact-section";
import ScrollMarquee from "@/components/dom/scroll-marquee";

export default async function Home() {
  const [profile, projects, services, experiences, skills] = await Promise.all([
    getProfile(),
    getFeaturedProjects(),
    getServices(),
    getExperiences(),
    getSkillCategories(),
  ]);

  return (
    <>
      <Hero
        headline={profile?.headline ?? "I build AI-powered web applications."}
        subtitle={
          profile?.subtitle ??
          "MCP Servers · LLM Integration · Workflow Automation"
        }
      />
      <ScrollMarquee />
      <ServicesGrid services={services} />
      <FeaturedProjects projects={projects} />
      <AboutBrief
        bioShort={profile?.bio_short ?? ""}
        howIWork={profile?.how_i_work ?? ""}
      />
      <ExperienceTimeline experiences={experiences} />
      <SkillsGrid categories={skills} />
      <ContactSection email={profile?.email ?? ""} />
    </>
  );
}
