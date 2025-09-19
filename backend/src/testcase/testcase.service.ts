import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestCaseDto } from './dto/create-testcase.dto';
import { UpdateTestCaseDto } from './dto/update-testcase.dto';
import { SearchTestCaseDto, SearchResultDto } from './dto/search-testcase.dto';
import { GenerateTestCaseWithAIDto, AIGeneratedTestCaseResponseDto } from './dto/generate-testcase-ai.dto';

// Import interfaces for dependency injection
import {
  ITestCaseCrudService,
  ITestCaseAIService,
  ITestCaseSearchService,
  ITestCaseReferenceService,
  ITestCaseEmbeddingService,
} from './services/interfaces';

@Injectable()
export class TestCaseService {
  constructor(
    private prisma: PrismaService,
    @Inject('ITestCaseCrudService')
    private crudService: ITestCaseCrudService,
    @Inject('ITestCaseAIService')
    private aiService: ITestCaseAIService,
    @Inject('ITestCaseSearchService')
    private searchService: ITestCaseSearchService,
    @Inject('ITestCaseReferenceService')
    private referenceService: ITestCaseReferenceService,
    @Inject('ITestCaseEmbeddingService')
    private embeddingService: ITestCaseEmbeddingService,
  ) { }

  // ===== CRUD Operations (delegated to CrudService) =====
  async create(createTestCaseDto: CreateTestCaseDto) {
    return this.crudService.create(createTestCaseDto);
  }

  async findAll() {
    return this.crudService.findAll();
  }

  async findOne(id: string) {
    return this.crudService.findOne(id);
  }

  async update(id: string, updateTestCaseDto: UpdateTestCaseDto) {
    return this.crudService.update(id, updateTestCaseDto);
  }

  async remove(id: string): Promise<void> {
    return this.crudService.remove(id);
  }

  // ===== Reference Operations (delegated to ReferenceService) =====
  async getWithReference(id: string) {
    return this.referenceService.getWithReference(id);
  }

  async getDerivedTestCases(id: string) {
    return this.referenceService.getDerivedTestCases(id);
  }

  async getFullDetail(id: string) {
    return this.referenceService.getFullDetail(id);
  }

  async deriveFromTestCase(referenceId: string, createTestCaseDto: CreateTestCaseDto) {
    return this.referenceService.deriveFromTestCase(referenceId, createTestCaseDto);
  }

  async addManualReference(sourceId: string, targetId: string) {
    return this.referenceService.addManualReference(sourceId, targetId);
  }

  async removeReference(referenceId: string) {
    return this.referenceService.removeReference(referenceId);
  }

  // ===== AI Operations (delegated to AIService) =====
  async generateTestCaseWithAI(generateDto: GenerateTestCaseWithAIDto): Promise<AIGeneratedTestCaseResponseDto> {
    return this.aiService.generateTestCaseWithAI(generateDto);
  }

  async generateAndSaveTestCaseWithAI(generateDto: GenerateTestCaseWithAIDto) {
    return this.aiService.generateAndSaveTestCaseWithAI(generateDto);
  }

  // ===== Search Operations (delegated to SearchService) =====
  async search(searchDto: SearchTestCaseDto): Promise<SearchResultDto[]> {
    return this.searchService.search(searchDto);
  }
}