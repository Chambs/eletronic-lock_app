# scripts/deploy.sh
#!/bin/bash

set -euo pipefail

NS=electronic-lock-app

echo "Applying Kubernetes resources to namespace: $NS"

# Namespace & Config
kubectl apply -f ../k8s/namespace.yaml
kubectl apply -f ../k8s/configmap.yaml

# Deployments
kubectl apply -f ../k8s/user-services-deployment.yaml
kubectl apply -f ../k8s/log-services-deployment.yaml
kubectl apply -f ../k8s/lock-services-deployment.yaml
kubectl apply -f ../k8s/event-bus-deployment.yaml
kubectl apply -f ../k8s/frontend-deployment.yaml

# Services
kubectl apply -f ../k8s/user-services-service.yaml
kubectl apply -f ../k8s/log-services-service.yaml
kubectl apply -f ../k8s/lock-services-service.yaml
kubectl apply -f ../k8s/event-bus-service.yaml
kubectl apply -f ../k8s/frontend-service.yaml

# Ingress
kubectl apply -f ../k8s/ingress.yaml

echo "Resources applied. Current status:"
kubectl get all -n "$NS"
kubectl get ingress -n "$NS"