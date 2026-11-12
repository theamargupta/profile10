import type { Scene } from "@/lib/plans/demo-schema";
import { FormScene } from "./form-scene";

/** One scene's body by kind (admin plan 2026-11-12-freelance-demos P1). Text nodes only; a URL stays text. */
export function SceneBody({ scene, turns }: { scene: Scene; turns: number }) {
  switch (scene.kind) {
    case "chat":
      return (
        <ol className="space-y-3">
          {(scene.messages ?? []).slice(0, turns).map((m, i) => (
            <li key={i} className={m.from === "customer" ? "mr-12 rounded-xl bg-[var(--color-surface-2)] p-3" : "ml-12 rounded-xl bg-[var(--color-surface-3)] p-3"}>
              <span className="block font-mono text-xs text-[var(--color-fg-2)]">{m.from}</span>
              <span className="[overflow-wrap:anywhere]">{m.text}</span>
            </li>
          ))}
        </ol>
      );
    case "table":
      return <SampleTable columns={scene.columns ?? []} rows={scene.rows ?? []} />;
    case "dashboard":
      return (
        <div>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(scene.stats ?? []).map((st, i) => (
              <div key={i} className="rounded-xl bg-[var(--color-surface-2)] p-3">
                <span className="block font-mono text-xs text-[var(--color-fg-2)]">{st.label}</span>
                <span className="text-xl font-semibold">{st.value}</span>
              </div>
            ))}
          </div>
          {(scene.columns?.length ?? 0) > 0 && <SampleTable columns={scene.columns ?? []} rows={scene.rows ?? []} />}
        </div>
      );
    case "flow":
      return (
        <ol className="space-y-3">
          {(scene.steps ?? []).map((st, i) => (
            <li key={i} className="rounded-xl border border-[var(--color-surface-3)] p-3">
              <span className="block font-semibold">{i + 1}. {st.label}</span>
              {st.detail && <span className="block text-[var(--color-fg-1)] [overflow-wrap:anywhere]">{st.detail}</span>}
              {st.on_error && <span className="mt-1 block text-sm text-[var(--color-danger-400,#f87171)] [overflow-wrap:anywhere]">If it fails: {st.on_error}</span>}
            </li>
          ))}
        </ol>
      );
    case "form":
      return <FormScene scene={scene} />;
    case "code":
      return (
        <pre className="overflow-x-auto rounded-xl bg-[var(--color-surface-2)] p-4 font-mono text-xs">
          <span className="mb-2 block text-[var(--color-fg-2)]">{scene.language}</span>
          {scene.code}
        </pre>
      );
  }
}

function SampleTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr>{columns.map((c, i) => <th key={i} className="border-b border-[var(--color-surface-3)] p-2">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((cell, j) => <td key={j} className="border-b border-[var(--color-surface-2)] p-2 [overflow-wrap:anywhere]">{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
