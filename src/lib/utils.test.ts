import { describe, expect, it } from "vitest";
import { capitalizeWords, truncate } from "./utils";

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

describe("capitalizeWords", () => {
  it("capitalizes a basic two-word string", () => {
    expect(capitalizeWords("hello world")).toBe("Hello World");
  });

  it("capitalizes a single word", () => {
    expect(capitalizeWords("hello")).toBe("Hello");
  });

  it('returns "" for empty string', () => {
    expect(capitalizeWords("")).toBe("");
  });

  it("trims leading and trailing whitespace and collapses runs to single spaces", () => {
    expect(capitalizeWords("  hi there  ")).toBe("Hi There");
  });

  it("collapses multiple spaces between words", () => {
    expect(capitalizeWords("one    two")).toBe("One Two");
  });

  it("handles single-character words", () => {
    expect(capitalizeWords("a b c")).toBe("A B C");
  });

  it("lowercases the rest of each word after the first letter", () => {
    expect(capitalizeWords("iPhone is great")).toBe("Iphone Is Great");
    expect(capitalizeWords("HELLO WORLD")).toBe("Hello World");
  });
});
