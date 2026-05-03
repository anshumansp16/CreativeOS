#!/usr/bin/env bash
# CreatorOS Quick Start
# Starts the Next.js API (needed for AI features) + opens the macOS app
set -euo pipefail

PROJECT_DIR="$(dirname "$0")"
WEB_DIR="${PROJECT_DIR}/dashboard"
APP_PATH="/Applications/CreatorOS.app"
PORT=3001

# --- Check if Next.js API is already running ---
if lsof -ti:${PORT} &>/dev/null; then
  echo "✅ Web API already running on port ${PORT}"
else
  echo "🌐 Starting Web API (port ${PORT})..."
  cd "${WEB_DIR}"
  nohup npm run dev -- -p ${PORT} > "${HOME}/Library/Logs/creatoros-api.log" 2>&1 &
  echo $! > /tmp/creatoros-api.pid
  echo "   PID: $(cat /tmp/creatoros-api.pid) — logs: ~/Library/Logs/creatoros-api.log"
  # Wait for it to be ready
  for i in $(seq 1 20); do
    sleep 1
    if lsof -ti:${PORT} &>/dev/null; then
      echo "✅ Web API ready"
      break
    fi
    echo "   Waiting... ($i/20)"
  done
fi

# --- Open app ---
if [ -d "${APP_PATH}" ]; then
  echo "🚀 Opening CreatorOS.app..."
  open "${APP_PATH}"
else
  echo "⚠️  CreatorOS.app not installed yet. Run: ./install-macos.sh"
  echo "   Falling back to dev mode..."
  cd "${PROJECT_DIR}/creatoros-app"
  npm run tauri dev
fi
