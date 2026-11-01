import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlanView } from "./plan-view";
import { PLAN_HONESTY_EN, PLAN_HONESTY_HI, PLAN_PRICE_RANGE } from "@/lib/plans/plan-copy";

const PLAN = {
  title: "Dashboard rebuild for Acme",
  prepared_for: "Acme Ltd",
  summary: "A two-week plan.",
  sections: [
    { heading: "Week 1", paragraphs: ["Audit the dashboard."], bullets: ["List slow charts", "Pick a stack"] },
    { heading: "Week 2", bullets: ["Ship the first screen"] },
  ],
};

describe("copy constants", () => {
  it("carry Amar's exact wording and price range", () => {
    expect(PLAN_HONESTY_HI).toBe("Plan hai, bana hua product nahi");
    expect(PLAN_HONESTY_EN).toBe("This is a plan, not a finished product");
    expect(PLAN_PRICE_RANGE).toBe("$300–600");
  });
});

describe("PlanView", () => {
  it("always shows the honesty strip in both languages and the price range", () => {
    render(<PlanView plan={PLAN} />);
    const strip = screen.getByRole("note");
    expect(strip).toHaveTextContent(PLAN_HONESTY_HI);
    expect(strip).toHaveTextContent(PLAN_HONESTY_EN);
    expect(screen.getByText(PLAN_PRICE_RANGE, { exact: false })).toBeInTheDocument();
  });
  it("renders the title, who it is for, the summary, every heading, paragraph and bullet", () => {
    render(<PlanView plan={PLAN} />);
    expect(screen.getByRole("heading", { level: 1, name: PLAN.title })).toBeInTheDocument();
    expect(screen.getByText(/Acme Ltd/)).toBeInTheDocument();
    expect(screen.getByText(PLAN.summary)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Week 1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Week 2" })).toBeInTheDocument();
    expect(screen.getByText("Audit the dashboard.")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
  it("renders stored text as text, never as markup", () => {
    const evil = { ...PLAN, summary: '<img src=x onerror="alert(1)"><script>1</script>' };
    const { container } = render(<PlanView plan={evil} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText(evil.summary)).toBeInTheDocument();
  });
});
