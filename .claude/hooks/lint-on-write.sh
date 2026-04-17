#!/usr/bin/env bash
set -euo pipefail

if [ ! -f package.json ]; then
  exit 0
fi

npm run lint
