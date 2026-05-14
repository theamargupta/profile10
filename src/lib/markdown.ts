import { Marked } from "marked";

const marked = new Marked({ gfm: true, breaks: false });

// Strip the legacy <article data-source="auto-blog">...</article> wrapper that
// older blog_published rows have around their (still-markdown) body.
const AUTO_BLOG_WRAP = /^<article\s+data-source="auto-blog">([\s\S]*)<\/article>\s*$/;

function looksLikeHtml(input: string): boolean {
  const trimmed = input.trimStart();
  if (!trimmed.startsWith("<")) return false;
  // Don't treat the legacy wrapper as "already HTML" — its contents are markdown.
  if (AUTO_BLOG_WRAP.test(trimmed)) return false;
  return /^<(p|div|section|article|h[1-6]|ul|ol|blockquote|pre|figure|table|img)\b/i.test(
    trimmed,
  );
}

function unwrapAutoBlog(input: string): string {
  const m = input.trimStart().match(AUTO_BLOG_WRAP);
  return m ? m[1] : input;
}

export function mdToHtml(input: string | null | undefined): string {
  if (!input) return "";
  const source = unwrapAutoBlog(input);
  if (looksLikeHtml(source)) return source;
  return marked.parse(source, { async: false }) as string;
}
