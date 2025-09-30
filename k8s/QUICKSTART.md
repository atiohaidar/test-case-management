# Quick Start Guide for Kubernetes Deployment

## TL;DR - Get it running fast!

```bash
# 1. Build images
cd /workspaces/test-case-management
./k8s/build-images.sh

# 2. Deploy to Kubernetes
./k8s/deploy.sh

# 3. Access the app
kubectl port-forward svc/frontend-service 8080:80 -n testcase-management
# Open http://localhost:8080
```

## What you get

✅ **Complete Multi-Service Application**
- React Frontend (Nginx + Auto-scaling)
- NestJS Backend API (Auto-scaling)  
- Python AI Service (Auto-scaling)
- MySQL Database (Persistent storage)

✅ **Production-Ready Features**
- Health checks & readiness probes
- Resource limits & requests
- Horizontal Pod Autoscaling (HPA)
- Persistent volume for database
- ConfigMaps & Secrets management
- Ingress for external access

✅ **Multiple Environments**
- Development (minimal resources)
- Production (high availability)
- Staging (coming soon)

## Quick Commands

```bash
# Different environments
./k8s/deploy-env.sh development    # Low resource usage
./k8s/deploy-env.sh base          # Default configuration  
./k8s/deploy-env.sh production    # High availability

# With custom registry
./k8s/build-images.sh latest your-registry.com
./k8s/deploy-env.sh production your-registry.com latest

# Check status
kubectl get pods -n testcase-management
kubectl get services -n testcase-management

# View logs
kubectl logs -f deployment/backend -n testcase-management

# Scale manually
kubectl scale deployment backend --replicas=5 -n testcase-management

# Clean up everything
./k8s/cleanup.sh
```

## Access Methods

1. **Port Forward** (easiest for testing):
   ```bash
   kubectl port-forward svc/frontend-service 8080:80 -n testcase-management
   ```

2. **LoadBalancer** (cloud environments):
   ```bash
   kubectl get svc frontend-loadbalancer -n testcase-management
   ```

3. **Ingress** (with domain):
   - Update `k8s/07-ingress.yaml` with your domain
   - Configure DNS to point to your ingress controller

## Next Steps

- **Monitoring**: Add Prometheus & Grafana
- **Logging**: Set up ELK stack or similar
- **CI/CD**: Integrate with GitLab/GitHub Actions
- **Security**: Add network policies, pod security standards
- **Backup**: Configure database backups