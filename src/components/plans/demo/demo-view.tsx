"use client";

import { useState } from "react";
import type { Demo } from "@/lib/plans/demo-schema";
import { DEMO_HONESTY_EN, DEMO_HONESTY_HI } from "@/lib/plans/plan-copy";
import { SceneBody } from "./scene-body";

/**
 * The demo under a plan (admin plan 2026-11-12-freelance-demos P1): one scene at a time, "Next" / "Back", the strip
 * above every scene. A chat scene plays turn by turn on "Next" before the next scene. UI only: no request leaves the
 * page, every string is a text node (no link, no HTML).
 */
export function DemoView({ demo }: { demo: Demo }) {
  const [index, setIndex] = useState(0);
  const [turns, setTurns] = useState(1);
  const scene = demo.scenes[index];
  const chatLeft = scene.kind === "chat" && turns < (scene.messages?.length ?? 0);
  const last = index === demo.scenes.length - 1;

  const next = () => {
    if (chatLeft) return setTurns(turns + 1);
    if (!last) { setIndex(index + 1); setTurns(1); }
  };
  const back = () => { if (index > 0) { setIndex(index - 1); setTurns(1); } };

  return (
    <section aria-label="Demo" className="mt-16 rounded-2xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)] p-6">
      <p role="note" className="mb-6 rounded-xl border border-[var(--color-accent-400)]/40 bg-[var(--color-surface-2)] px-4 py-3 font-mono text-xs uppercase tracking-[var(--tracking-wider)] text-[var(--color-accent-400)]">
        <span className="block">{DEMO_HONESTY_HI}</span>
        <span className="block text-[var(--color-fg-1)]">{DEMO_HONESTY_EN}</span>
      </p>
      <p className="mb-1 font-mono text-xs text-[var(--color-fg-2)]">
        Demo · {demo.title} · screen {index + 1} of {demo.scenes.length}
      </p>
      <h2 className="mb-2 font-display text-2xl font-semibold text-[var(--color-fg-0)] [overflow-wrap:anywhere]">{scene.heading}</h2>
      <p className="mb-6 text-[var(--color-fg-1)] [overflow-wrap:anywhere]">{scene.caption}</p>
      <SceneBody scene={scene} turns={turns} />
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={back} disabled={index === 0} className="rounded-lg border border-[var(--color-surface-3)] px-4 py-2 text-sm disabled:opacity-40">
          Back
        </button>
        <button type="button" onClick={next} disabled={last && !chatLeft} className="rounded-lg bg-[var(--color-accent-400)] px-4 py-2 text-sm text-[var(--color-bg-0)] disabled:opacity-40">
          Next
        </button>
      </div>
      <details className="mt-6 text-sm text-[var(--color-fg-2)]">
        <summary>What this demo assumes</summary>
        <ul className="mt-2 list-disc pl-5">
          {demo.assumptions.map((a, i) => <li key={i} className="[overflow-wrap:anywhere]">{a}</li>)}
        </ul>
      </details>
    </section>
  );
}
