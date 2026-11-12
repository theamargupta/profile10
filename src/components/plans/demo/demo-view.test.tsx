import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DemoView } from "./demo-view";
import { DEMO_HONESTY_EN, DEMO_HONESTY_HI } from "@/lib/plans/plan-copy";
import type { Demo } from "@/lib/plans/demo-schema";

// Admin plan 2026-11-12-freelance-demos P1: one scene at a time, the strip on every scene, nothing leaves the page.
const DEMO: Demo = {
  title: "Order intake demo",
  prepared_for: "your post",
  summary: "Sample data only.",
  assumptions: ["You use Sheets."],
  scenes: [
    { kind: "chat", heading: "The bot", caption: "A customer orders.", messages: [{ from: "customer", text: "Two pizzas" }, { from: "assistant", text: "Order #1042 saved" }] },
    { kind: "form", heading: "The form", caption: "Staff add an order.", fields: [{ label: "Item", type: "text", sample: "<script>alert(1)</script>" }], submit_label: "Save", result: "Saved as Order #1043" },
  ],
};

afterEach(() => vi.restoreAllMocks());

describe("DemoView", () => {
  it("shows the strip, plays a chat turn by turn, and moves scenes with next / back", () => {
    render(<DemoView demo={DEMO} />);
    expect(screen.getByText(DEMO_HONESTY_HI)).toBeTruthy();
    expect(screen.getByText(DEMO_HONESTY_EN)).toBeTruthy();
    expect(screen.getByText("Two pizzas")).toBeTruthy();
    expect(screen.queryByText("Order #1042 saved")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Order #1042 saved")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: "The form" })).toBeTruthy();
    expect(screen.getByText(DEMO_HONESTY_EN)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("heading", { name: "The bot" })).toBeTruthy();
  });

  it("a form shows its result on submit and sends no request; a payload string renders as text", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<DemoView demo={{ ...DEMO, scenes: [DEMO.scenes[1], DEMO.scenes[0]] }} />);
    expect(screen.getByDisplayValue("<script>alert(1)</script>")).toBeTruthy();
    expect(screen.queryByText("Saved as Order #1043")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText("Saved as Order #1043")).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
