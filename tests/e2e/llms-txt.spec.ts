import { test, expect } from "@playwright/test";

// /llms.txt is generated: the site's headline and the newest post on /blog.
// Run against production with PLAYWRIGHT_BASE_URL=https://amargupta.tech.
test("/llms.txt carries the frontend headline and the newest post", async ({ request }) => {
  const blog = await request.get("/blog");
  const newest = (await blog.text()).match(/href="\/blog\/([^"#?]+)"/)?.[1];
  expect(newest, "no post link found on /blog").toBeTruthy();

  const res = await request.get("/llms.txt");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("text/plain");
  const txt = await res.text();
  expect(txt).toContain("> Senior Frontend Developer — AI & MCP.");
  expect(txt).not.toMatch(/full stack developer/i);
  expect(txt).toContain(`/blog/${newest})`);
});
