import { test, expect, type APIRequestContext } from "@playwright/test";

// Audit finding #2 (docs/seo-audit-2026-09-25.md): 53 of 68 posts had no og:image and
// no twitter:image, because a post without a cover blanked the root image. Every post,
// with or without a cover, must now carry both, and both must resolve to a real image.

function meta(html: string, key: string): string | null {
  const re = new RegExp(`<meta[^>]+(?:property|name)="${key}"[^>]+content="([^"]*)"`, "i");
  return html.match(re)?.[1]?.replace(/&amp;/g, "&") ?? null;
}

// One post with a cover and one without, read off the live /blog cards.
async function postsByCover(request: APIRequestContext) {
  const index = await (await request.get("/blog")).text();
  // Match the card by its href, not its exact class list: the class list changed once
  // (min-w-0) and silently turned this test into a skip.
  const cards = [...index.matchAll(/<a class="[^"]*" href="(\/blog\/[a-z0-9-]+)">([\s\S]*?)<\/a>/g)];
  return {
    withCover: cards.find(([, , body]) => body.includes("<img"))?.[1],
    withoutCover: cards.find(([, , body]) => !body.includes("<img"))?.[1],
  };
}

for (const kind of ["withCover", "withoutCover"] as const) {
  test(`a post ${kind === "withCover" ? "with" : "without"} a cover has og:image and twitter:image that load`, async ({ request }) => {
    const slug = (await postsByCover(request))[kind];
    test.skip(!slug, `no post ${kind} on /blog right now`);

    const html = await (await request.get(slug!)).text();
    for (const key of ["og:image", "twitter:image"]) {
      const url = meta(html, key);
      expect(url, `${key} on ${slug}`).toBeTruthy();
      // Our own images are fetched from the server under test (metadataBase makes them
      // absolute production URLs); a cover on another host is fetched as-is.
      const parsed = new URL(url!);
      const own = parsed.hostname === "amargupta.tech";
      const img = await request.get(own ? parsed.pathname + parsed.search : url!);
      expect(img.status(), `${key} ${url}`).toBe(200);
      expect(img.headers()["content-type"], `${key} content-type`).toMatch(/^image\//);
    }
    expect(meta(html, "og:image:alt"), `og:image:alt on ${slug}`).toBeTruthy();
  });
}
