#!/usr/bin/env bash
# The source mount is read-only and the .next cache is a volume, so work on a disposable copy and return only output.
set -euo pipefail

SRC_DIR="${SRC_DIR:-/src}"
WORK_DIR="${WORK_DIR:-/work}"
OUT_DIR="${OUT_DIR:-/out}"

mkdir -p "$WORK_DIR" "$OUT_DIR"
# Copy entry by entry so a Mac checkout's darwin node_modules, its local .next (which would land in the mounted cache
# volume) and a worktree's .git file stay out. The image has no tar or find, hence the loop. Local .env files stay out
# too: the main checkout holds a git-ignored .env.local with dev values, and `next build` loads .env.local and
# .env.production (Codex review, 2026-10-14). The build reads only the pulled .vercel/.env.production.local.
shopt -s dotglob nullglob
for entry in "$SRC_DIR"/*; do
  case "$(basename "$entry")" in
    node_modules | .next | .git) continue ;;
    .env.example) ;;
    .env | .env.*) continue ;;
  esac
  cp -a "$entry" "$WORK_DIR/"
done
shopt -u dotglob nullglob
cd "$WORK_DIR"

npm ci --no-audit --no-fund
npx tsc --noEmit
# --standalone: without it the functions point at /work/node_modules, which only exists in this container, and the
# Mac's `deploy --prebuilt` failed on 2026-10-13 with "ENOENT … node_modules/@opentelemetry/api/…". Docs (cli/build):
# it "creates a standalone build with all dependencies inlined into function output folders, so build artifacts are
# fully contained within the .vercel folder".
vercel build --prod --standalone

rm -rf "$OUT_DIR/output"
cp -a "$WORK_DIR/.vercel/output" "$OUT_DIR/output"
