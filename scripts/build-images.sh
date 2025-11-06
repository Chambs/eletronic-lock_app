# scripts/build-images.sh
#!/bin/bash

set -euo pipefail

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Building Docker images for Electronic Lock App..."

# Build User Service
echo "Building user-service..."
docker build -t electronic-lock-app/user-service:latest "$PROJECT_ROOT/back/user-services/"

# Build Log Service
echo "Building log-service..."
docker build -t electronic-lock-app/log-service:latest "$PROJECT_ROOT/back/log-services/"

# Build Lock Service
echo "Building lock-service..."
docker build -t electronic-lock-app/lock-service:latest "$PROJECT_ROOT/back/lock-services/"

# Build Event Bus
echo "Building event-bus..."
docker build -t electronic-lock-app/event-bus:latest "$PROJECT_ROOT/back/shared-bus/"

# Build Frontend
echo "Building frontend..."
docker build -t electronic-lock-app/frontend:latest "$PROJECT_ROOT/front/"

# Note: PostgreSQL uses official postgres:15-alpine image
# No custom build needed, but we'll tag it for consistency
echo "Tagging PostgreSQL image..."
docker pull postgres:15-alpine
docker tag postgres:15-alpine electronic-lock-app/postgres:latest

echo "All images built successfully!"
echo "📦 Images ready:"
echo "  - electronic-lock-app/user-service:latest"
echo "  - electronic-lock-app/log-service:latest"
echo "  - electronic-lock-app/lock-service:latest"
echo "  - electronic-lock-app/event-bus:latest"
echo "  - electronic-lock-app/frontend:latest"
echo "  - electronic-lock-app/postgres:latest"