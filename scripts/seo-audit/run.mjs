#!/usr/bin/env node
// Measures a live site and prints one JSON report. Read-only: GETs only.
//   node scripts/seo-audit/run.mjs [baseUrl] [--pages /a,/b]
// Default base is production. Page facts come from ./page-facts.mjs.
import { pageFacts } from "./page-facts.mjs";

const args = process.argv.slice(2);
const base = (args.find((a) => a.startsWith("http")) ?? "https://amargupta.tech").replace(/\/$/, "");
const pagesArg = args[args.indexOf("--pages") + 1];

async function get(url, redirect = "follow") {
  const started = performance.now();
  try {
    const res = await fetch(url, { redirect, headers: { "user-agent": "seo-audit/1 (+amargupta.tech)" } });
    const body = redirect === "follow" ? await res.text() : "";
    return {
      url,
      status: res.status,
      location: res.headers.get("location"),
      finalUrl: res.url,
      ms: Math.round(performance.now() - started),
      body,
    };
  } catch (err) {
    return { url, status: 0, error: `${err.name}: ${err.message}`, body: "" };
  }
}

// Newest post, one hand-written post, and the first project: discovered from
// the live index pages so the audit never checks a slug that has gone away.
async function discoverPages() {
  const blog = await get(`${base}/blog`);
  const projects = await get(`${base}/projects`);
  const posts = [...new Set(blog.body.match(/\/blog\/[a-z0-9-]+/g) ?? [])];
  const project = (projects.body.match(/\/project\/[a-z0-9-]+/) ?? [])[0];
  const handWritten = posts.find((p) => p.startsWith("/blog/building-")) ?? posts[1];
  return ["/", "/about", "/projects", "/blog", project, posts[0], handWritten].filter(Boolean);
}

async function redirects() {
  const host = new URL(base).host;
  const cases = [
    [`http://${host}/`, "http -> https"],
    [`https://www.${host}/`, "www -> apex"],
    [`${base}/blog/`, "trailing slash"],
    [`${base}/about/`, "trailing slash"],
  ];
  return Promise.all(
    cases.map(async ([url, what]) => {
      const r = await get(url, "manual");
      return { what, url, status: r.status, location: r.location, error: r.error };
    }),
  );
}

async function missing() {
  const paths = ["/blog/this-slug-does-not-exist-seo-audit", "/project/this-slug-does-not-exist-seo-audit", "/nope-seo-audit"];
  return Promise.all(
    paths.map(async (p) => {
      const r = await get(`${base}${p}`);
      const robots = pageFacts(r.body).robots;
      return { path: p, status: r.status, robots };
    }),
  );
}

async function main() {
  const pages = pagesArg ? pagesArg.split(",") : await discoverPages();
  const blogIndex = await get(`${base}/blog`);
  const home = await get(`${base}/`);
  const report = { base, measuredAt: new Date().toISOString(), pages: [], redirects: [], missing: [] };

  for (const path of pages) {
    const r = await get(`${base}${path}`);
    const entry = { path, status: r.status, ms: r.ms, error: r.error, ...pageFacts(r.body) };
    if (path.startsWith("/blog/")) {
      entry.linkedFrom = { blogIndex: blogIndex.body.includes(`"${path}"`), home: home.body.includes(`"${path}"`) };
    }
    report.pages.push(entry);
  }
  report.redirects = await redirects();
  report.missing = await missing();
  for (const extra of ["/robots.txt", "/sitemap.xml"]) {
    const r = await get(`${base}${extra}`);
    report[extra] = { status: r.status, bytes: r.body.length, ms: r.ms };
  }
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
}

main().catch((err) => {
  console.error(`seo-audit failed against ${base}: ${err.stack ?? err}`);
  process.exit(1);
});
