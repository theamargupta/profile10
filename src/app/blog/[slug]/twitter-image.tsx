import { postOgImage } from "@/lib/og/post-og-image";

// The post's own share image: its cover, or a title card. See src/lib/og/post-og-image.tsx.
// No `size`/`contentType` exports on purpose: a cover keeps its own size and type.
export const alt = "Blog post by Amar Gupta — Senior Frontend Developer, AI & MCP";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return postOgImage(slug);
}
