#!/usr/bin/env bash
set -euo pipefail

if git diff --cached --name-only 2>/dev/null | grep -E '(^|/)\.env($|\.|/)' >/dev/null; then
  echo "Blocked: .env files must not be committed." >&2
  exit 1
fi

exit 0
