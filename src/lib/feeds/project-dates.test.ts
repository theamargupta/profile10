import { beforeEach, describe, expect, it, vi } from "vitest";

const { select } = vi.hoisted(() => ({ select: vi.fn() }));
vi.mock("@/lib/supabase/static", () => ({
  createStaticClient: () => ({ from: () => ({ select }) }),
}));

import { getProjectsWithDates } from "./project-dates";

beforeEach(() => {
  select.mockReset();
});

describe("getProjectsWithDates", () => {
  it("returns each project id with its updated_at, falling back to created_at", async () => {
    select.mockResolvedValue({
      data: [
        { id: "sathi", updated_at: "2026-06-02T21:14:10Z", created_at: "2026-04-16T00:00:00Z" },
        { id: "fresh", updated_at: null, created_at: "2026-09-10T00:00:00Z" },
        { id: "undated", updated_at: null, created_at: null },
      ],
      error: null,
    });
    expect(await getProjectsWithDates()).toEqual([
      { id: "sathi", updatedAt: "2026-06-02T21:14:10Z" },
      { id: "fresh", updatedAt: "2026-09-10T00:00:00Z" },
      { id: "undated", updatedAt: null },
    ]);
    expect(select).toHaveBeenCalledWith("id, updated_at, created_at");
  });

  it("throws with context when the read fails", async () => {
    select.mockResolvedValue({ data: null, error: { message: "timeout" } });
    await expect(getProjectsWithDates()).rejects.toThrow("projects read failed: timeout");
  });
});
