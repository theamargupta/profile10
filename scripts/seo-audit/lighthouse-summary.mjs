#!/usr/bin/env node
// Lighthouse JSON reports -> one compact row each (scores, vitals, failed SEO audits).
//   node scripts/seo-audit/lighthouse-summary.mjs <dir-of-lighthouse-json>
// Run by ./lighthouse.sh; also importable for tests.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const pct = (cat) => (cat && typeof cat.score === "number" ? Math.round(cat.score * 100) : null);
const num = (audit, digits = 0) =>
  audit && typeof audit.numericValue === "number" ? Number(audit.numericValue.toFixed(digits)) : null;

// SEO audit ids from Lighthouse 13's seo category. Manual/not-applicable
// audits have score null and are not failures.
const SEO_AUDITS = [
  "document-title", "meta-description", "http-status-code", "link-text", "crawlable-anchors",
  "is-crawlable", "robots-txt", "image-alt", "hreflang", "canonical", "structured-data",
];

export function summarize(lhr) {
  const a = lhr.audits ?? {};
  const row = {
    url: lhr.finalDisplayedUrl ?? lhr.finalUrl ?? null,
    form: lhr.configSettings?.formFactor ?? null,
    seo: pct(lhr.categories?.seo),
    performance: pct(lhr.categories?.performance),
    lcpMs: num(a["largest-contentful-paint"]),
    cls: num(a["cumulative-layout-shift"], 3),
    tbtMs: num(a["total-blocking-time"]),
    failedSeo: SEO_AUDITS.filter((id) => a[id] && a[id].score === 0).map((id) => `${id}: ${a[id].title}`),
  };
  if (lhr.runtimeError) row.error = `${lhr.runtimeError.code}: ${lhr.runtimeError.message}`;
  return row;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2];
  if (!dir) {
    console.error("usage: lighthouse-summary.mjs <dir-of-lighthouse-json>");
    process.exit(2);
  }
  const rows = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => {
      try {
        return summarize(JSON.parse(readFileSync(join(dir, f), "utf8")));
      } catch (err) {
        return { file: f, error: `unreadable report: ${err.message}` };
      }
    });
  process.stdout.write(JSON.stringify(rows, null, 2) + "\n");
}
