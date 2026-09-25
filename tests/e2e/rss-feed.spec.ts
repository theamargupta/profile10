import { test, expect } from "@playwright/test";

// The newest post on /blog must already be in /rss.xml. Run against production
// with PLAYWRIGHT_BASE_URL=https://amargupta.tech after a deploy.
test("/rss.xml is RSS and lists the newest post on /blog", async ({ request }) => {
  const blog = await request.get("/blog");
  expect(blog.status()).toBe(200);
  const newest = (await blog.text()).match(/href="\/blog\/([^"#?]+)"/)?.[1];
  expect(newest, "no post link found on /blog").toBeTruthy();

  const rss = await request.get("/rss.xml");
  expect(rss.status()).toBe(200);
  expect(rss.headers()["content-type"]).toContain("application/rss+xml");
  const xml = await rss.text();
  expect(xml).toContain('<rss version="2.0"');
  expect(xml).toContain(`/blog/${newest}</link>`);
});
