import { test, expect } from "@playwright/test";

// Audit finding #7: /about, /projects and /blog carried the home page's og:url and
// og:title, so a share of /about claimed to be https://amargupta.tech.
function meta(html: string, key: string): string | null {
  const re = new RegExp(`<meta[^>]+(?:property|name)="${key}"[^>]+content="([^"]*)"`, "i");
  return html.match(re)?.[1] ?? null;
}

for (const path of ["/about", "/projects", "/blog"]) {
  test(`${path} share card names ${path}, not the home page`, async ({ request }) => {
    const html = await (await request.get(path)).text();
    expect(meta(html, "og:url")).toBe(`https://amargupta.tech${path}`);
    const section = path.slice(1, 2).toUpperCase() + path.slice(2);
    expect(meta(html, "og:title")).toBe(`${section} | Amar Gupta`);
    expect(meta(html, "og:site_name")).toBe("Amar Gupta");
    expect(meta(html, "og:image"), "og:image still inherited").toBeTruthy();
  });
}
