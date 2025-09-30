#!/bin/bash

# Build Docker images for Kubernetes deployment
set -e

echo "Building Docker images for Kubernetes deployment..."

# Set image tag (use commit hash or version for production)
TAG=${1:-latest}
REGISTRY=${2:-""}  # Set to your container registry if pushing

# Function to build and optionally push image
build_image() {
    local service=$1
    local context=$2
    local image_name="testcase-${service}:${TAG}"
    
    if [ -n "$REGISTRY" ]; then
        image_name="${REGISTRY}/testcase-${service}:${TAG}"
    fi
    
    echo "Building ${image_name}..."
    docker build -t ${image_name} ${context}
    
    if [ -n "$REGISTRY" ]; then
        echo "Pushing ${image_name}..."
        docker push ${image_name}
    fi
    
    echo "✓ Built ${image_name}"
}

# Build all images
build_image "backend" "./backend"
build_image "ai" "./ai"
build_image "frontend" "./frontend"

echo ""
echo "✅ All images built successfully!"

if [ -z "$REGISTRY" ]; then
    echo ""
    echo "⚠️  Images are built locally. For production deployment:"
    echo "   1. Tag images for your container registry:"
    echo "      docker tag testcase-backend:${TAG} your-registry.com/testcase-backend:${TAG}"
    echo "   2. Push to registry:"
    echo "      docker push your-registry.com/testcase-backend:${TAG}"
    echo "   3. Update image names in k8s manifests"
fi