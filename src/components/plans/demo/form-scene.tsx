"use client";

import { useState } from "react";
import type { Scene } from "@/lib/plans/demo-schema";

/** A sample form: submit shows the scene's result text and sends nothing (preventDefault, no request). */
export function FormScene({ scene }: { scene: Scene }) {
  const [done, setDone] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className="space-y-3"
    >
      {(scene.fields ?? []).map((f, i) => (
        <label key={i} className="block">
          <span className="mb-1 block text-sm text-[var(--color-fg-1)]">{f.label}</span>
          {f.type === "textarea" ? (
            <textarea defaultValue={f.sample} className="w-full rounded-lg bg-[var(--color-surface-2)] p-2" />
          ) : (
            <input defaultValue={f.sample} type={f.type === "select" ? "text" : f.type} className="w-full rounded-lg bg-[var(--color-surface-2)] p-2" />
          )}
        </label>
      ))}
      <button type="submit" className="rounded-lg border border-[var(--color-accent-400)] px-4 py-2 text-sm">{scene.submit_label}</button>
      {done && <p role="status" className="rounded-lg bg-[var(--color-surface-2)] p-3 [overflow-wrap:anywhere]">{scene.result}</p>}
    </form>
  );
}
