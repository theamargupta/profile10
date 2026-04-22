import { describe, expect, it } from "vitest";
import { truncate } from "./utils";

describe("truncate", () => {
  it("returns the original string when length ≤ max", () => {
    expect(truncate("hi", 4)).toBe("hi");
    expect(truncate("abcd", 4)).toBe("abcd");
  });

  it("truncates and adds ellipsis when length > max (ellipsis counts toward max)", () => {
    expect(truncate("abcdef", 4)).toBe("abc\u2026");
  });

  it('returns "" when max is 0', () => {
    expect(truncate("hello", 0)).toBe("");
  });

  it('returns "" when max is negative', () => {
    expect(truncate("hello", -1)).toBe("");
  });
});
