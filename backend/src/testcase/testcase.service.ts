import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestCaseDto } from './dto/create-testcase.dto';
import { UpdateTestCaseDto } from './dto/update-testcase.dto';
import { SearchTestCaseDto, SearchResultDto } from './dto/search-testcase.dto';
import { GenerateTestCaseWithAIDto, AIGeneratedTestCaseResponseDto } from './dto/generate-testcase-ai.dto';

@Injectable()
export class TestCaseService {
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  constructor(
    private prisma: PrismaService,
  ) { }

  async create(createTestCaseDto: CreateTestCaseDto) {
    try {
      // Generate embedding for the test case
      const embedding = await this.generateEmbedding(createTestCaseDto);

      const testCase = await this.prisma.testCase.create({
        data: {
          name: createTestCaseDto.name,
          description: createTestCaseDto.description,
          type: createTestCaseDto.type,
          priority: createTestCaseDto.priority,
          steps: createTestCaseDto.steps as any,
          expectedResult: createTestCaseDto.expectedResult,
          tags: createTestCaseDto.tags as any,
          embedding: JSON.stringify(embedding),
          // AI metadata fields
          aiGenerated: createTestCaseDto.aiGenerated || false,
          originalPrompt: createTestCaseDto.originalPrompt,
          aiConfidence: createTestCaseDto.aiConfidence,
          aiSuggestions: createTestCaseDto.aiSuggestions,
        } as any,
      });

      // Remove embedding from returned test case
      const { embedding: _, ...rest } = testCase;
      return rest;
    } catch (error) {
      throw new HttpException(
        'Failed to create test case',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const testCases = await this.prisma.testCase.findMany({
      orderBy: { createdAt: 'desc' },
    });
    // Remove embedding from each test case
    return testCases.map(({ embedding, ...rest }) => rest);
  }

  async findOne(id: string) {
    const testCase = await this.prisma.testCase.findUnique({ where: { id } });
    if (!testCase) {
      throw new HttpException('Test case not found', HttpStatus.NOT_FOUND);
    }
    // Remove embedding from returned test case
    const { embedding, ...rest } = testCase;
    return rest;
  }

  async update(id: string, updateTestCaseDto: UpdateTestCaseDto) {
    // Check if test case exists
    const existingTestCase = await this.prisma.testCase.findUnique({ where: { id } });
    if (!existingTestCase) {
      throw new HttpException('Test case not found', HttpStatus.NOT_FOUND);
    }

    try {
      // Generate new embedding if content changed
      const embedding = await this.generateEmbedding(updateTestCaseDto);

      const updatedTestCase = await this.prisma.testCase.update({
        where: { id },
        data: {
          ...(updateTestCaseDto.name && { name: updateTestCaseDto.name }),
          ...(updateTestCaseDto.description && { description: updateTestCaseDto.description }),
          ...(updateTestCaseDto.type && { type: updateTestCaseDto.type }),
          ...(updateTestCaseDto.priority && { priority: updateTestCaseDto.priority }),
          ...(updateTestCaseDto.steps && { steps: updateTestCaseDto.steps as any }),
          ...(updateTestCaseDto.expectedResult && { expectedResult: updateTestCaseDto.expectedResult }),
          ...(updateTestCaseDto.tags && { tags: updateTestCaseDto.tags as any }),
          embedding: JSON.stringify(embedding),
        } as any,
      });

      // Remove embedding from returned test case
      const { embedding: _, ...rest } = updatedTestCase;
      return rest;
    } catch (error) {
      throw new HttpException(
        'Failed to update test case',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<void> {
    // Check if test case exists
    const existingTestCase = await this.prisma.testCase.findUnique({ where: { id } });
    if (!existingTestCase) {
      throw new HttpException('Test case not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.testCase.delete({ where: { id } });
  }

  async getWithReference(id: string) {
    const testCase = await this.prisma.testCase.findUnique({ where: { id } });
    if (!testCase) {
      throw new HttpException('Test case not found', HttpStatus.NOT_FOUND);
    }

    // Get all references where this test case is the source
    const references = await this.prisma.testCaseReference.findMany({
      where: { sourceId: id },
      include: {
        target: {
          select: { id: true, name: true, type: true, priority: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get count of derived test cases (where this test case is the target)
    const derivedCount = await this.prisma.testCaseReference.count({
      where: {
        targetId: id,
        referenceType: { in: ['manual_reference', 'derived', 'rag_retrieval'] }
      }
    });

    // Remove embedding from returned test case
    const { embedding: _, ...rest } = testCase;

    return {
      ...rest,
      references: references.map(ref => ({
        id: ref.id,
        targetId: ref.targetId,
        referenceType: ref.referenceType,
        similarityScore: ref.similarityScore,
        createdAt: ref.createdAt,
        target: ref.target
      })),
      derivedCount
    };
  }

  async getDerivedTestCases(id: string) {
    // Check if test case exists
    const existingTestCase = await this.prisma.testCase.findUnique({ where: { id } });
    if (!existingTestCase) {
      throw new HttpException('Test case not found', HttpStatus.NOT_FOUND);
    }

    // Get all test cases that reference this one as derived or manual reference
    const derivedReferences = await this.prisma.testCaseReference.findMany({
      where: {
        targetId: id,
        referenceType: { in: ['manual_reference', 'derived', 'rag_retrieval'] }
      },
      include: {
        source: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Remove embeddings from returned test cases and include reference metadata
    return derivedReferences.map(ref => {
      const { embedding, ...testCase } = ref.source;
      return {
        ...testCase,
        referenceInfo: {
          id: ref.id,
          referenceType: ref.referenceType,
          similarityScore: ref.similarityScore,
          createdAt: ref.createdAt
        }
      };
    });
  }

  async getFullDetail(id: string) {
    // Check if test case exists
    const testCase = await this.prisma.testCase.findUnique({ where: { id } });
    if (!testCase) {
      throw new HttpException('Test case not found', HttpStatus.NOT_FOUND);
    }

    // Get all references where this test case is the source (outgoing references)
    const references = await this.prisma.testCaseReference.findMany({
      where: { sourceId: id },
      include: {
        target: {
          select: { id: true, name: true, type: true, priority: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get all test cases that reference this one (incoming references/derived)
    const derivedReferences = await this.prisma.testCaseReference.findMany({
      where: {
        targetId: id,
        referenceType: { in: ['manual_reference', 'derived', 'rag_retrieval'] }
      },
      include: {
        source: {
          select: { id: true, name: true, type: true, priority: true, createdAt: true, aiGenerated: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Remove embedding from returned test case
    const { embedding: _, ...rest } = testCase;

    return {
      ...rest,
      // Outgoing references (test cases this one refers to)
      references: references.map(ref => ({
        id: ref.id,
        targetId: ref.targetId,
        referenceType: ref.referenceType,
        similarityScore: ref.similarityScore,
        createdAt: ref.createdAt,
        target: ref.target
      })),
      // Incoming references (test cases that refer to this one)
      derivedTestCases: derivedReferences.map(ref => ({
        id: ref.source.id,
        name: ref.source.name,
        type: ref.source.type,
        priority: ref.source.priority,
        createdAt: ref.source.createdAt,
        aiGenerated: ref.source.aiGenerated,
        referenceInfo: {
          id: ref.id,
          referenceType: ref.referenceType,
          similarityScore: ref.similarityScore,
          createdAt: ref.createdAt
        }
      })),
      // Summary counts
      referencesCount: references.length,
      derivedCount: derivedReferences.length,
    };
  }

  async deriveFromTestCase(referenceId: string, createTestCaseDto: CreateTestCaseDto) {
    // Get reference test case
    const referenceTestCase = await this.prisma.testCase.findUnique({
      where: { id: referenceId }
    });

    if (!referenceTestCase) {
      throw new HttpException('Reference test case not found', HttpStatus.NOT_FOUND);
    }

    // Merge reference data with new data (new data takes priority)
    const mergedData: CreateTestCaseDto = {
      name: createTestCaseDto.name || referenceTestCase.name,
      description: createTestCaseDto.description || referenceTestCase.description,
      type: createTestCaseDto.type || (referenceTestCase.type as any),
      priority: createTestCaseDto.priority || (referenceTestCase.priority as any),
      steps: createTestCaseDto.steps || (referenceTestCase.steps as any),
      expectedResult: createTestCaseDto.expectedResult || referenceTestCase.expectedResult,
      tags: createTestCaseDto.tags || (referenceTestCase.tags as any),
    };

    // Create the new test case
    const newTestCase = await this.create(mergedData);

    // Create reference relationship
    await this.prisma.testCaseReference.create({
      data: {
        sourceId: newTestCase.id,
        targetId: referenceId,
        referenceType: 'derived',
        similarityScore: null, // No similarity score for manual derivation
      },
    });

    return newTestCase;
  }

  async addManualReference(sourceId: string, targetId: string) {
    // Validate both test cases exist
    const [sourceTestCase, targetTestCase] = await Promise.all([
      this.prisma.testCase.findUnique({ where: { id: sourceId } }),
      this.prisma.testCase.findUnique({ where: { id: targetId } })
    ]);

    if (!sourceTestCase) {
      throw new HttpException('Source test case not found', HttpStatus.NOT_FOUND);
    }
    if (!targetTestCase) {
      throw new HttpException('Target test case not found', HttpStatus.NOT_FOUND);
    }

    // Check if reference already exists
    const existingReference = await this.prisma.testCaseReference.findFirst({
      where: {
        sourceId,
        targetId,
        referenceType: 'manual_reference'
      }
    });

    if (existingReference) {
      throw new HttpException('Reference already exists', HttpStatus.CONFLICT);
    }

    // Create reference relationship
    const reference = await this.prisma.testCaseReference.create({
      data: {
        sourceId,
        targetId,
        referenceType: 'manual_reference',
        similarityScore: null,
      },
    });

    return reference;
  }

  async removeReference(referenceId: string) {
    const reference = await this.prisma.testCaseReference.findUnique({
      where: { id: referenceId }
    });

    if (!reference) {
      throw new HttpException('Reference not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.testCaseReference.delete({
      where: { id: referenceId }
    });

    return { message: 'Reference removed successfully' };
  }

  async generateTestCaseWithAI(generateDto: GenerateTestCaseWithAIDto): Promise<AIGeneratedTestCaseResponseDto> {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/generate-test-case`, {
        prompt: generateDto.prompt,
        context: generateDto.context,
        preferredType: generateDto.preferredType,
        preferredPriority: generateDto.preferredPriority,
        useRAG: generateDto.useRAG ?? true,
        ragSimilarityThreshold: generateDto.ragSimilarityThreshold ?? 0.7,
        maxRAGReferences: generateDto.maxRAGReferences ?? 3,
      });

      // Return response with token usage information included
      return {
        ...response.data,
        tokenUsage: response.data.tokenUsage || null
      };
    } catch (error) {
      if (error.response?.status === 500 && error.response?.data?.detail?.includes('not configured')) {
        throw new HttpException(
          'Gemini API key is not configured',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      console.error('AI Service Error:', error.message);
      throw new HttpException(
        'Failed to generate test case with AI',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async generateAndSaveTestCaseWithAI(generateDto: GenerateTestCaseWithAIDto) {
    try {
      // Generate test case dengan AI service
      const aiResponse = await this.generateTestCaseWithAI(generateDto);

      // Prepare data untuk Prisma create
      const createData = {
        name: aiResponse.name,
        description: aiResponse.description,
        type: aiResponse.type as any,
        priority: aiResponse.priority as any,
        steps: aiResponse.steps as any,
        expectedResult: aiResponse.expectedResult,
        tags: aiResponse.tags as any,
        aiGenerated: true,
        originalPrompt: aiResponse.originalPrompt,
        aiConfidence: aiResponse.confidence,
        aiSuggestions: aiResponse.aiSuggestions,
        aiGenerationMethod: aiResponse.aiGenerationMethod,
      };

      // Generate embedding untuk test case yang baru
      const embedding = await this.generateEmbedding(createData);
      (createData as any).embedding = JSON.stringify(embedding);

      // Simpan test case ke database
      const testCase = await this.prisma.testCase.create({
        data: createData as any,
      });

      // Simpan referensi RAG jika ada
      if (aiResponse.ragReferences && aiResponse.ragReferences.length > 0) {
        const referencePromises = aiResponse.ragReferences.map(ref =>
          this.prisma.testCaseReference.create({
            data: {
              sourceId: testCase.id,
              targetId: ref.testCaseId,
              similarityScore: ref.similarity,
              referenceType: 'rag_retrieval',
            },
          })
        );

        await Promise.all(referencePromises);
      }

      // Return test case tanpa embedding
      const { embedding: _, ...rest } = testCase;

      // Include references in response
      const references = await this.prisma.testCaseReference.findMany({
        where: { sourceId: testCase.id },
        include: {
          target: {
            select: { id: true, name: true, type: true, priority: true }
          }
        }
      });

      return {
        ...rest,
        aiGenerationMethod: aiResponse.aiGenerationMethod,
        tokenUsage: aiResponse.tokenUsage || null,
        ragReferences: references.map(ref => ({
          id: ref.id,
          targetId: ref.targetId,
          similarityScore: ref.similarityScore,
          referenceType: ref.referenceType,
          target: ref.target
        }))
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Generate and save error:', error.message);
      throw new HttpException(
        'Failed to generate and save test case',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async search(searchDto: SearchTestCaseDto): Promise<SearchResultDto[]> {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/search`, {
        query: searchDto.query,
        min_similarity: searchDto.minSimilarity || 0.7,
        limit: searchDto.limit || 10,
      });

      return response.data;
    } catch (error) {
      console.error('AI Service Error:', error.message);
      throw new HttpException(
        'Failed to perform semantic search',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private async generateEmbedding(testCaseData: any): Promise<number[]> {
    try {
      // Combine all text fields for embedding
      const text = [
        testCaseData.name,
        testCaseData.description,
        // testCaseData.expectedResult,
        // testCaseData.steps?.map(step => `${step.step} -> ${step.expectedResult}`).join(' '),
        testCaseData.tags?.join(' '),
      ].filter(Boolean).join(' ');

      const response = await axios.post(`${this.aiServiceUrl}/generate-embedding`, {
        text: text,
      });

      return response.data.embedding;
    } catch (error) {
      console.error('Embedding generation error:', error.message);
      // Return empty array if embedding fails
      return [];
    }
  }
}