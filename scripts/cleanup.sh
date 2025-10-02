# scripts/cleanup.sh
#!/bin/bash

set -euo pipefail

NS=electronic-lock-app

kubectl rollout restart deployment/user-services -n electronic-lock-app
kubectl rollout restart deployment/log-service -n electronic-lock-app
kubectl rollout restart deployment/lock-service -n electronic-lock-app
kubectl rollout restart deployment/event-bus -n electronic-lock-app
kubectl rollout restart deployment/frontend -n electronic-lock-app

echo "Deleting Kubernetes resources from namespace: $NS"

# Ingress
kubectl delete -f ../k8s/ingress.yaml --ignore-not-found

# Services
kubectl delete -f ../k8s/frontend-service.yaml --ignore-not-found
kubectl delete -f ../k8s/event-bus-service.yaml --ignore-not-found
kubectl delete -f ../k8s/lock-services-service.yaml --ignore-not-found
kubectl delete -f ../k8s/log-services-service.yaml --ignore-not-found
kubectl delete -f ../k8s/user-services-service.yaml --ignore-not-found

# Deployments
kubectl delete -f ../k8s/frontend-deployment.yaml --ignore-not-found
kubectl delete -f ../k8s/event-bus-deployment.yaml --ignore-not-found
kubectl delete -f ../k8s/lock-services-deployment.yaml --ignore-not-found
kubectl delete -f ../k8s/log-services-deployment.yaml --ignore-not-found
kubectl delete -f ../k8s/user-services-deployment.yaml --ignore-not-found

# Config e Namespace
kubectl delete -f ../k8s/configmap.yaml --ignore-not-found
kubectl delete -f ../k8s/namespace.yaml --ignore-not-found
