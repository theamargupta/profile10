import dynamic from "next/dynamic";
import {
  getProfile,
  getFeaturedProjects,
  getServices,
  getExperiences,
  getSkillCategories,
  getCombinedBlogPosts,
} from "@/lib/queries";
import { Hero } from "@/components/dom/hero";
import { ServicesGrid } from "@/components/dom/services-grid";
import { FeaturedProjects } from "@/components/dom/featured-projects";
import { RecentWriting } from "@/components/dom/recent-writing";

// Below-fold sections — dynamic-imported so their JS chunks (with GSAP
// ScrollTrigger animations) don't compete with hero LCP. SSR HTML is still
// produced for SEO; only the client-side JS is deferred.
const ScrollMarquee = dynamic(() => import("@/components/dom/scroll-marquee"));
const AboutBrief = dynamic(() =>
  import("@/components/dom/about-brief").then((m) => ({ default: m.AboutBrief }))
);
const ExperienceTimeline = dynamic(() =>
  import("@/components/dom/experience-timeline").then((m) => ({
    default: m.ExperienceTimeline,
  }))
);
const SkillsGrid = dynamic(() =>
  import("@/components/dom/skills-grid").then((m) => ({ default: m.SkillsGrid }))
);
const ContactSection = dynamic(() =>
  import("@/components/dom/contact-section").then((m) => ({
    default: m.ContactSection,
  }))
);

export default async function Home() {
  const [profile, projects, services, experiences, skills, blogPosts] =
    await Promise.all([
      getProfile(),
      getFeaturedProjects(),
      getServices(),
      getExperiences(),
      getSkillCategories(),
      getCombinedBlogPosts(),
    ]);

  const recentPosts = blogPosts.slice(0, 3);

  return (
    <>
      <Hero
        headline={profile?.headline ?? "I build production web applications."}
        subtitle={
          profile?.subtitle ??
          "React · Next.js · Vue 3 · Node.js · TypeScript · Supabase"
        }
        description={profile?.bio_short ?? ""}
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
      <RecentWriting posts={recentPosts} />
      <ContactSection email={profile?.email ?? ""} />
    </>
  );
}
