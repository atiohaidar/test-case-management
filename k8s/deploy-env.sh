#!/bin/bash

# Enhanced deployment script with environment support
set -e

ENVIRONMENT=${1:-"base"}
REGISTRY=${2:-""}
TAG=${3:-"latest"}

echo "🚀 Deploying Test Case Management to Kubernetes"
echo "   Environment: $ENVIRONMENT"
echo "   Registry: ${REGISTRY:-"local"}"
echo "   Tag: $TAG"

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

# Function to deploy using kustomize
deploy_with_kustomize() {
    local env=$1
    local path="k8s"
    
    if [ "$env" != "base" ]; then
        path="k8s/overlays/$env"
        if [ ! -d "$path" ]; then
            echo "❌ Environment '$env' not found in overlays"
            echo "Available environments: base, development, production"
            exit 1
        fi
    fi
    
    echo "📦 Applying manifests from $path..."
    
    if command -v kustomize &> /dev/null; then
        kustomize build $path | kubectl apply -f -
    else
        kubectl apply -k $path
    fi
}

# Update image tags if registry is provided
if [ -n "$REGISTRY" ]; then
    echo "🏷️  Updating image tags for registry: $REGISTRY"
    
    # Update kustomization.yaml with registry images
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "Production images already configured in overlay"
    else
        echo "For custom registry, update the kustomization.yaml files manually"
    fi
fi

# Deploy
deploy_with_kustomize $ENVIRONMENT

# Wait for rollout
echo ""
echo "⏳ Waiting for deployments to be ready..."

if [ "$ENVIRONMENT" = "development" ]; then
    PREFIX="dev-"
elif [ "$ENVIRONMENT" = "production" ]; then
    PREFIX="prod-"
else
    PREFIX=""
fi

kubectl wait --for=condition=available deployment/${PREFIX}mysql -n testcase-management --timeout=300s
kubectl wait --for=condition=available deployment/${PREFIX}ai-service -n testcase-management --timeout=300s
kubectl wait --for=condition=available deployment/${PREFIX}backend -n testcase-management --timeout=300s
kubectl wait --for=condition=available deployment/${PREFIX}frontend -n testcase-management --timeout=300s

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Current status:"
kubectl get pods -n testcase-management
echo ""
echo "🌐 Services:"
kubectl get services -n testcase-management

if [ "$ENVIRONMENT" = "production" ]; then
    echo ""
    echo "🔒 TLS/HTTPS is configured for production"
    echo "Make sure cert-manager is installed and configured"
fi

echo ""
echo "📝 Access the application:"
if kubectl get ingress -n testcase-management &> /dev/null; then
    echo "   Ingress: kubectl get ingress -n testcase-management"
fi
echo "   Port Forward: kubectl port-forward svc/${PREFIX}frontend-service 8080:80 -n testcase-management"