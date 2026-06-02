import type { Metadata } from "next";
import Link from "next/link";
import { getProfile } from "@/lib/queries";
import { YouTubeEmbed } from "@/components/dom/youtube-embed";
import { ContactSection } from "@/components/dom/contact-section";

// Booking link kept in one place (mirrors AuthorBio) so every CTA stays in sync.
const CAL_URL = "https://cal.com/amargupta.tech";
const DEMO_URL = "https://www.youtube.com/watch?v=W7x8udnp2xU";
const DEMO_POSTER = "https://img.youtube.com/vi/W7x8udnp2xU/maxresdefault.jpg";
const GITHUB = "https://github.com/theamargupta";
const LINKEDIN = "https://www.linkedin.com/in/amar-gupta-2684a1157/";

export const metadata: Metadata = {
  title: "Work with me — MCP Servers & AI Agents",
  description:
    "I build MCP servers and AI agents that plug into your product. 15+ production AI products shipped solo. Available for contract, project-based, and consulting work.",
  alternates: { canonical: "/hire" },
  openGraph: {
    type: "website",
    url: "https://amargupta.tech/hire",
    title: "Work with me — MCP Servers & AI Agents | Amar Gupta",
    description:
      "I build MCP servers and AI agents that plug into your product. 15+ production AI products shipped solo.",
    images: [DEMO_POSTER],
  },
};

// What I build — sourced from the profile services. Static so the page has no
// extra data dependency and renders instantly.
const SERVICES: { title: string; body: string }[] = [
  {
    title: "MCP Server Development",
    body: "Custom Model Context Protocol servers that connect AI assistants to your databases, APIs, and internal tools — OAuth-protected, production-grade.",
  },
  {
    title: "AI Agents & Workflow Automation",
    body: "Tool-calling agents that take real actions in your product, with a human-in-the-loop confirm step. Eliminate the manual, repetitive work.",
  },
  {
    title: "LLM Chatbot & RAG",
    body: "Intelligent chatbots and retrieval-augmented pipelines embedded into your web app for support, sales, or internal knowledge.",
  },
  {
    title: "System Design & Architecture",
    body: "Scalable design from database schema to microservices and event-driven systems — built to debug at 2am, not just demo.",
  },
  {
    title: "Full-Stack Web Development",
    body: "React, Next.js, Vue, Node.js, Supabase — from a fast MVP to a production system that holds up under real load.",
  },
  {
    title: "Technical Consulting",
    body: "AI integration strategy, code review, and architecture audits. Bring AI-first thinking in as a core part of the solution, not an add-on.",
  },
];

// Productized offers — fixed scope, "starting at" pricing so the decision is
// easy. Exact quote happens on the call.
const PACKAGES: { name: string; price: string; meta: string; body: string }[] = [
  {
    name: "MCP Server",
    price: "from $3,000",
    meta: "~2 weeks · fixed scope",
    body: "A custom MCP server wired into your stack — tools, auth, and the integrations your agents need to act.",
  },
  {
    name: "AI Chatbot / RAG",
    price: "from $2,500",
    meta: "1–2 weeks",
    body: "An LLM chatbot or RAG pipeline embedded in your product, grounded in your own data.",
  },
  {
    name: "Agent Automation",
    price: "from $4,000",
    meta: "audit + build",
    body: "I map a workflow that's eating your team's time, then ship the agent that automates it end-to-end.",
  },
  {
    name: "AI Feature Sprint",
    price: "from $2,000/mo",
    meta: "monthly · ongoing",
    body: "A rolling retainer to ship AI features into your product — design, build, iterate, repeat.",
  },
];

const PROOF = [
  "Setu", "Sutra", "Sandesh", "Swayam", "Sankalp", "Sathi", "Project Memory",
];

