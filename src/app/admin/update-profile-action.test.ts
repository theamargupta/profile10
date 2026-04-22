import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfileAction } from "@/app/admin/actions";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

type ProfilePayload = {
  name: string;
  title: string;
  headline: string | null;
  subtitle: string | null;
  summary: string | null;
  bio_short: string | null;
  bio_long: string | null;
  how_i_work: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  avatar_url: string | null;
  resume_url: string | null;
  available_for: string | null;
  rate_range: string | null;
};

type MockSupabase = {
  auth: {
    getUser: ReturnType<typeof vi.fn>;
  };
  from: ReturnType<typeof vi.fn>;
};

function createFormData(values: Record<string, string | undefined>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string") formData.set(key, value);
  }
  return formData;
}

function createSupabaseMock(options?: {
  user?: { id: string } | null;
  updateError?: { message: string } | null;
}) {
  const resolvedUser =
    options && "user" in options ? options.user : { id: "user-1" };

  const eqMock = vi.fn().mockResolvedValue({ error: options?.updateError ?? null });
  const updateMock = vi.fn((payload: ProfilePayload) => ({
    eq: vi.fn((column: string, value: string) => {
      eqMock(column, value);
      return Promise.resolve({ error: options?.updateError ?? null, payload });
    }),
  }));

  const fromMock = vi.fn(() => ({
    update: updateMock,
  }));

  const getUserMock = vi
    .fn()
    .mockResolvedValue({ data: { user: resolvedUser } });

  const supabase: MockSupabase = {
    auth: { getUser: getUserMock },
    from: fromMock,
  };

  return { supabase, fromMock, updateMock, eqMock };
}

describe("updateProfileAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login error when no auth user exists", async () => {
    const { supabase } = createSupabaseMock({ user: null });
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    await expect(updateProfileAction(new FormData())).rejects.toThrow("NEXT_REDIRECT");

    expect(redirect).toHaveBeenCalledWith("/admin?error=Please+log+in+first");
  });

  it("redirects when profile id is missing", async () => {
    const { supabase } = createSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const formData = createFormData({ id: "   " });

    await expect(updateProfileAction(formData)).rejects.toThrow("NEXT_REDIRECT");

    expect(redirect).toHaveBeenCalledWith(
      "/admin?tab=profile&error=Profile+record+is+missing"
    );
  });

  it("maps all profile fields into the update payload", async () => {
    const { supabase, fromMock, updateMock } = createSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const formData = createFormData({
      id: "profile-1",
      name: "Amar",
      title: "Builder",
      headline: "Builds AI products",
      subtitle: "MCP · LLM",
      summary: "Summary text",
      bio_short: "Short bio",
      bio_long: "Long bio",
      how_i_work: "Fast and iterative",
      email: "hello@example.com",
      phone: "+1-555-1000",
      location: "Earth",
      website: "https://example.com",
      avatar_url: "https://example.com/avatar.png",
      resume_url: "https://example.com/resume.pdf",
      available_for: "Freelance",
      rate_range: "$100-150/hr",
    });

    await expect(updateProfileAction(formData)).rejects.toThrow("NEXT_REDIRECT");

    expect(fromMock).toHaveBeenCalledWith("profiles");
    expect(updateMock).toHaveBeenCalledWith({
      name: "Amar",
      title: "Builder",
      headline: "Builds AI products",
      subtitle: "MCP · LLM",
      summary: "Summary text",
      bio_short: "Short bio",
      bio_long: "Long bio",
      how_i_work: "Fast and iterative",
      email: "hello@example.com",
      phone: "+1-555-1000",
      location: "Earth",
      website: "https://example.com",
      avatar_url: "https://example.com/avatar.png",
      resume_url: "https://example.com/resume.pdf",
      available_for: "Freelance",
      rate_range: "$100-150/hr",
    } satisfies ProfilePayload);
  });

  it("falls back to default name and title when omitted", async () => {
    const { supabase, updateMock } = createSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const formData = createFormData({
      id: "profile-1",
      headline: "Testing defaults",
    });

    await expect(updateProfileAction(formData)).rejects.toThrow("NEXT_REDIRECT");

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Your Name",
        title: "Your Title",
      })
    );
  });

  it("redirects with supabase error message when update fails", async () => {
    const { supabase } = createSupabaseMock({
      updateError: { message: "Permission denied" },
    });
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const formData = createFormData({ id: "profile-1" });

    await expect(updateProfileAction(formData)).rejects.toThrow("NEXT_REDIRECT");

    expect(redirect).toHaveBeenCalledWith(
      "/admin?tab=profile&error=Permission+denied"
    );
  });

  it("revalidates pages and redirects with success on valid update", async () => {
    const { supabase } = createSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const formData = createFormData({ id: "profile-1" });

    await expect(updateProfileAction(formData)).rejects.toThrow("NEXT_REDIRECT");

    expect(revalidatePath).toHaveBeenNthCalledWith(1, "/");
    expect(revalidatePath).toHaveBeenNthCalledWith(2, "/about");
    expect(revalidatePath).toHaveBeenNthCalledWith(3, "/admin");
    expect(redirect).toHaveBeenLastCalledWith(
      "/admin?tab=profile&success=Profile+updated"
    );
  });
});
