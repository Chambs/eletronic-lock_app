#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

IMAGE="electronic-lock-app/mobile-frontend"
TAG="v1"
PUSH=false

usage() {
  echo "Usage: $0 [-i|--image IMAGE] [-t|--tag TAG] [-p|--push]"
  echo "Defaults: IMAGE=${IMAGE}, TAG=${TAG}"
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
    -p|--push)
      PUSH=true
      shift
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

echo "Building image ${IMAGE}:${TAG} from front-mobile ..."
docker build -t "${IMAGE}:${TAG}" -f "$PROJECT_ROOT/front-mobile/Dockerfile" "$PROJECT_ROOT/front-mobile"
docker tag "${IMAGE}:${TAG}" "${IMAGE}:latest"

if [[ "${PUSH}" == "true" ]]; then
  echo "Pushing image ${IMAGE}:${TAG} ..."
  docker push "${IMAGE}:${TAG}"
  echo "Pushing image ${IMAGE}:latest ..."
  docker push "${IMAGE}:latest"
fi

echo "Done."


