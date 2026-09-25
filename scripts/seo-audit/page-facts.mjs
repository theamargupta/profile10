// Pure: HTML string -> the SEO facts the audit measures. No network, no DOM
// library — regexes over server-rendered HTML are enough for head tags and
// JSON-LD, and keep this runnable with plain `node`.

const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"));
  return m ? decode(m[1]) : null;
}

function metaTags(html) {
  const out = {};
  for (const tag of html.match(/<meta\s[^>]*>/gi) ?? []) {
    const key = attr(tag, "property") ?? attr(tag, "name");
    const content = attr(tag, "content");
    if (!key || content === null) continue;
    (out[key] ??= []).push(content);
  }
  return out;
}

function jsonLdBlocks(html) {
  const blocks = [];
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  for (const m of html.matchAll(re)) {
    try {
      blocks.push(JSON.parse(m[1]));
    } catch (err) {
      blocks.push({ "@parseError": String(err) });
    }
  }
  return blocks;
}

// Flatten @graph so each typed node is checked on its own.
function jsonLdNodes(blocks) {
  return blocks.flatMap((b) => (Array.isArray(b["@graph"]) ? b["@graph"] : [b]));
}

// Google's Article structured data has no *required* fields; these are its
// recommended ones (developers.google.com/search/docs/appearance/structured-data/article).
export const ARTICLE_RECOMMENDED = ["headline", "image", "datePublished", "dateModified", "author"];

export function articleGaps(node) {
  return ARTICLE_RECOMMENDED.filter((k) => node[k] === undefined || node[k] === "");
}

function headings(html) {
  return [...html.matchAll(/<h([1-6])[\s>]/gi)].map((m) => Number(m[1]));
}

// A skip is going down more than one level (h2 -> h4). Going back up is fine.
export function headingSkips(levels) {
  const skips = [];
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) skips.push(`h${levels[i - 1]}->h${levels[i]}`);
  }
  return skips;
}

// alt="" is a deliberate decorative marker and passes; only a missing attribute fails.
function imagesMissingAlt(html) {
  return (html.match(/<img\s[^>]*>/gi) ?? [])
    .filter((tag) => attr(tag, "alt") === null)
    .map((tag) => attr(tag, "src") ?? "(no src)");
}

export function pageFacts(html) {
  const meta = metaTags(html);
  const first = (k) => meta[k]?.[0] ?? null;
  const canonicalTag = html.match(/<link\s[^>]*rel="canonical"[^>]*>/i)?.[0];
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const nodes = jsonLdNodes(jsonLdBlocks(html));
  const articles = nodes.filter((n) => ["Article", "BlogPosting"].includes(n["@type"]));
  const levels = headings(html);

  return {
    title: titleMatch ? decode(titleMatch[1]) : null,
    description: first("description"),
    canonical: canonicalTag ? attr(canonicalTag, "href") : null,
    robots: first("robots"),
    og: {
      title: first("og:title"),
      description: first("og:description"),
      type: first("og:type"),
      url: first("og:url"),
      image: first("og:image"),
      imageAlt: first("og:image:alt"),
    },
    twitter: {
      card: first("twitter:card"),
      title: first("twitter:title"),
      image: first("twitter:image"),
    },
    h1Count: levels.filter((l) => l === 1).length,
    headingSkips: headingSkips(levels),
    imagesMissingAlt: imagesMissingAlt(html),
    jsonLdTypes: nodes.map((n) => n["@type"] ?? n["@parseError"] ?? "(untyped)"),
    articles: articles.map((a) => ({ type: a["@type"], image: a.image ?? null, gaps: articleGaps(a) })),
  };
}
