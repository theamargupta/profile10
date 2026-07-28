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

const PROPS = {
  headline: "I build production web applications.",
  subtitle: "React · Next.js · Vue 3 · Node.js · TypeScript · Supabase",
  description:
    "I build production web applications end to end, from data modelling to the deployed interface.",
};

describe("Hero", () => {
  it("renders the main hero contract content", () => {
    render(<Hero {...PROPS} />);

    expect(
      screen.getByRole("heading", {
        name: /I build\s*production\s*web applications\./i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(PROPS.description)).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /view my work/i })
    ).toHaveAttribute("href", "/projects");

    expect(
      screen.getByRole("link", { name: /get in touch/i })
    ).toHaveAttribute("href", "/#contact");
  });

  it("renders each subtitle segment as a stack chip", () => {
    render(<Hero {...PROPS} />);

    for (const tag of ["React", "Next.js", "Vue 3", "Node.js", "TypeScript", "Supabase"]) {
      expect(screen.getByText(tag)).toBeInTheDocument();
    }
  });

  // The site markets Amar as an employed full-stack developer, not a freelancer.
  // These strings are the ones that read as "hire me for a project" and must stay gone.
  it("does not advertise freelance availability", () => {
    render(<Hero {...PROPS} />);

    expect(
      screen.queryByText(/available for new projects/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /start a project/i })
    ).not.toBeInTheDocument();
  });

  it("falls back to an empty description without crashing", () => {
    render(<Hero headline={PROPS.headline} subtitle={PROPS.subtitle} description="" />);

    expect(
      screen.getByRole("heading", { name: /I build\s*production\s*web applications\./i })
    ).toBeInTheDocument();
  });
});
