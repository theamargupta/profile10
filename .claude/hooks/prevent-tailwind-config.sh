#!/usr/bin/env bash
set -euo pipefail

if find . -maxdepth 2 -type f \( -name 'tailwind.config.*' -o -name 'tailwind.config' \) | grep . >/dev/null; then
  echo "Blocked: Tailwind v4 project must not use tailwind.config.*." >&2
  exit 1
fi

exit 0
