import { test, expect } from "@playwright/test";

// Audit finding #10: /rss.xml exists (lane 1), but no page advertised it, so feed
// readers and aggregators could not discover it from the site.
// A real post and project are included on purpose: their generateMetadata sets its own
// `alternates`, which replaces the layout's whole object (shallow merge) — the first
// version of this spec covered section pages only and missed exactly that.
const DETAIL_PAGES = [
  { label: "a post page", index: "/blog", link: /href="(\/blog\/[a-z0-9-]+)"/ },
  { label: "a project page", index: "/projects", link: /href="(\/project\/[a-z0-9-]+)"/ },
];

for (const target of ["/", "/about", "/projects", "/blog", ...DETAIL_PAGES]) {
  const name = typeof target === "string" ? target : target.label;
  test(`${name} advertises the RSS feed, and the feed it points at loads`, async ({ request }) => {
    let path = typeof target === "string" ? target : null;
    if (typeof target !== "string") {
      path = (await (await request.get(target.index)).text()).match(target.link)?.[1] ?? null;
      expect(path, `a link to ${target.label} on ${target.index}`).toBeTruthy();
    }
    const html = await (await request.get(path!)).text();
    const link = html.match(/<link[^>]+rel="alternate"[^>]+type="application\/rss\+xml"[^>]*>/i)?.[0];
    expect(link, `RSS <link> on ${path}`).toBeTruthy();

    const href = link!.match(/href="([^"]+)"/)?.[1];
    expect(href).toBe("https://amargupta.tech/rss.xml");
    const feed = await request.get(new URL(href!).pathname);
    expect(feed.status()).toBe(200);
    expect(await feed.text()).toContain("<rss");
  });
}
