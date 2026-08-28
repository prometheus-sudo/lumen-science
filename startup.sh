#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npm run db:migrate || true
exec npm run dev
