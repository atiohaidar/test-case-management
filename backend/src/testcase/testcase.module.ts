import { Module } from '@nestjs/common';
import { TestCaseService } from './testcase.service';
import { TestCaseController } from './testcase.controller';
import { TestCaseCrudService } from './services/testcase-crud.service';
import { TestCaseReferenceService } from './services/testcase-reference.service';
import { TestCaseAIService } from './services/testcase-ai.service';
import { TestCaseEmbeddingService } from './services/testcase-embedding.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TestCaseController],
  providers: [
    TestCaseService,
    TestCaseCrudService,
    TestCaseReferenceService,
    TestCaseAIService,
    TestCaseEmbeddingService,
    PrismaService
  ],
  exports: [TestCaseService],
})
export class TestCaseModule { }