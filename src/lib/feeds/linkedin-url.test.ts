// The site linked a third LinkedIn profile (/in/amar-gupta-2684a1157/, 4 links on the live page,
// kamai audit 2026-10-09) while posts and the resume use /in/theamargupta/. One constant now.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LINKEDIN_URL } from "./site";
import { LLMS_PROFILE_SECTIONS } from "./llms-profile";

const OLD = "amar-gupta-2684a1157";

describe("LinkedIn URL", () => {
  it("is the main profile", () => {
    expect(LINKEDIN_URL).toBe("https://www.linkedin.com/in/theamargupta/");
  });

  it("is the one llms.txt links", () => {
    expect(LLMS_PROFILE_SECTIONS).toContain(`[LinkedIn](${LINKEDIN_URL})`);
    expect(LLMS_PROFILE_SECTIONS).not.toContain(OLD);
  });

  it("is the one the JSON-LD sameAs carries, through the constant", () => {
    const layout = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf8");
    expect(layout).not.toContain(OLD);
    expect(layout).toMatch(/sameAs: \[[^\]]*LINKEDIN_URL/);
  });
});
