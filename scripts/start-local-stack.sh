#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  jobs -p | xargs -r kill
}

trap cleanup EXIT INT TERM

bash ./scripts/start-backend.sh &
bash ./scripts/start-ai-service.sh &
npm run dev &

wait
