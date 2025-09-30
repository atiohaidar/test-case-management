# Kubernetes Deployment for Test Case Management

This directory contains Kubernetes manifests and scripts to deploy the Test Case Management application to a Kubernetes cluster.

## Prerequisites

1. **Kubernetes Cluster**: You need access to a Kubernetes cluster (local or cloud-based)
2. **kubectl**: Configured to connect to your cluster
3. **Docker**: To build the container images
4. **Container Registry** (for production): Such as Docker Hub, AWS ECR, GCR, etc.

## Quick Start

### 1. Build Docker Images

```bash
# Build images locally
./k8s/build-images.sh

# Or build and push to a registry
./k8s/build-images.sh latest your-registry.com
```

### 2. Deploy to Kubernetes

```bash
./k8s/deploy.sh
```

### 3. Access the Application

After deployment, you can access the application via:

- **LoadBalancer**: Get the external IP with `kubectl get svc frontend-loadbalancer -n testcase-management`
- **Ingress**: Configure DNS to point to your ingress controller
- **Port Forward** (for testing): `kubectl port-forward svc/frontend-service 8080:80 -n testcase-management`

## Architecture

The Kubernetes deployment includes:

- **Frontend**: React application served by Nginx (2 replicas)
- **Backend**: NestJS API server (3 replicas)
- **AI Service**: Python FastAPI service (2 replicas)
- **Database**: MySQL with persistent storage (1 replica)
- **Ingress**: Routes traffic to frontend and backend
- **HPA**: Horizontal Pod Autoscaling for all services

## Configuration

### Environment Variables

Environment variables are managed through ConfigMaps and Secrets:

- `mysql-config` & `mysql-secret`: Database configuration
- `backend-config`: Backend service configuration
- `ai-config` & `ai-secret`: AI service configuration

### Storage

- MySQL data is stored in a PersistentVolume
- Default storage request: 10Gi
- Modify `k8s/02-persistent-volumes.yaml` to change storage requirements

### Scaling

Auto-scaling is configured for all services:

- **Backend**: 2-10 replicas (CPU: 70%, Memory: 80%)
- **AI Service**: 1-5 replicas (CPU: 80%, Memory: 85%)
- **Frontend**: 2-8 replicas (CPU: 70%)

## Customization

### Resource Limits

Adjust resource requests and limits in the deployment files:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### Domain Configuration

Update the ingress hostname in `k8s/07-ingress.yaml`:

```yaml
rules:
- host: your-domain.com  # Change this
```

### TLS/HTTPS

Uncomment the TLS section in `k8s/07-ingress.yaml` and configure cert-manager for automatic certificate management.

### Container Registry

For production deployments, update image names in all deployment files:

```yaml
image: your-registry.com/testcase-backend:latest
```

## Monitoring and Debugging

### Check Pod Status

```bash
kubectl get pods -n testcase-management
```

### View Logs

```bash
# Backend logs
kubectl logs -f deployment/backend -n testcase-management

# AI service logs
kubectl logs -f deployment/ai-service -n testcase-management

# Frontend logs
kubectl logs -f deployment/frontend -n testcase-management
```

### Scale Services

```bash
# Scale backend
kubectl scale deployment backend --replicas=5 -n testcase-management

# Scale AI service
kubectl scale deployment ai-service --replicas=3 -n testcase-management
```

### Database Access

```bash
# Connect to MySQL
kubectl run mysql-client --rm -it --image=mysql:8.0 -- mysql -h mysql-service.testcase-management.svc.cluster.local -u root -p
```

## Backup and Recovery

### Database Backup

```bash
# Create a backup job
kubectl run mysql-backup --rm -it --image=mysql:8.0 -- mysqldump -h mysql-service.testcase-management.svc.cluster.local -u root -p testcase_management > backup.sql
```

### PersistentVolume Backup

Use your cloud provider's volume snapshot features or backup tools like Velero.

## Security Considerations

1. **Secrets**: Store sensitive data in Kubernetes Secrets
2. **Network Policies**: Consider implementing network policies for traffic isolation
3. **RBAC**: Configure Role-Based Access Control
4. **Pod Security**: Use Pod Security Standards
5. **Image Security**: Scan container images for vulnerabilities

## Production Checklist

- [ ] Use a proper container registry
- [ ] Configure resource limits and requests
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Configure logging (ELK stack or similar)
- [ ] Implement backup strategy
- [ ] Set up alerting
- [ ] Configure TLS/HTTPS
- [ ] Review security policies
- [ ] Test disaster recovery

## Cleanup

To remove all resources:

```bash
./k8s/cleanup.sh
```

## Troubleshooting

### Common Issues

1. **Images not found**: Make sure images are built and available in the registry
2. **Persistent Volume issues**: Check storage class and availability
3. **Service connectivity**: Verify service names and ports
4. **Database connection**: Check if MySQL is ready before backend starts

### Health Checks

All services have liveness and readiness probes configured. Check probe status:

```bash
kubectl describe pod <pod-name> -n testcase-management
```