export default async function HirePage() {
  const profile = await getProfile();
  const email = profile?.email ?? "theamargupta.tech@gmail.com";

  return (
    <>
      {/* HERO */}
      <section className="pt-40 pb-16 md:pb-24">
        <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
          <p className="mb-4 font-mono text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent-400)]">
            Work with me
          </p>
          <h1
            className="max-w-4xl font-display font-bold text-[var(--color-fg-0)]"
            style={{ fontSize: "var(--text-5xl)", lineHeight: "var(--leading-tight)", letterSpacing: "var(--tracking-tight)" }}
          >
            I build MCP servers &amp; AI agents that{" "}
            <span className="text-[var(--color-accent-400)]">plug into your product.</span>
          </h1>
          <p
            className="mt-6 max-w-2xl text-[var(--color-fg-1)]"
            style={{ fontSize: "var(--text-lg)", lineHeight: "var(--leading-normal)" }}
          >
            15+ production AI products shipped solo. Deep, hands-on work with MCP, LLM
            integration, and agent workflows — not slideware, real systems that run.
            Available for contract, project-based, and consulting work.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={CAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="magnet"
              className="inline-flex h-12 items-center rounded-full bg-[var(--color-accent-400)] px-6 font-medium text-[var(--color-surface-0)] transition-all duration-300 hover:bg-[var(--color-accent-300)]"
            >
              Book a call →
            </a>
            <a
              href={`mailto:${email}`}
              className="inline-flex h-12 items-center rounded-full border border-[var(--color-surface-4)] px-6 font-medium text-[var(--color-fg-0)] transition-all duration-300 hover:border-[var(--color-accent-400)]/60 hover:bg-[var(--color-surface-2)]"
            >
              Email me
            </a>
            <a
              href="#demo"
              className="inline-flex h-12 items-center rounded-full border border-[var(--color-surface-4)] px-6 font-medium text-[var(--color-fg-0)] transition-all duration-300 hover:border-[var(--color-accent-400)]/60 hover:bg-[var(--color-surface-2)]"
            >
              Watch the demo
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { n: "15+", l: "AI products shipped" },
              { n: "7+", l: "Years full-stack" },
              { n: "MCP", l: "+ agents niche" },
              { n: "Remote", l: "Delhi · global" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-3xl font-bold text-[var(--color-accent-400)]">{s.n}</p>
                <p className="font-mono text-xs text-[var(--color-fg-2)]">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section id="demo" className="pb-24 md:pb-32">
        <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
          <div className="overflow-hidden rounded-3xl border border-[var(--color-surface-3)] shadow-[var(--shadow-glow)]">
            <YouTubeEmbed url={DEMO_URL} title="Sandesh — product demo" poster={DEMO_POSTER} autoplay />
          </div>
          <p className="mt-3 text-center font-mono text-xs text-[var(--color-fg-2)]">
            Sandesh — one of the AI products I built end-to-end (Claude-drafted content → rendered video, multi-platform).
          </p>
        </div>
      </section>

      {/* WHAT I BUILD */}
      <section className="pb-24 md:pb-32">
        <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
          <p className="mb-4 font-mono text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent-400)]">
            What I build
          </p>
          <h2
            className="mb-12 font-display font-semibold text-[var(--color-fg-0)]"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            Services
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <div
                key={s.title}
                className="h-full rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 p-7 backdrop-blur-xl transition-colors duration-500 hover:border-[var(--color-accent-400)]/60"
              >
                <p className="mb-4 font-mono text-xs text-[var(--color-accent-400)]/80">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mb-2 font-display font-semibold text-[var(--color-fg-0)]" style={{ fontSize: "var(--text-lg)" }}>
                  {s.title}
                </h3>
                <p className="text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)" }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="pb-24 md:pb-32">
        <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
          <p className="mb-4 font-mono text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent-400)]">
            Fixed-scope packages
          </p>
          <h2
            className="mb-3 font-display font-semibold text-[var(--color-fg-0)]"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            Clear scope, clear price.
          </h2>
          <p className="mb-12 max-w-2xl text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-base)" }}>
            Most work fits one of these. Exact quote on the call — every project is
            scoped before anyone commits.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PACKAGES.map((p) => (
              <div
                key={p.name}
                className="flex h-full flex-col rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 p-7 backdrop-blur-xl transition-colors duration-500 hover:border-[var(--color-accent-400)]/60"
              >
                <h3 className="font-display font-semibold text-[var(--color-fg-0)]" style={{ fontSize: "var(--text-lg)" }}>
                  {p.name}
                </h3>
                <p className="mt-2 font-display text-2xl font-bold text-[var(--color-accent-400)]">{p.price}</p>
                <p className="mb-4 font-mono text-xs text-[var(--color-fg-2)]">{p.meta}</p>
                <p className="text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)" }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section className="pb-24 md:pb-32">
        <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
          <div className="rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 p-8 backdrop-blur-xl md:p-10">
            <p className="mb-4 font-mono text-xs uppercase tracking-[var(--tracking-wider)] text-[var(--color-accent-400)]">
              Recently shipped
            </p>
            <p className="mb-6 text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-normal)" }}>
              A connected suite of AI products — all built and run solo, sharing one
              agent stack across chat, content, automation, and jobs.
            </p>
            <div className="flex flex-wrap gap-2">
              {PROOF.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-[var(--color-surface-4)] px-3 py-1.5 font-mono text-xs text-[var(--color-fg-1)]"
                >
                  {name}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-[var(--tracking-wider)]">
              <Link href="/projects" className="text-[var(--color-accent-400)] hover:underline">
                See all projects →
              </Link>
              <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="text-[var(--color-fg-2)] hover:text-[var(--color-fg-0)]">
                GitHub →
              </a>
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="text-[var(--color-fg-2)] hover:text-[var(--color-fg-0)]">
                LinkedIn →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="pb-24 md:pb-32">
        <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
          <div
            className="rounded-3xl border border-[var(--color-accent-400)]/30 p-10 text-center md:p-16"
            style={{ background: "radial-gradient(80% 120% at 50% 0%, rgba(168,245,0,0.08) 0%, rgba(5,5,7,0) 60%)" }}
          >
            <h2
              className="mx-auto max-w-2xl font-display font-bold text-[var(--color-fg-0)]"
              style={{ fontSize: "var(--text-4xl)", lineHeight: "var(--leading-tight)" }}
            >
              Have an AI feature to ship?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-base)" }}>
              Book a 20-minute call. I&apos;ll tell you straight whether I can build it,
              how long it takes, and what it costs — no fluff.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={CAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="magnet"
                className="inline-flex h-12 items-center rounded-full bg-[var(--color-accent-400)] px-7 font-medium text-[var(--color-surface-0)] transition-all duration-300 hover:bg-[var(--color-accent-300)]"
              >
                Book a call →
              </a>
              <a
                href={`mailto:${email}`}
                className="inline-flex h-12 items-center rounded-full border border-[var(--color-surface-4)] px-7 font-medium text-[var(--color-fg-0)] transition-all duration-300 hover:border-[var(--color-accent-400)]/60 hover:bg-[var(--color-surface-2)]"
              >
                Email me
              </a>
            </div>
          </div>
        </div>
      </section>

      <ContactSection email={email} />
    </>
  );
}
