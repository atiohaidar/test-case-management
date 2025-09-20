import { Injectable } from '@nestjs/common';
import { TestCaseCrudService } from './services/testcase-crud.service';
import { TestCaseReferenceService } from './services/testcase-reference.service';
import { TestCaseAIService } from './services/testcase-ai.service';
import { TestCaseEmbeddingService } from './services/testcase-embedding.service';
import { CreateTestCaseDto } from './dto/create-testcase.dto';
import { UpdateTestCaseDto } from './dto/update-testcase.dto';
import { SearchTestCaseDto, SearchResultDto } from './dto/search-testcase.dto';
import { GenerateTestCaseWithAIDto, AIGeneratedTestCaseResponseDto } from './dto/generate-testcase-ai.dto';

@Injectable()
export class TestCaseService {
  constructor(
    private crudService: TestCaseCrudService,
    private referenceService: TestCaseReferenceService,
    private aiService: TestCaseAIService,
    private embeddingService: TestCaseEmbeddingService,
  ) { }

  // CRUD Operations
  async create(createTestCaseDto: CreateTestCaseDto) {
    // Generate embedding for the test case
    const embedding = await this.embeddingService.generateEmbedding(createTestCaseDto);
    return this.crudService.create(createTestCaseDto, JSON.stringify(embedding));
  }

  async findAll() {
    return this.crudService.findAll();
  }

  async findOne(id: string) {
    return this.crudService.findOne(id);
  }

  async update(id: string, updateTestCaseDto: UpdateTestCaseDto) {
    // Generate new embedding if content changed
    const embedding = await this.embeddingService.generateEmbedding(updateTestCaseDto);
    return this.crudService.update(id, updateTestCaseDto, JSON.stringify(embedding));
  }

  async remove(id: string): Promise<void> {
    return this.crudService.remove(id);
  }

  // Reference Operations
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
    return this.referenceService.deriveFromTestCase(referenceId, createTestCaseDto, this.crudService);
  }

  async addManualReference(sourceId: string, targetId: string) {
    return this.referenceService.addManualReference(sourceId, targetId);
  }

  async removeReference(referenceId: string) {
    return this.referenceService.removeReference(referenceId);
  }

  // AI Operations
  async generateTestCaseWithAI(generateDto: GenerateTestCaseWithAIDto): Promise<AIGeneratedTestCaseResponseDto> {
    return this.aiService.generateTestCaseWithAI(generateDto);
  }

  async generateAndSaveTestCaseWithAI(generateDto: GenerateTestCaseWithAIDto) {
    return this.aiService.generateAndSaveTestCaseWithAI(
      generateDto,
      this.crudService,
      this.referenceService,
      this.embeddingService
    );
  }

  async search(searchDto: SearchTestCaseDto): Promise<SearchResultDto[]> {
    return this.aiService.search(searchDto);
  }
}