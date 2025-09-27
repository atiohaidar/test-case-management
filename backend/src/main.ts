import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import { WinstonLoggerService } from './monitoring/logger/winston.service';
import { JaegerTracingService } from './monitoring/tracing/jaeger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use Winston logger
  const winstonLogger = app.get(WinstonLoggerService);
  app.useLogger(winstonLogger);

  // Enable CORS
  app.enableCors();

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    // exceptionFactory: (errors) => {
    //   // This will be caught by our AllExceptionsFilter
    //   throw errors;
    // },
  }));


  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Test Case Management API')
    .setDescription('API for managing test cases with semantic search')
    .setVersion('1.0')
    .addTag('testcases')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('🚀 Backend server running on http://localhost:3000');
  console.log('📚 API Documentation available at http://localhost:3000/api');
  console.log('📊 Health check available at http://localhost:3000/monitoring/health');
  console.log('📈 Metrics available at http://localhost:3000/monitoring/metrics');

  // Graceful shutdown
  const jaegerTracing = app.get(JaegerTracingService);
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await jaegerTracing.shutdown();
    await app.close();
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await jaegerTracing.shutdown();
    await app.close();
  });
}
bootstrap();