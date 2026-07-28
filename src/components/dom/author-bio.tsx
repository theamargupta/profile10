import Image from "next/image";
import type { Profile } from "@/lib/types";

// Fixed booking link (kept here so every article's CTA stays in sync).
const CAL_URL = "https://cal.com/amargupta.tech";

/**
 * "About the author" card rendered at the end of every blog article.
 * Sourced from the single `profiles` row so details stay in sync site-wide;
 * falls back to sensible defaults if a field is empty.
 */
export function AuthorBio({ profile }: { profile: Profile | null }) {
  const name = profile?.name ?? "Amar Gupta";
  const title = profile?.title ?? "Senior Full Stack Developer";
  const bio =
    profile?.bio_short ??
    profile?.summary ??
    "I build production web applications end to end — React, Next.js, Vue 3, Node.js and Supabase — with 7+ years in full-stack development.";
  const location = profile?.location ?? "Delhi, India";
  const email = profile?.email ?? "theamargupta.tech@gmail.com";
  const website = (profile?.website ?? "amargupta.tech").replace(/^https?:\/\//, "");
  const avatar = profile?.avatar_url || "/amar-gupta.png";
  const availableFor = profile?.available_for;

  return (
    <section
      aria-label="About the author"
      className="mt-16 rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 p-8 backdrop-blur-xl md:p-10"
    >
      <p className="mb-6 font-mono text-[11px] uppercase tracking-[var(--tracking-wider)] text-[var(--color-accent-400)]">
        About the author
      </p>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Image
          src={avatar}
          alt={name}
          width={104}
          height={104}
          className="h-24 w-24 shrink-0 rounded-full object-cover ring-2 ring-[var(--color-accent-400)]/40 md:h-28 md:w-28"
        />
        <div className="min-w-0">
          <h2
            className="font-display font-semibold text-[var(--color-fg-0)]"
            style={{ fontSize: "var(--text-xl)" }}
          >
            {name}
          </h2>
          <p className="mt-0.5 text-sm font-medium text-[var(--color-accent-400)]">{title}</p>
          <p
            className="mt-3 text-[var(--color-fg-1)]"
            style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-normal)" }}
          >
            {bio}
          </p>
          <p className="mt-3 font-mono text-xs text-[var(--color-fg-2)]">
            📍 {location}
            {availableFor ? ` · Open to ${availableFor}` : ""}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={CAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="magnet"
              className="inline-flex h-10 items-center rounded-full bg-[var(--color-accent-400)] px-5 text-sm font-medium text-[var(--color-surface-0)] transition-all duration-300 hover:bg-[var(--color-accent-300)]"
            >
              Book a call →
            </a>
            <a
              href={`mailto:${email}`}
              className="inline-flex h-10 items-center rounded-full border border-[var(--color-surface-4)] px-5 text-sm font-medium text-[var(--color-fg-0)] transition-all duration-300 hover:border-[var(--color-accent-400)]/60 hover:bg-[var(--color-surface-2)]"
            >
              Email me
            </a>
            <a
              href={`https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="magnet"
              className="inline-flex h-10 items-center rounded-full border border-[var(--color-surface-4)] px-5 text-sm font-medium text-[var(--color-fg-0)] transition-all duration-300 hover:border-[var(--color-accent-400)]/60 hover:bg-[var(--color-surface-2)]"
            >
              {website} →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
