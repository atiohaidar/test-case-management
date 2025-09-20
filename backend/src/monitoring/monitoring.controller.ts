import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrometheusService } from './metrics/prometheus.service';
import { HealthCheckService } from './metrics/health-check.service';

@ApiTags('Monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly prometheusService: PrometheusService,
    private readonly healthCheckService: HealthCheckService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Get basic health status' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  async getHealth() {
    return await this.healthCheckService.getHealthStatus();
  }

  @Get('health/detailed')
  @ApiOperation({ summary: 'Get detailed health status with system metrics' })
  @ApiResponse({ status: 200, description: 'Detailed health information' })
  async getDetailedHealth() {
    return await this.healthCheckService.getDetailedHealth();
  }

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  @ApiResponse({ status: 200, description: 'Prometheus metrics in text format' })
  async getMetrics() {
    return await this.prometheusService.getMetrics();
  }

  @Get('ping')
  @ApiOperation({ summary: 'Simple ping endpoint for load balancer health checks' })
  @ApiResponse({ status: 200, description: 'Pong' })
  getPing() {
    return { status: 'pong', timestamp: new Date().toISOString() };
  }
}