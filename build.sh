#!/bin/bash
# Build script for moltbook-frontend
# Creates a production-ready Docker image

set -e

# Configuration
IMAGE_NAME="${IMAGE_NAME:-moltbook-frontend}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${REGISTRY:-}"

# API URL for the build (can be overridden)
API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-https://moltbook-api-538486406156.us-central1.run.app/api/v1}"

echo "Building moltbook-frontend..."
echo "============================="
echo "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo "API URL: ${API_BASE_URL}"
echo ""

# Build the Docker image
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL="${API_BASE_URL}" \
  -t "${IMAGE_NAME}:${IMAGE_TAG}" \
  .

echo ""
echo "Build complete!"
echo ""
echo "Image created:"
echo "  - ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""
echo "To run locally:"
echo "  docker run -p 3001:3000 ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""
echo "To push to registry:"
if [ -n "$REGISTRY" ]; then
  echo "  docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
  echo "  docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
else
  echo "  Set REGISTRY env var and re-run, or manually tag and push"
fi
echo ""
echo "To build with a different API URL:"
echo "  NEXT_PUBLIC_API_BASE_URL=https://your-api.com/api/v1 ./build.sh"
