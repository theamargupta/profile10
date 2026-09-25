import { test, expect } from "@playwright/test";

// Audit findings #1 and #3 (docs/seo-audit-2026-09-25.md): a missing slug must be a
// real HTTP 404, not a streamed 200 + noindex; and Googlebot, which Next 16 serves
// streamed metadata, must find <title> and the description inside <head>.
const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

for (const path of ["/blog/this-slug-does-not-exist-e2e", "/project/this-slug-does-not-exist-e2e"]) {
  test(`missing ${path.split("/")[1]} slug answers HTTP 404`, async ({ request }) => {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), `${path} status`).toBe(404);
  });
}

test("Googlebot gets <title> and meta description inside <head> on a post", async ({ request }) => {
  const index = await (await request.get("/blog")).text();
  const slug = index.match(/href="(\/blog\/[a-z0-9-]+)"/)?.[1];
  expect(slug, "a post link on /blog").toBeTruthy();

  const html = await (await request.get(slug!, { headers: { "user-agent": GOOGLEBOT } })).text();
  const headEnd = html.indexOf("</head>");
  const title = html.indexOf("<title");
  const description = html.indexOf('name="description"');
  expect(headEnd, "</head> present").toBeGreaterThan(0);
  expect(title, "<title> present").toBeGreaterThan(-1);
  expect(title, "<title> before </head>").toBeLessThan(headEnd);
  expect(description, "description before </head>").toBeLessThan(headEnd);
  expect(description, "description present").toBeGreaterThan(-1);
});
