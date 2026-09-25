// One place for what the machine-readable feeds (sitemap, RSS, llms.txt) say
// about the site. The headline matches the site's <title> in app/layout.tsx.
export const SITE_URL = "https://amargupta.tech";
export const SITE_NAME = "Amar Gupta";
export const SITE_HEADLINE = "Senior Frontend Developer — AI & MCP";
export const BLOG_DESCRIPTION =
  "Writing by Amar Gupta on frontend engineering, AI agents and MCP, from building them in production.";

export const postUrl = (slug: string) => `${SITE_URL}/blog/${slug}`;
