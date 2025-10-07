# scripts/build-images.sh
#!/bin/bash

set -euo pipefail

echo "Building Docker images for Electronic Lock App..."

# Build User Service
echo "Building user-service..."
docker build -t electronic-lock-app/user-service:latest ../back/user-services/

# Build Log Service
echo "Building log-service..."
docker build -t electronic-lock-app/log-service:latest ../back/log-services/

# Build Lock Service
echo "Building lock-service..."
docker build -t electronic-lock-app/lock-service:latest ../back/lock-services/

# Build Event Bus
echo "Building event-bus..."
docker build -t electronic-lock-app/event-bus:latest ../back/shared-bus/

# Build Frontend
echo "Building frontend..."
docker build -t electronic-lock-app/frontend:latest ../front-mobile/

echo "All images built successfully!"