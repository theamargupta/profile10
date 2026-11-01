import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPlan, notFound } = vi.hoisted(() => ({
  getPlan: vi.fn(),
  // Next's real notFound() throws; the page must not swallow that.
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ notFound }));
vi.mock("@/lib/plans/plan-store", () => ({ getPlan }));

import * as pageModule from "./page";

const TOKEN = "Ab3_-Zx9Qw7Lm2Kp";
const PLAN = { title: "T", prepared_for: "P", summary: "S", sections: [{ heading: "H", bullets: ["b"] }] };
const params = (token: string) => ({ params: Promise.resolve({ token }) });

beforeEach(() => {
  getPlan.mockReset();
  notFound.mockClear();
});

describe("plan page", () => {
  it("renders per request: an unpublish or expiry must show on the next visit", () => {
    expect(pageModule.dynamic).toBe("force-dynamic");
    expect(pageModule).not.toHaveProperty("revalidate");
  });

  it("metadata says noindex, nofollow, overriding the root layout's index/follow", async () => {
    const meta = await pageModule.generateMetadata(params(TOKEN));
    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });

  it("metadata is noindex even for an unknown token and reads no database", async () => {
    const meta = await pageModule.generateMetadata(params("nope"));
    expect(meta.robots).toMatchObject({ index: false, follow: false });
    expect(getPlan).not.toHaveBeenCalled();
  });

  it("an unknown or expired token is notFound()", async () => {
    getPlan.mockResolvedValue(null);
    await expect(pageModule.default(params(TOKEN))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("a database error is thrown, not turned into notFound()", async () => {
    getPlan.mockRejectedValue(new Error("db down"));
    await expect(pageModule.default(params(TOKEN))).rejects.toThrow("db down");
    expect(notFound).not.toHaveBeenCalled();
  });

  it("a stored plan renders", async () => {
    getPlan.mockResolvedValue(PLAN);
    const el = await pageModule.default(params(TOKEN));
    expect(el).toBeTruthy();
    expect(getPlan).toHaveBeenCalledWith(TOKEN);
  });
});
