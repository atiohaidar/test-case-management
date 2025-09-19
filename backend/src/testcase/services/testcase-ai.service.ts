import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { GenerateTestCaseWithAIDto, AIGeneratedTestCaseResponseDto } from '../dto/generate-testcase-ai.dto';
import { ITestCaseAIService, ITestCaseEmbeddingService } from './interfaces';

@Injectable()
export class TestCaseAIService implements ITestCaseAIService {
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  constructor(
    private prisma: PrismaService,
    @Inject('ITestCaseEmbeddingService')
    private embeddingService: ITestCaseEmbeddingService,
  ) { }

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

      return response.data;
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
      const embedding = await this.embeddingService.generateEmbedding(createData);
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
}