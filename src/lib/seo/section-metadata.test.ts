import { describe, expect, it } from "vitest";
import { SITE_OPEN_GRAPH, SITE_TWITTER, sectionMetadata } from "./section-metadata";

describe("sectionMetadata", () => {
  const m = sectionMetadata({ path: "/about", title: "About", description: "Who I am." });

  it("points canonical and og:url at the section, not the home page", () => {
    expect(m.alternates?.canonical).toBe("/about");
    expect(m.openGraph?.url).toBe("https://amargupta.tech/about");
  });

  it("titles the share card with the section and the site name", () => {
    expect(m.title).toBe("About");
    expect(m.openGraph?.title).toBe("About | Amar Gupta");
    expect(m.twitter?.title).toBe("About | Amar Gupta");
    expect(m.openGraph?.description).toBe("Who I am.");
    expect(m.twitter?.description).toBe("Who I am.");
  });

  it("keeps the site-wide Open Graph fields a nested override would otherwise drop", () => {
    expect(m.openGraph).toMatchObject(SITE_OPEN_GRAPH);
    expect(m.twitter).toMatchObject(SITE_TWITTER);
    expect(SITE_TWITTER.images).toEqual(["/opengraph-image"]);
    // A page-level openGraph also drops the root's file-based og:image.
    expect(m.openGraph?.images).toEqual([expect.objectContaining({ url: "/opengraph-image", width: 1200, height: 630 })]);
  });
});
