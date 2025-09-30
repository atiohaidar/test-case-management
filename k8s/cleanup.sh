#!/bin/bash

# Cleanup Kubernetes deployment
set -e

echo "🧹 Cleaning up Test Case Management from Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

echo "📋 Current kubectl context:"
kubectl config current-context

read -p "Are you sure you want to delete the entire testcase-management namespace? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo ""
echo "🗑️  Deleting all resources..."

# Delete namespace (this will delete all resources in it)
kubectl delete namespace testcase-management --ignore-not-found=true

echo ""
echo "✅ Cleanup completed!"
echo "All resources in the testcase-management namespace have been deleted."