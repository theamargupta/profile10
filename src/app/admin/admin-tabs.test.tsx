import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import { AdminTabs } from "./admin-tabs";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

const items = [
  { id: "profile", label: "Profile", content: <div>Profile content</div> },
  { id: "projects", label: "Projects", content: <div>Projects content</div> },
  { id: "services", label: "Services", content: <div>Services content</div> },
];

function mockSearchParams(query: string) {
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(query) as ReturnType<typeof useSearchParams>
  );
}

describe("AdminTabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the tab matching ?tab=projects as active", () => {
    mockSearchParams("tab=projects");
    render(<AdminTabs items={items} defaultTabId="profile" />);

    const projectsButton = screen.getByRole("button", { name: /projects/i });
    expect(projectsButton).toHaveClass("bg-primary/20");
    expect(screen.getByText("Projects content")).toBeInTheDocument();
  });

  it("falls back to defaultTabId when ?tab= is absent", () => {
    mockSearchParams("");
    render(<AdminTabs items={items} defaultTabId="profile" />);

    const profileButton = screen.getByRole("button", { name: /^profile$/i });
    expect(profileButton).toHaveClass("bg-primary/20");
    expect(screen.getByText("Profile content")).toBeInTheDocument();
  });

  it("falls back to defaultTabId when ?tab= is unknown", () => {
    mockSearchParams("tab=does-not-exist");
    render(<AdminTabs items={items} defaultTabId="profile" />);

    const profileButton = screen.getByRole("button", { name: /^profile$/i });
    expect(profileButton).toHaveClass("bg-primary/20");
    expect(screen.getByText("Profile content")).toBeInTheDocument();
  });

  it("clicking a tab updates active state and replaces URL with new ?tab=", () => {
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");
    mockSearchParams("tab=profile");
    render(<AdminTabs items={items} defaultTabId="profile" />);

    fireEvent.click(screen.getByRole("button", { name: /projects/i }));

    expect(screen.getByText("Projects content")).toBeInTheDocument();
    expect(replaceStateSpy).toHaveBeenCalledWith(
      null,
      "",
      expect.stringContaining("tab=projects")
    );
  });
});
