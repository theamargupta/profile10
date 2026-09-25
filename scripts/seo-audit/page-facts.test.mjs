import { describe, expect, it } from "vitest";
import { articleGaps, headingSkips, pageFacts } from "./page-facts.mjs";

const POST = `<html><head><title>Hello &amp; bye</title>
<meta name="description" content="An excerpt"/>
<link rel="canonical" href="https://amargupta.tech/blog/hello"/>
<meta property="og:title" content="Hello"/><meta property="og:type" content="article"/>
<meta name="twitter:card" content="summary_large_image"/>
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebSite"},{"@type":"Person"}]}</script>
<script type="application/ld+json">{"@type":"Article","headline":"Hello","datePublished":"2026-09-25"}</script>
</head><body><h1>Hello</h1><h2>a</h2><h4>b</h4><h2>c</h2>
<img src="/a.png" alt="A"/><img src="/b.png"/><img src="/c.png" alt=""/></body></html>`;

describe("pageFacts", () => {
  const facts = pageFacts(POST);

  it("reads head tags and decodes entities", () => {
    expect(facts.title).toBe("Hello & bye");
    expect(facts.description).toBe("An excerpt");
    expect(facts.canonical).toBe("https://amargupta.tech/blog/hello");
    expect(facts.og.type).toBe("article");
    expect(facts.twitter.card).toBe("summary_large_image");
  });

  it("reports a missing og:image as null, not as absent-and-ignored", () => {
    expect(facts.og.image).toBeNull();
  });

  it("flattens @graph and finds the Article with its gaps", () => {
    expect(facts.jsonLdTypes).toEqual(["WebSite", "Person", "Article"]);
    expect(facts.articles).toEqual([
      { type: "Article", image: null, gaps: ["image", "dateModified", "author"] },
    ]);
  });

  it("counts h1, heading skips and images without alt (empty alt is decorative, allowed)", () => {
    expect(facts.h1Count).toBe(1);
    expect(facts.headingSkips).toEqual(["h2->h4"]);
    expect(facts.imagesMissingAlt).toEqual(["/b.png"]);
  });

  it("survives a page with nothing on it", () => {
    const empty = pageFacts("");
    expect(empty.title).toBeNull();
    expect(empty.h1Count).toBe(0);
    expect(empty.articles).toEqual([]);
  });

  it("keeps a broken JSON-LD block visible instead of dropping it", () => {
    const bad = pageFacts('<script type="application/ld+json">{nope</script>');
    expect(bad.jsonLdTypes[0]).toMatch(/SyntaxError/);
  });
});

describe("headingSkips / articleGaps", () => {
  it("allows going back up and stepping down by one", () => {
    expect(headingSkips([1, 2, 3, 2, 3, 1, 2])).toEqual([]);
  });
  it("treats an empty string as missing", () => {
    expect(articleGaps({ headline: "", image: "x", datePublished: "d", dateModified: "d", author: {} }))
      .toEqual(["headline"]);
  });
});
