#!/usr/bin/env bash
# Lighthouse SEO + Performance, mobile and desktop, for each path; then a summary.
#   scripts/seo-audit/lighthouse.sh <out-dir> [base-url] [path ...]
# Lighthouse is pinned here, not a dependency. CHROME_PATH defaults to the
# Playwright Chromium already on this machine (headless; mobile is emulated).
set -euo pipefail

OUT="${1:?usage: lighthouse.sh <out-dir> [base-url] [path ...]}"
BASE="${2:-https://amargupta.tech}"
shift $(( $# >= 2 ? 2 : $# ))
PATHS=("$@")
[ ${#PATHS[@]} -eq 0 ] && PATHS=(/ /about /projects /blog)

LIGHTHOUSE="lighthouse@13.5.0"
: "${CHROME_PATH:=$(ls -d "$HOME"/Library/Caches/ms-playwright/chromium-*/chrome-mac-arm64/Google\ Chrome\ for\ Testing.app/Contents/MacOS/Google\ Chrome\ for\ Testing 2>/dev/null | sort | tail -1)}"
[ -x "$CHROME_PATH" ] || { echo "no Chrome at CHROME_PATH='$CHROME_PATH'" >&2; exit 1; }
export CHROME_PATH

mkdir -p "$OUT"
failures=0
i=0
for p in "${PATHS[@]}"; do
  i=$((i + 1))
  for form in mobile desktop; do
    preset=()
    [ "$form" = desktop ] && preset=(--preset=desktop)
    # ${a[@]+"${a[@]}"}: macOS ships bash 3.2, where "${a[@]}" on an empty array is an
    # "unbound variable" error under set -u (fixed only in bash 4.4).
    if ! npx -y "$LIGHTHOUSE" "$BASE$p" ${preset[@]+"${preset[@]}"} --only-categories=seo,performance \
      --output=json --output-path="$OUT/$(printf '%02d' "$i")-$form.json" \
      --chrome-flags="--headless=new" --quiet; then
      echo "lighthouse failed: $BASE$p ($form)" >&2
      failures=$((failures + 1))
    fi
  done
done

node "$(dirname "$0")/lighthouse-summary.mjs" "$OUT"
# A failed run is reported and counted, never swallowed.
[ "$failures" -eq 0 ] || { echo "$failures lighthouse run(s) failed" >&2; exit 1; }
