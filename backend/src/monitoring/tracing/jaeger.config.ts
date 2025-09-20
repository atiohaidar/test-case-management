import { Injectable, OnModuleInit } from '@nestjs/common';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { trace } from '@opentelemetry/api';

@Injectable()
export class JaegerTracingService implements OnModuleInit {
  private sdk: NodeSDK;

  constructor() {
    this.initializeTracing();
  }

  onModuleInit() {
    // Start the SDK
    this.sdk.start();
  }

  private initializeTracing() {
    const jaegerExporter = new JaegerExporter({
      endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
    });

    this.sdk = new NodeSDK({
      serviceName: 'test-case-management-backend',
      traceExporter: jaegerExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Disable file system instrumentation to reduce noise
          '@opentelemetry/instrumentation-fs': {
            enabled: false,
          },
          // Configure HTTP instrumentation
          '@opentelemetry/instrumentation-http': {
            enabled: true,
          },
          // Configure database instrumentation if available
          '@opentelemetry/instrumentation-mongodb': {
            enabled: true,
          },
          '@opentelemetry/instrumentation-mysql': {
            enabled: true,
          },
          '@opentelemetry/instrumentation-pg': {
            enabled: true,
          },
        }),
      ],
    });
  }

  // Method to create custom spans for specific operations
  createSpan(name: string, attributes?: Record<string, string | number | boolean>) {
    const tracer = trace.getTracer('test-case-management-backend');
    const span = tracer.startSpan(name);

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        span.setAttribute(key, value);
      });
    }

    return span;
  }

  // Method to get tracer for manual instrumentation
  getTracer(name?: string) {
    return trace.getTracer(name || 'test-case-management-backend');
  }

  // Graceful shutdown
  async shutdown() {
    await this.sdk.shutdown();
  }
}