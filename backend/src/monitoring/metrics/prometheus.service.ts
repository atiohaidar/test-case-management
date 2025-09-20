import { Injectable } from '@nestjs/common';
import { register, collectDefaultMetrics, Gauge, Counter, Histogram } from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly httpRequestTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;
  private readonly activeConnections: Gauge<string>;
  private readonly databaseConnections: Gauge<string>;
  private readonly aiServiceRequests: Counter<string>;
  private readonly aiServiceErrors: Counter<string>;

  constructor() {
    // Collect default metrics (CPU, memory, etc.)
    collectDefaultMetrics({ prefix: 'testcase_' });

    // HTTP request metrics
    this.httpRequestTotal = new Counter({
      name: 'testcase_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });

    this.httpRequestDuration = new Histogram({
      name: 'testcase_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5, 10]
    });

    // Active connections
    this.activeConnections = new Gauge({
      name: 'testcase_active_connections',
      help: 'Number of active connections'
    });

    // Database connections
    this.databaseConnections = new Gauge({
      name: 'testcase_database_connections_active',
      help: 'Number of active database connections'
    });

    // AI Service metrics
    this.aiServiceRequests = new Counter({
      name: 'testcase_ai_service_requests_total',
      help: 'Total number of AI service requests',
      labelNames: ['operation', 'status']
    });

    this.aiServiceErrors = new Counter({
      name: 'testcase_ai_service_errors_total',
      help: 'Total number of AI service errors',
      labelNames: ['operation', 'error_type']
    });
  }

  // HTTP Metrics
  incrementHttpRequests(method: string, route: string, statusCode: number) {
    this.httpRequestTotal.inc({ method, route, status_code: statusCode.toString() });
  }

  recordHttpRequestDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  // Connection Metrics
  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  setDatabaseConnections(count: number) {
    this.databaseConnections.set(count);
  }

  // AI Service Metrics
  incrementAiServiceRequests(operation: string, status: string) {
    this.aiServiceRequests.inc({ operation, status });
  }

  incrementAiServiceErrors(operation: string, errorType: string) {
    this.aiServiceErrors.inc({ operation, error_type: errorType });
  }

  // Get metrics for Prometheus scraping
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  // Get registry for advanced use cases
  getRegistry() {
    return register;
  }

  // Reset all metrics (useful for testing)
  resetMetrics() {
    register.resetMetrics();
    collectDefaultMetrics({ prefix: 'testcase_' });
  }
}