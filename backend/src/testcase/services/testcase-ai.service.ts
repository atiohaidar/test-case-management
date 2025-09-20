import { Injectable, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { GenerateTestCaseWithAIDto, AIGeneratedTestCaseResponseDto } from '../dto/generate-testcase-ai.dto';
import { SearchTestCaseDto, SearchResultDto } from '../dto/search-testcase.dto';
import { ExternalServiceException } from '../../common/exceptions';

@Injectable()
export class TestCaseAIService {
    private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

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
                throw new ExternalServiceException(
                    'AI Service',
                    error,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            console.error('AI Service Error:', error.message);
            throw new ExternalServiceException(
                'AI Service',
                error
            );
        }
    }

    async generateAndSaveTestCaseWithAI(
        generateDto: GenerateTestCaseWithAIDto,
        crudService: any,
        referenceService: any,
        embeddingService: any
    ) {
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
                tokenUsage: aiResponse.tokenUsage || null,
            };

            // Generate embedding untuk test case yang baru
            const embedding = await embeddingService.generateEmbedding(createData);
            const embeddingJson = JSON.stringify(embedding);

            // Simpan test case ke database
            const testCase = await crudService.create(createData, embeddingJson);

            // Simpan referensi RAG jika ada
            await referenceService.createRAGReferences(testCase.id, aiResponse.ragReferences);

            // Include references in response
            const references = await referenceService.getReferencesForTestCase(testCase.id);

            return {
                ...testCase,
                aiGenerationMethod: aiResponse.aiGenerationMethod,
                tokenUsage: aiResponse.tokenUsage || null,
                ragReferences: references
            };

        } catch (error) {
            if (error instanceof Error && error.message.includes('Gemini API key')) {
                throw error;
            }

            console.error('Generate and save error:', error.message);
            throw new ExternalServiceException(
                'AI Service',
                error,
                HttpStatus.INTERNAL_SERVER_ERROR
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
            throw new ExternalServiceException(
                'AI Service',
                error
            );
        }
    }
}