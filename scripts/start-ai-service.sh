#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ -f "$ROOT_DIR/.venv/bin/activate" ]; then
  # Prefer the project virtualenv when it exists so local startup matches installed dependencies.
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.venv/bin/activate"
fi

cd ai-service

if ! python3 -c "import uvicorn" >/dev/null 2>&1; then
  echo "AI service dependencies are missing."
  echo "Install them with one of these commands, then run 'npm run dev:all' again:"
  echo "  python3 -m pip install -r ai-service/requirements.txt"
  echo "  or use a virtualenv:"
  echo "  python3 -m venv .venv && source .venv/bin/activate && python3 -m pip install -r ai-service/requirements.txt"
  exit 1
fi

python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
