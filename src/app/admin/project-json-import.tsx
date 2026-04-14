"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  validateProjectJson,
  PROJECT_JSON_TEMPLATE,
  type ValidationError,
} from "@/app/admin/project-json-schema";
import { createProjectFromJsonAction } from "@/app/admin/actions";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-foreground outline-none ring-primary/40 transition placeholder:text-foreground/35 focus:ring-2";

export function ProjectJsonImport() {
  const [json, setJson] = useState("");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [showSchema, setShowSchema] = useState(false);

  function handleValidate() {
    if (!json.trim()) {
      setErrors([{ index: -1, field: "(json)", message: "Paste some JSON first" }]);
      setPreview(null);
      return;
    }
    const result = validateProjectJson(json);
    setErrors(result.errors);
    if (result.ok) {
      setPreview(
        result.projects.length === 1
          ? `Ready to create: "${result.projects[0].title}" (${result.projects[0].tools?.length ?? 0} tools, ${result.projects[0].features?.length ?? 0} features, ${result.projects[0].challenges?.length ?? 0} challenges)`
          : `Ready to create ${result.projects.length} projects`
      );
    } else {
      setPreview(null);
    }
  }

  const realErrors = errors.filter((e) => !e.message.startsWith("Unknown"));
  const warnings = errors.filter((e) => e.message.startsWith("Unknown"));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-foreground/60">
          Paste a single project JSON object or an array of objects.
        </p>
        <button
          type="button"
          onClick={() => setShowSchema(!showSchema)}
          className="text-xs text-primary hover:underline"
        >
          {showSchema ? "Hide Schema" : "Show Schema"}
        </button>
      </div>

      {showSchema && (
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-foreground/70">Project JSON Schema</p>
            <button
              type="button"
              onClick={() => {
                setJson(JSON.stringify(PROJECT_JSON_TEMPLATE, null, 2));
                setErrors([]);
                setPreview(null);
              }}
              className="text-xs text-primary hover:underline"
            >
              Use as template
            </button>
          </div>
          <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-black/40 p-3 text-xs text-foreground/70">
            {JSON.stringify(PROJECT_JSON_TEMPLATE, null, 2)}
          </pre>
          <div className="mt-3 space-y-1 text-[11px] text-foreground/50">
            <p><strong className="text-foreground/70">Required:</strong> title</p>
            <p><strong className="text-foreground/70">Optional:</strong> id (auto from title), description, demo_img, live_url, repo_url, architecture, featured, sort_order</p>
            <p><strong className="text-foreground/70">tools[]:</strong> Array of tool IDs or names (e.g. &quot;React&quot;, &quot;TypeScript&quot;, &quot;Next.js&quot;) — matched case-insensitively</p>
            <p><strong className="text-foreground/70">features[]:</strong> Array of feature description strings</p>
            <p><strong className="text-foreground/70">challenges[]:</strong> Array of {"{title, solution}"} objects</p>
          </div>
        </div>
      )}

      <label className="block space-y-2 text-sm">
        <span className="text-foreground/80">Project JSON</span>
        <textarea
          value={json}
          onChange={(e) => {
            setJson(e.target.value);
            setErrors([]);
            setPreview(null);
          }}
          rows={12}
          placeholder='{"title": "My Project", "description": "...", ...}'
          className={`${inputClass} font-mono text-xs`}
        />
      </label>

      {realErrors.length > 0 && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-200">
          <p className="font-medium">Validation errors:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {realErrors.map((e, i) => (
              <li key={i}>
                <span className="font-mono text-red-300">{e.field}</span>: {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-3 text-xs text-amber-200">
          <p className="font-medium">Warnings:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {warnings.map((e, i) => (
              <li key={i}>
                <span className="font-mono text-amber-300">{e.field}</span>: {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {preview && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
          {preview}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={handleValidate}>
          Validate
        </Button>
        <form action={createProjectFromJsonAction}>
          <input type="hidden" name="json" value={json} />
          <Button type="submit" size="sm" disabled={!preview}>
            Create from JSON
          </Button>
        </form>
      </div>
    </div>
  );
}
