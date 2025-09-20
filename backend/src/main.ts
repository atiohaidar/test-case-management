import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => {
      // This will be caught by our AllExceptionsFilter
      throw errors;
    },
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
}
bootstrap();