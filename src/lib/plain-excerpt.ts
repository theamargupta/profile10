const EXCERPT_MAX = 240;

// Plain-text excerpt from a markdown (or HTML-wrapped markdown) post body.
// Used by the /blog cards (lib/queries.ts) and the feeds (lib/feeds). Raw
// `[text](url)` here put 60-character URLs into /blog cards and overflowed
// them on mobile (lane 3 audit, 2026-09-25).
export function plainExcerpt(source: string | null | undefined): string | null {
  if (!source) return null;
  const text = source
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images: drop entirely
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links: keep the text
    .replace(/^\s{0,3}#{1,6}\s+/gm, "") // headings
    .replace(/^\s{0,3}>\s?/gm, "") // blockquotes
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "") // list markers
    .replace(/(\*\*|__|\*|_)(\S(?:.*?\S)?)\1(?!\w)/g, "$2") // emphasis, not snake_case
    .replace(/`+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  return text.slice(0, EXCERPT_MAX).trimEnd();
}
