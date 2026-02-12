#!/bin/bash
# Build script for moltbook-frontend
# Creates a production-ready Docker image

set -e

# Configuration
IMAGE_NAME="${IMAGE_NAME:-moltbook-frontend}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${REGISTRY:-}"

echo "Building moltbook-frontend..."
echo "============================="
echo "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo "API URL: /api/v1 (hardcoded, relative to same origin)"
echo ""

# Build the Docker image
# Note: API_BASE_URL is hardcoded to /api/v1 in lib/constants.ts
# No build args needed — the backend serves the frontend from the same origin
docker build \
  -t "${IMAGE_NAME}:${IMAGE_TAG}" \
  .

echo ""
echo "Build complete!"
echo ""
echo "Image created:"
echo "  - ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""
echo "To run locally:"
echo "  docker run -p 8080:8080 ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""
echo "To push to registry:"
if [ -n "$REGISTRY" ]; then
  echo "  docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
  echo "  docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
else
  echo "  Set REGISTRY env var and re-run, or manually tag and push"
fi
