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

    // Create the test case
    const testCase = await this.crudService.create(createTestCaseDto, JSON.stringify(embedding));

    // Handle reference creation if specified (for semantic search)
    if (createTestCaseDto.referenceTo && createTestCaseDto.referenceType) {
      await this.referenceService.createReference(
        testCase.id,
        createTestCaseDto.referenceTo,
        createTestCaseDto.referenceType,
        createTestCaseDto.ragReferences
      );
    }

    // Handle RAG references if provided (for AI-generated test cases with RAG)
    if (createTestCaseDto.ragReferences && createTestCaseDto.ragReferences.length > 0) {
      await this.referenceService.createRAGReferences(testCase.id, createTestCaseDto.ragReferences);
    }

    return testCase;
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

  // Bulk Operations
  async bulkCreate(testCaseDtos: CreateTestCaseDto[]) {
    // Prepare test cases with embeddings
    const testCasesWithEmbeddings = await Promise.all(
      testCaseDtos.map(async (dto) => {
        try {
          const embedding = await this.embeddingService.generateEmbedding(dto);
          return { dto, embedding: JSON.stringify(embedding) };
        } catch (error) {
          // If embedding generation fails, proceed with empty embedding
          return { dto, embedding: JSON.stringify([]) };
        }
      }),
    );

    // Create test cases using CRUD service with best-effort strategy
    const results = await this.crudService.bulkCreate(testCasesWithEmbeddings);

    // Handle references for successfully created test cases
    for (const result of results) {
      if (result.success && result.data) {
        const dto = testCaseDtos[result.index];
        
        try {
          // Handle reference creation if specified (for semantic search)
          if (dto.referenceTo && dto.referenceType) {
            await this.referenceService.createReference(
              result.data.id,
              dto.referenceTo,
              dto.referenceType,
              dto.ragReferences,
            );
          }

          // Handle RAG references if provided (for AI-generated test cases with RAG)
          if (dto.ragReferences && dto.ragReferences.length > 0) {
            await this.referenceService.createRAGReferences(
              result.data.id,
              dto.ragReferences,
            );
          }
        } catch (error) {
          // If reference creation fails, log but don't fail the entire operation
          // The test case is already created
        }
      }
    }

    // Calculate statistics
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return {
      results,
      total: results.length,
      successCount,
      failureCount,
    };
  }
}