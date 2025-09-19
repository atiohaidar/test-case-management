import { Module } from '@nestjs/common';
import { TestCaseController } from './testcase.controller';
import { TestCaseService } from './testcase.service';
import { PrismaService } from '../prisma/prisma.service';

// Import all service implementations
import { TestCaseCrudService } from './services/testcase-crud.service';
import { TestCaseAIService } from './services/testcase-ai.service';
import { TestCaseSearchService } from './services/testcase-search.service';
import { TestCaseReferenceService } from './services/testcase-reference.service';
import { TestCaseEmbeddingService } from './services/testcase-embedding.service';

// Import interfaces for DI
import {
  ITestCaseCrudService,
  ITestCaseAIService,
  ITestCaseSearchService,
  ITestCaseReferenceService,
  ITestCaseEmbeddingService,
} from './services/interfaces';

@Module({
  controllers: [TestCaseController],
  providers: [
    PrismaService,
    TestCaseService,
    // Register service implementations with their interfaces
    {
      provide: 'ITestCaseCrudService',
      useClass: TestCaseCrudService,
    },
    {
      provide: 'ITestCaseAIService',
      useClass: TestCaseAIService,
    },
    {
      provide: 'ITestCaseSearchService',
      useClass: TestCaseSearchService,
    },
    {
      provide: 'ITestCaseReferenceService',
      useClass: TestCaseReferenceService,
    },
    {
      provide: 'ITestCaseEmbeddingService',
      useClass: TestCaseEmbeddingService,
    },
  ],
  exports: [
    TestCaseService,
    'ITestCaseCrudService',
    'ITestCaseAIService',
    'ITestCaseSearchService',
    'ITestCaseReferenceService',
    'ITestCaseEmbeddingService',
  ],
})
export class TestCaseModule {}