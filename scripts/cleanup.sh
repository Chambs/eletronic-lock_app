#!/bin/bash

set -euo pipefail

echo "🧹 CLEANING EVERYTHING - Electronic Lock App"
echo "============================================="

# 1. Kubernetes cleanup
echo "📦 Cleaning Kubernetes resources..."
if kubectl get namespace electronic-lock-app >/dev/null 2>&1; then
    kubectl delete namespace electronic-lock-app
    echo "✅ Kubernetes namespace deleted"
else
    echo "ℹ️  Kubernetes namespace not found"
fi

# 2. Stop and remove containers
echo "🐳 Cleaning Docker containers..."
if [ $(docker ps -aq | wc -l) -gt 0 ]; then
    docker stop $(docker ps -aq) 2>/dev/null || true
    docker rm $(docker ps -aq) 2>/dev/null || true
    echo "✅ Docker containers cleaned"
else
    echo "ℹ️  No Docker containers to clean"
fi

# 3. Remove project images
echo "🖼️  Cleaning Docker images..."
PROJECT_IMAGES=(
    "electronic-lock-app/user-service:latest"
    "electronic-lock-app/log-service:latest"
    "electronic-lock-app/lock-service:latest"
    "electronic-lock-app/event-bus:latest"
    "electronic-lock-app/frontend:latest"
    "electronic-lock-app/postgres:latest"
    "electronic-lock-app/mobile-frontend:latest"
    "electronic-lock-app/mobile-frontend:v1"
    "electronic-lock-mobile-frontend:latest"
    "electronic-lock-mobile-frontend:v1"
)

for image in "${PROJECT_IMAGES[@]}"; do
    if docker images -q "$image" >/dev/null 2>&1; then
        docker rmi "$image" 2>/dev/null || true
        echo "✅ Removed $image"
    fi
done

# 4. Clean up PostgreSQL volumes (if any)
echo "🗄️  Cleaning PostgreSQL volumes..."
if docker volume ls -q | grep -q postgres; then
    docker volume rm $(docker volume ls -q | grep postgres) 2>/dev/null || true
    echo "✅ PostgreSQL volumes cleaned"
else
    echo "ℹ️  No PostgreSQL volumes to clean"
fi

# 5. Clean up unused resources
echo "🧽 Cleaning unused Docker resources..."
docker volume prune -f >/dev/null 2>&1 || true
docker network prune -f >/dev/null 2>&1 || true

echo ""
echo "🎉 CLEANUP COMPLETED!"
echo "===================="
echo "✅ Kubernetes resources: Cleaned"
echo "✅ Docker containers: Cleaned"
echo "✅ Docker images: Cleaned"
echo "✅ PostgreSQL volumes: Cleaned"
echo "✅ Docker volumes: Cleaned"
echo "✅ Docker networks: Cleaned"
echo ""
echo "To rebuild everything:"
echo "1. bash scripts/build-images.sh"
echo "2. bash scripts/deploy.sh"