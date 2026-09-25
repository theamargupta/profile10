import { test, expect } from "@playwright/test";

// Audit finding #10: /rss.xml exists (lane 1), but no page advertised it, so feed
// readers and aggregators could not discover it from the site.
for (const path of ["/", "/blog"]) {
  test(`${path} advertises the RSS feed, and the feed it points at loads`, async ({ request }) => {
    const html = await (await request.get(path)).text();
    const link = html.match(/<link[^>]+rel="alternate"[^>]+type="application\/rss\+xml"[^>]*>/i)?.[0];
    expect(link, `RSS <link> on ${path}`).toBeTruthy();

    const href = link!.match(/href="([^"]+)"/)?.[1];
    expect(href).toBe("https://amargupta.tech/rss.xml");
    const feed = await request.get(new URL(href!).pathname);
    expect(feed.status()).toBe(200);
    expect(await feed.text()).toContain("<rss");
  });
}
