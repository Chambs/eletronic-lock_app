#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

IMAGE="electronic-lock-app/mobile-frontend"
TAG="v1"
NAMESPACE="electronic-lock-app"

usage() {
  echo "Usage: $0 [-i|--image IMAGE] [-t|--tag TAG] [-n|--namespace NAMESPACE]"
  echo "Defaults: IMAGE=${IMAGE}, TAG=${TAG}, NAMESPACE=${NAMESPACE}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -i|--image)
      IMAGE="$2"
      shift 2
      ;;
    -t|--tag)
      TAG="$2"
      shift 2
      ;;
    -n|--namespace)
      NAMESPACE="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

echo "Applying Kubernetes manifests..."
# Ensure namespace exists before applying namespaced resources
kubectl apply -f "$PROJECT_ROOT/k8s/namespace.yaml"

kubectl apply -f "$PROJECT_ROOT/k8s/mobile-frontend-deployment.yaml" -f "$PROJECT_ROOT/k8s/mobile-frontend-service.yaml"

echo "Setting image on deployment/mobile-frontend to ${IMAGE}:${TAG} ..."
kubectl -n "${NAMESPACE}" set image deployment/mobile-frontend mobile-frontend="${IMAGE}:${TAG}"

echo "Waiting for rollout to complete..."
kubectl -n "${NAMESPACE}" rollout status deployment/mobile-frontend

echo "If needed, update ingress and apply: kubectl apply -f $PROJECT_ROOT/k8s/ingress.yaml"


