#!/bin/bash

set -euo pipefail

NS=electronic-lock-app

echo "=========================================="
echo "🔍 ELECTRONIC LOCK APP - HEALTH CHECK"
echo "=========================================="

# Check if namespace exists
echo "📋 Checking namespace..."
if kubectl get namespace "$NS" >/dev/null 2>&1; then
    echo "✅ Namespace '$NS' exists"
else
    echo "❌ Namespace '$NS' not found"
    exit 1
fi

echo ""
echo "🚀 POD STATUS:"
echo "----------------------------------------"
kubectl get pods -n "$NS" --no-headers | while read line; do
    pod_name=$(echo "$line" | awk '{print $1}')
    status=$(echo "$line" | awk '{print $3}')
    ready=$(echo "$line" | awk '{print $2}')
    
    if [[ "$status" == "Running" && "$ready" == "1/1" ]]; then
        echo "✅ $pod_name: $status ($ready)"
    else
        echo "❌ $pod_name: $status ($ready)"
    fi
done

echo ""
echo "🌐 SERVICES:"
echo "----------------------------------------"
kubectl get services -n "$NS" --no-headers | while read line; do
    svc_name=$(echo "$line" | awk '{print $1}')
    svc_type=$(echo "$line" | awk '{print $2}')
    cluster_ip=$(echo "$line" | awk '{print $3}')
    external_ip=$(echo "$line" | awk '{print $4}')
    
    if [[ "$svc_type" == "LoadBalancer" && "$external_ip" != "<none>" ]]; then
        echo "✅ $svc_name: $svc_type ($external_ip)"
    elif [[ "$svc_type" == "ClusterIP" && "$cluster_ip" != "<none>" ]]; then
        echo "✅ $svc_name: $svc_type ($cluster_ip)"
    else
        echo "❌ $svc_name: $svc_type - No IP assigned"
    fi
done

echo ""
echo "🔗 INGRESS:"
echo "----------------------------------------"
if kubectl get ingress -n "$NS" >/dev/null 2>&1; then
    kubectl get ingress -n "$NS" --no-headers | while read line; do
        ingress_name=$(echo "$line" | awk '{print $1}')
        hosts=$(echo "$line" | awk '{print $2}')
        address=$(echo "$line" | awk '{print $3}')
        
        if [[ "$address" != "" ]]; then
            echo "✅ $ingress_name: $hosts ($address)"
        else
            echo "⚠️  $ingress_name: $hosts - No address assigned"
        fi
    done
else
    echo "❌ No ingress found"
fi

echo ""
echo "📊 RESOURCE USAGE:"
echo "----------------------------------------"
if kubectl top pods -n "$NS" >/dev/null 2>&1; then
    kubectl top pods -n "$NS"
else
    echo "⚠️  Metrics server not available"
fi

echo ""
echo "🌍 APPLICATION ACCESS:"
echo "----------------------------------------"
echo "Frontend: http://localhost"
echo "User Service: http://localhost:3001 (via port-forward)"
echo "Log Service: http://localhost:3002 (via port-forward)"
echo "Lock Service: http://localhost:3003 (via port-forward)"
echo "Event Bus: http://localhost:10000 (via port-forward)"

echo ""
echo "🔧 QUICK TESTS:"
echo "----------------------------------------"

# Test frontend
echo -n "Frontend (localhost): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null | grep -q "200"; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test services via port-forward (if available)
echo -n "User Service: "
if kubectl get pods -n "$NS" -l app=user-services --no-headers | grep -q "Running"; then
    echo "✅ Running"
else
    echo "❌ Not running"
fi

echo -n "Log Service: "
if kubectl get pods -n "$NS" -l app=log-service --no-headers | grep -q "Running"; then
    echo "✅ Running"
else
    echo "❌ Not running"
fi

echo -n "Lock Service: "
if kubectl get pods -n "$NS" -l app=lock-service --no-headers | grep -q "Running"; then
    echo "✅ Running"
else
    echo "❌ Not running"
fi

echo -n "Event Bus: "
if kubectl get pods -n "$NS" -l app=event-bus --no-headers | grep -q "Running"; then
    echo "✅ Running"
else
    echo "❌ Not running"
fi

echo ""
echo "=========================================="
echo "📋 SUMMARY:"
echo "=========================================="

# Count running pods
total_pods=$(kubectl get pods -n "$NS" --no-headers | wc -l)
running_pods=$(kubectl get pods -n "$NS" --no-headers | grep "Running" | wc -l)

echo "Pods: $running_pods/$total_pods running"
echo "Services: $(kubectl get services -n "$NS" --no-headers | wc -l) configured"
echo "Ingress: $(kubectl get ingress -n "$NS" --no-headers 2>/dev/null | wc -l) configured"

if [[ "$running_pods" -eq "$total_pods" && "$total_pods" -gt 0 ]]; then
    echo "🎉 All systems operational!"
else
    echo "⚠️  Some issues detected. Check logs with:"
    echo "   kubectl logs -l app=<service-name> -n $NS"
fi

echo "Frontend: http://localhost"

echo "=========================================="
