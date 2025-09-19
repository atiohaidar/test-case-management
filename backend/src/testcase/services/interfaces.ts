import { TestCase } from '@prisma/client';
import { CreateTestCaseDto } from '../dto/create-testcase.dto';
import { UpdateTestCaseDto } from '../dto/update-testcase.dto';

export interface ITestCaseCrudService {
  create(createTestCaseDto: CreateTestCaseDto): Promise<Partial<TestCase>>;
  findAll(): Promise<Partial<TestCase>[]>;
  findOne(id: string): Promise<Partial<TestCase>>;
  update(id: string, updateTestCaseDto: UpdateTestCaseDto): Promise<Partial<TestCase>>;
  remove(id: string): Promise<void>;
}

export interface ITestCaseEmbeddingService {
  generateEmbedding(data: any): Promise<number[]>;
}

export interface ITestCaseSearchService {
  search(searchDto: any): Promise<any[]>;
}

export interface ITestCaseReferenceService {
  getWithReference(id: string): Promise<any>;
  getDerivedTestCases(id: string): Promise<any[]>;
  getFullDetail(id: string): Promise<any>;
  deriveFromTestCase(referenceId: string, createTestCaseDto: CreateTestCaseDto): Promise<any>;
  addManualReference(sourceId: string, targetId: string): Promise<any>;
  removeReference(referenceId: string): Promise<any>;
}

export interface ITestCaseAIService {
  generateTestCaseWithAI(generateDto: any): Promise<any>;
  generateAndSaveTestCaseWithAI(generateDto: any): Promise<any>;
}