#!/usr/bin/env bash
set -euo pipefail

APP_NAME="CreatorOS"
BUNDLE_ID="com.anshumanparmar.creatoros"
BUILD_DIR="$(dirname "$0")/creatoros-app/src-tauri/target/release/bundle/macos"
APP_DEST="/Applications/${APP_NAME}.app"

echo "╔══════════════════════════════════════╗"
echo "║     CreatorOS macOS Installer        ║"
echo "╚══════════════════════════════════════╝"

# --- 1. Find the built .app ---
if [ ! -d "${BUILD_DIR}/${APP_NAME}.app" ]; then
  echo "❌ .app not found at ${BUILD_DIR}/${APP_NAME}.app"
  echo "   Run: cd creatoros-app && npm run tauri build"
  exit 1
fi

# --- 2. Copy to /Applications ---
echo "📦 Installing to /Applications..."
rm -rf "${APP_DEST}"
cp -R "${BUILD_DIR}/${APP_NAME}.app" "${APP_DEST}"
echo "✅ Installed to ${APP_DEST}"

# --- 3. Remove quarantine flag ---
xattr -cr "${APP_DEST}" 2>/dev/null || true

# --- 4. Register as Login Item via launchctl (macOS 13+) ---
echo "🚀 Registering as Login Item..."
# Remove old entry first (ignore errors)
launchctl remove "gui/$(id -u)/${BUNDLE_ID}" 2>/dev/null || true

# Create a LaunchAgent plist for login-item auto-start
PLIST_DIR="${HOME}/Library/LaunchAgents"
PLIST_FILE="${PLIST_DIR}/${BUNDLE_ID}.plist"
mkdir -p "${PLIST_DIR}"

cat > "${PLIST_FILE}" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${BUNDLE_ID}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/Applications/${APP_NAME}.app/Contents/MacOS/${APP_NAME}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <false/>
  <key>StandardOutPath</key>
  <string>${HOME}/Library/Logs/creatoros.log</string>
  <key>StandardErrorPath</key>
  <string>${HOME}/Library/Logs/creatoros.log</string>
</dict>
</plist>
PLIST

# Load the plist (starts on next login)
launchctl load "${PLIST_FILE}" 2>/dev/null || true

echo "✅ Login Item registered — CreatorOS will open automatically on login"
echo ""
echo "To start NOW (without relogging):  open '${APP_DEST}'"
echo "To disable auto-start:             launchctl unload ${PLIST_FILE}"
echo "To re-enable:                      launchctl load ${PLIST_FILE}"
echo "To view logs:                      tail -f ~/Library/Logs/creatoros.log"
echo ""
echo "✨ Done! Opening CreatorOS now..."
open "${APP_DEST}"
