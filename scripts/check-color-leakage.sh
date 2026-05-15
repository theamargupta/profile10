#!/usr/bin/env bash
#
# check-color-leakage.sh
# ----------------------
# Fails the build when raw Tailwind palette classes (e.g. `text-red-500`,
# `bg-emerald-200`) or hard-coded hex colours leak into source. Every colour
# should flow through `var(--color-*)` tokens defined in
# `src/app/globals.css`, or — for edge-runtime surfaces — from
# `src/lib/theme/colors.ts`.
#
# Run via:   npm run lint:colors
#
# Exits 1 on any finding; prints offending file:line so CI can grep.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Files we deliberately allow to contain hex / palette classes:
#   - src/lib/theme/colors.ts             (THEME — single source of truth for JS)
#   - src/lib/palette.ts                  (legacy palette mirror; kept for canvas)
#   - src/app/globals.css                 (CSS token definitions)
#   - opengraph-image.tsx / icon.tsx /    (edge runtime — uses THEME)
#     apple-icon.tsx
#   - src/components/canvas/**            (Three.js / WebGL — needs raw hex)
#   - *.test.*                            (test fixtures may carry raw values)
ALLOW_REGEX='^src/lib/theme/colors\.ts:|^src/lib/palette\.ts:|^src/app/globals\.css:|^src/app/opengraph-image\.tsx:|^src/app/icon\.tsx:|^src/app/apple-icon\.tsx:|^src/components/canvas/|\.test\.[tj]sx?:'

# Tailwind palette names we ban.
PALETTES='red|green|blue|yellow|amber|emerald|sky|indigo|violet|fuchsia|pink|rose|orange|lime|teal|cyan|slate|gray|zinc|neutral|stone'

# Properties that can carry a palette class.
PROPS='border|bg|text|ring|from|to|via|fill|stroke|outline|divide|placeholder|caret|accent|decoration|shadow'

PALETTE_PATTERN="(${PROPS})-(${PALETTES})-[0-9]"
# Hex pattern — match colours used in CSS / JSX style / arbitrary class
# contexts (`background: #…`, `color: #…`, `bg-[#…]`, `color="#…"`, etc.).
# Skips placeholder strings like `placeholder="e.g. #61DAFB"` where the hex
# is documentation, not styling.
HEX_PATTERN='(background|color|fill|stroke|backgroundColor|borderColor|outline|shadow)[^a-zA-Z0-9]+#[0-9a-fA-F]{3,8}|\[#[0-9a-fA-F]{3,8}\]|"#[0-9a-fA-F]{3,8}"|'"'"'#[0-9a-fA-F]{3,8}'"'"

fail=0

scan() {
  local label="$1" pattern="$2"
  # grep -rnE returns 1 when no match — guard with || true.
  local hits
  hits="$(grep -rnE "$pattern" src/ \
    --include='*.tsx' --include='*.ts' --include='*.css' \
    2>/dev/null | grep -Ev "$ALLOW_REGEX" || true)"
  if [ -n "$hits" ]; then
    echo ""
    echo "✗ $label leakage found:"
    echo "$hits"
    fail=1
  fi
}

scan "Tailwind palette class"    "$PALETTE_PATTERN"
scan "Raw hex colour in JS/TSX"  "$HEX_PATTERN"

if [ "$fail" -eq 0 ]; then
  echo "✓ no colour leakage — all colours flow from tokens"
  exit 0
fi

echo ""
echo "Fix: replace with var(--color-*) tokens (globals.css) or import"
echo "     THEME from '@/lib/theme/colors' for edge-runtime surfaces."
exit 1
