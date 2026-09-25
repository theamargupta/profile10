import type { Metadata } from "next";

// Next merges route metadata SHALLOWLY: a page that sets `openGraph` replaces the
// root layout's whole openGraph object (Next 16.2.3 generate-metadata.md, "Merging").
// So the site-wide fields live here and every section spreads them back in.
// Without a page-level openGraph, /about, /projects and /blog shared the home
// page's og:url and og:title (audit finding #7).

export const SITE_URL = "https://amargupta.tech";
export const SITE_NAME = "Amar Gupta";

export const SITE_OPEN_GRAPH = {
  siteName: SITE_NAME,
  locale: "en_US",
  type: "website",
} as const;

// The root's file-based og:image (src/app/opengraph-image.tsx) is merged INTO
// openGraph, so a section's openGraph must name it again or it vanishes.
export const SITE_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Amar Gupta — Senior Frontend Developer — AI & MCP",
};

// Same for `twitter`: without these, a section's card lost its creator and image.
export const SITE_TWITTER = {
  card: "summary_large_image",
  creator: "@theamargupta",
  images: ["/opengraph-image"],
} as const;

// RSS autodiscovery (lane 1's /rss.xml). `alternates` is replaced whole by a page
// that sets its own canonical, so each section repeats it.
export const SITE_FEEDS = { "application/rss+xml": `${SITE_URL}/rss.xml` };

type Section = { path: `/${string}`; title: string; description: string };

export function sectionMetadata({ path, title, description }: Section): Metadata {
  const shareTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path, types: SITE_FEEDS },
    openGraph: { ...SITE_OPEN_GRAPH, url: `${SITE_URL}${path}`, title: shareTitle, description, images: [SITE_OG_IMAGE] },
    twitter: { ...SITE_TWITTER, images: [...SITE_TWITTER.images], title: shareTitle, description },
  };
}
