#!/bin/bash

# Deploy to Kubernetes
set -e

echo "Deploying Test Case Management to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster"
    echo "Make sure your kubectl context is set correctly"
    exit 1
fi

echo "📋 Current kubectl context:"
kubectl config current-context

# Apply manifests in order
echo ""
echo "🚀 Applying Kubernetes manifests..."

kubectl apply -f k8s/00-namespace.yaml
echo "✓ Namespace created"

kubectl apply -f k8s/01-configmaps-secrets.yaml
echo "✓ ConfigMaps and Secrets applied"

kubectl apply -f k8s/02-persistent-volumes.yaml
echo "✓ Persistent Volumes applied"

kubectl apply -f k8s/03-mysql.yaml
echo "✓ MySQL deployment applied"

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
kubectl wait --for=condition=ready pod -l app=mysql -n testcase-management --timeout=300s

kubectl apply -f k8s/04-ai-service.yaml
echo "✓ AI Service deployment applied"

kubectl apply -f k8s/05-backend.yaml
echo "✓ Backend deployment applied"

kubectl apply -f k8s/06-frontend.yaml
echo "✓ Frontend deployment applied"

kubectl apply -f k8s/07-ingress.yaml
echo "✓ Ingress and LoadBalancer applied"

kubectl apply -f k8s/08-hpa.yaml
echo "✓ Horizontal Pod Autoscalers applied"

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📊 Checking deployment status..."
kubectl get pods -n testcase-management
echo ""
echo "🌐 Services:"
kubectl get services -n testcase-management
echo ""
echo "🔗 Ingress:"
kubectl get ingress -n testcase-management

echo ""
echo "📝 Next steps:"
echo "   1. Wait for all pods to be ready: kubectl get pods -n testcase-management -w"
echo "   2. Check logs if needed: kubectl logs -f deployment/backend -n testcase-management"
echo "   3. Access the application via the LoadBalancer IP or Ingress"
echo "   4. For local testing, you can port-forward: kubectl port-forward svc/frontend-service 8080:80 -n testcase-management"