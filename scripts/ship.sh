#!/bin/bash
# ship.sh — Build, zip, and upload frontend to GCS for deployment
# Usage: ./scripts/ship.sh
set -e

# Builds directory
BUILDS_DIR="builds"
mkdir -p "${BUILDS_DIR}"

# Auto-increment version from existing builds
LATEST=$(ls -1 ${BUILDS_DIR}/frontend_v*.zip 2>/dev/null | sed 's/.*frontend_v\([0-9]*\)\.zip/\1/' | sort -n | tail -1)
VERSION=$(( ${LATEST:-0} + 1 ))
ZIP_NAME="frontend_v${VERSION}.zip"

echo ""
echo "🚀 Shipping frontend v${VERSION}"
echo "================================"

# 1. Clean previous build artifacts
echo "🧹 Cleaning old build..."
rm -rf build .next

# 2. Build
echo "🔨 Building..."
npm run build

# 3. Zip the build directory
echo "📦 Zipping → ${BUILDS_DIR}/${ZIP_NAME}"
zip -qr "${BUILDS_DIR}/${ZIP_NAME}" build

echo ""
echo "✅ ${BUILDS_DIR}/${ZIP_NAME} created ($(du -h "${BUILDS_DIR}/${ZIP_NAME}" | cut -f1))"

# 4. Upload to GCS if gcloud is available
if command -v gcloud &> /dev/null; then
  echo "☁️  Uploading to GCS..."
  gcloud storage cp "${BUILDS_DIR}/${ZIP_NAME}" "gs://moltbook-images-hd/builds/${ZIP_NAME}"
  gcloud storage cp "${BUILDS_DIR}/${ZIP_NAME}" "gs://moltbook-images-hd/builds/frontend-latest.zip"
  echo "✅ Uploaded to gs://moltbook-images-hd/builds/"
  echo ""
  echo "📣 Tell Sai to deploy:"
  echo "   gcloud storage cp gs://moltbook-images-hd/builds/frontend-latest.zip /tmp/frontend-latest.zip"
  echo "   ./scripts/deploy-frontend.sh /tmp/frontend-latest.zip"
else
  echo ""
  echo "⚠️  gcloud not found — skipping upload."
  echo "📎 Send ${BUILDS_DIR}/${ZIP_NAME} to backend team manually."
fi

echo ""
echo "Done! 🎉"
