import { Module, MiddlewareConsumer, Global } from '@nestjs/common';
import { WinstonLoggerService } from './logger/winston.service';
import { CorrelationIdMiddleware } from './logger/correlation-id.middleware';
import { PrometheusService } from './metrics/prometheus.service';
import { HealthCheckService } from './metrics/health-check.service';
import { JaegerTracingService } from './tracing/jaeger.config';
import { MonitoringController } from './monitoring.controller';
import { PrismaService } from '../prisma/prisma.service';

@Global()
@Module({
  controllers: [MonitoringController],
  providers: [
    WinstonLoggerService,
    PrometheusService,
    HealthCheckService,
    JaegerTracingService,
    PrismaService, // Add PrismaService as a provider
  ],
  exports: [
    WinstonLoggerService,
    PrometheusService,
    HealthCheckService,
    JaegerTracingService,
  ],
})
export class MonitoringModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}