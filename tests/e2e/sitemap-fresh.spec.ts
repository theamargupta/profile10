import { test, expect } from "@playwright/test";

// Every post linked from /blog must already be in /sitemap.xml. Run it against
// production with PLAYWRIGHT_BASE_URL=https://amargupta.tech — on 2026-09-25 it
// failed there: the newest post was on /blog and missing from the sitemap.
test("every post linked from /blog is listed in /sitemap.xml", async ({ request, baseURL }) => {
  const blog = await request.get("/blog");
  expect(blog.status()).toBe(200);
  const slugs = [
    ...new Set([...(await blog.text()).matchAll(/href="\/blog\/([^"#?]+)"/g)].map((m) => m[1])),
  ];
  expect(slugs.length, `no post links found on ${baseURL}/blog`).toBeGreaterThan(0);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();

  const missing = slugs.filter((slug) => !xml.includes(`/blog/${slug}</loc>`));
  expect(missing, "posts on /blog but not in /sitemap.xml").toEqual([]);
});
