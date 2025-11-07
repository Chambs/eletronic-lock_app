# scripts/deploy.sh
#!/bin/bash

set -euo pipefail

NS=electronic-lock-app

echo "🚀 DEPLOYING ELECTRONIC LOCK APP WITH POSTGRESQL"
echo "================================================"

# Namespace & Config
echo "📦 Creating namespace and configuration..."
kubectl apply -f ../k8s/namespace.yaml
kubectl apply -f ../k8s/configmap.yaml

# PostgreSQL resources (deploy first)
echo "🗄️  Deploying PostgreSQL database..."
kubectl apply -f ../k8s/postgres-secret.yaml
kubectl apply -f ../k8s/postgres-pvc.yaml
kubectl apply -f ../k8s/postgres-deployment.yaml
kubectl apply -f ../k8s/postgres-service.yaml

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n "$NS" --timeout=300s

# Additional wait for PostgreSQL to fully initialize
echo "⏳ Waiting for PostgreSQL to accept connections..."
sleep 10

# Verify PostgreSQL is ready to accept connections
MAX_RETRIES=30
RETRY_COUNT=0
until kubectl exec -n "$NS" deployment/postgres -- psql -U postgres -c "SELECT 1" > /dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "   ❌ PostgreSQL failed to start after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "   Attempt $RETRY_COUNT/$MAX_RETRIES: PostgreSQL not ready yet, waiting..."
  sleep 2
done
echo "   ✅ PostgreSQL is ready to accept connections"

# Initialize database schema (user-service DB)
echo "🔧 Initializing database schema..."
# Windows compatibility: avoid kubectl cp issues by piping SQL directly
# Read the SQL file and pipe it to psql (works better on Windows)
if [ -f ../back/user-services/init.sql ]; then
    cat ../back/user-services/init.sql | kubectl exec -i -n "$NS" deployment/postgres -- psql -U postgres -d electronic_lock_app
    echo "   ✅ Database schema initialized successfully"
else
    echo "   ⚠️  Warning: init.sql not found, skipping schema initialization"
fi

# Run role migration if needed (idempotent - safe to run multiple times)
echo "🔄 Running role system migration..."
if [ -f ../back/user-services/migrate-roles.sql ]; then
    cat ../back/user-services/migrate-roles.sql | kubectl exec -i -n "$NS" deployment/postgres -- psql -U postgres -d electronic_lock_app
    echo "   ✅ Role system migration completed"
else
    echo "   ⚠️  Warning: migrate-roles.sql not found, skipping migration"
fi

# Ensure log-service database exists (separate DB on shared Postgres)
echo "Ensuring log-service database exists..."
kubectl apply -f ../k8s/log-service-db-job.yaml
kubectl wait --for=condition=complete job/log-service-db-bootstrap -n "$NS" --timeout=180s || true

# Deployments
echo "🚀 Deploying microservices..."
kubectl apply -f ../k8s/user-services-deployment.yaml
kubectl apply -f ../k8s/log-services-deployment.yaml
kubectl apply -f ../k8s/lock-services-deployment.yaml
kubectl apply -f ../k8s/event-bus-deployment.yaml
kubectl apply -f ../k8s/frontend-deployment.yaml

# Services
echo "🌐 Creating services..."
kubectl apply -f ../k8s/user-services-service.yaml
kubectl apply -f ../k8s/log-services-service.yaml
kubectl apply -f ../k8s/lock-services-service.yaml
kubectl apply -f ../k8s/event-bus-service.yaml
kubectl apply -f ../k8s/frontend-service.yaml

# Ingress
echo "🔗 Setting up ingress..."
kubectl apply -f ../k8s/ingress.yaml

# Wait for all pods to be ready
echo "⏳ Waiting for all services to be ready..."
kubectl wait --for=condition=ready pod -l app=user-services -n "$NS" --timeout=300s
kubectl wait --for=condition=ready pod -l app=log-service -n "$NS" --timeout=300s
kubectl wait --for=condition=ready pod -l app=lock-service -n "$NS" --timeout=300s
kubectl wait --for=condition=ready pod -l app=event-bus -n "$NS" --timeout=300s
kubectl wait --for=condition=ready pod -l app=frontend -n "$NS" --timeout=300s

echo ""
echo "🎉 DEPLOYMENT COMPLETED!"
echo "========================"
echo "📊 Current status:"
kubectl get all -n "$NS"
echo ""
echo "🔗 Ingress status:"
kubectl get ingress -n "$NS"
echo ""
echo "🗄️  Database status:"
kubectl get pods -l app=postgres -n "$NS"
echo ""
echo "🌐 Access your application:"
echo "   Primary access (NodePort - always available):"
echo "   http://localhost:30080"
echo ""
echo "   Alternative (Ingress - requires /etc/hosts entry):"
echo "   http://electronic-lock-app.local"
echo ""
echo "📝 To check logs:"
echo "   kubectl logs -f deployment/user-services -n $NS"
echo "   kubectl logs -f deployment/postgres -n $NS"
