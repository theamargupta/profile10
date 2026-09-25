import { ImageResponse } from "next/og";
import { THEME } from "@/lib/theme/colors";
import { getCombinedBlogPostBySlug } from "@/lib/queries";

// Shared by blog/[slug]/opengraph-image.tsx and twitter-image.tsx.
// A file-based image overrides generateMetadata's images for EVERY post
// (Next 16 generate-metadata.md: "File-based metadata has the higher priority"),
// so this route serves the post's own cover when it has one, and draws a
// title card when it does not — 53 of 68 posts had no share image at all.

export const POST_OG_SIZE = { width: 1200, height: 630 };

const SHAREABLE = /^image\/(png|jpe?g|gif|webp)\b/i;

async function coverResponse(coverUrl: string): Promise<Response | null> {
  try {
    const res = await fetch(coverUrl);
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !SHAREABLE.test(type)) {
      console.error(`post og image: cover ${coverUrl} unusable (status ${res.status}, type "${type}"); drawing a title card`);
      return null;
    }
    return new Response(await res.arrayBuffer(), { headers: { "content-type": type } });
  } catch (err) {
    console.error(`post og image: cover ${coverUrl} fetch failed; drawing a title card`, err);
    return null;
  }
}

function titleCard(title: string) {
  const fontSize = title.length > 90 ? 52 : title.length > 55 ? 64 : 76;
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: THEME.surface[0],
          color: THEME.fg[0],
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "9999px", backgroundColor: THEME.accent[400] }} />
          <div style={{ fontSize: "22px", color: THEME.fg[2], letterSpacing: "0.18em", textTransform: "uppercase" }}>
            amargupta.tech · field notes
          </div>
        </div>
        <div style={{ display: "flex", fontSize: `${fontSize}px`, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: "28px", color: THEME.fg[1] }}>
          Amar Gupta — Senior Frontend Developer — AI & MCP
        </div>
      </div>
    ),
    { ...POST_OG_SIZE },
  );
}

export async function postOgImage(slug: string): Promise<Response> {
  const post = await getCombinedBlogPostBySlug(slug);
  if (post?.cover_image) {
    const cover = await coverResponse(post.cover_image);
    if (cover) return cover;
  }
  return titleCard(post?.title ?? "Field notes");
}
