import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Hero } from "@/components/dom/hero";

vi.mock("next/dynamic", () => ({
  default: () => {
    return function MockDynamicComponent() {
      return <div data-testid="hero-scene-mock" />;
    };
  },
}));

describe("Hero", () => {
  it("renders the main hero contract content", () => {
    render(
      <Hero
        headline="I build AI-powered web applications."
        subtitle="MCP Servers · LLM Integration · Workflow Automation"
      />
    );

    expect(
      screen.getByRole("heading", {
        name: /I build\s*AI-powered\s*web applications\./i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /start a project/i })
    ).toHaveAttribute("href", "/#contact");

    expect(screen.getByText("MCP Servers")).toBeInTheDocument();
    expect(screen.getByText("LLM Integration")).toBeInTheDocument();
    expect(screen.getByText("Workflow Automation")).toBeInTheDocument();
  });
});
