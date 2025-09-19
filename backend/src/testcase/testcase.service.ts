import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
      // Validate reference test case exists if referenceId provided
      if (createTestCaseDto.referenceId) {
        const referenceExists = await this.prisma.testCase.findUnique({
          where: { id: createTestCaseDto.referenceId },
        });
        if (!referenceExists) {
          throw new HttpException('Reference test case not found', HttpStatus.NOT_FOUND);
        }
      }

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
          referenceId: createTestCaseDto.referenceId,
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

    // Get reference test case if exists
    let reference = null;
    if ((testCase as any).referenceId) {
      reference = await this.prisma.testCase.findUnique({
        where: { id: (testCase as any).referenceId },
        select: { id: true, name: true, createdAt: true }
      });
    }

    // Get count of derived test cases
    const derivedCount = await this.prisma.testCase.count({
      where: { referenceId: id } as any
    });

    // Remove embedding from returned test case
    const { embedding: _, ...rest } = testCase;

    return {
      ...rest,
      reference,
      derivedCount
    };
  }

  async getDerivedTestCases(id: string) {
    // Check if test case exists
    const existingTestCase = await this.prisma.testCase.findUnique({ where: { id } });
    if (!existingTestCase) {
      throw new HttpException('Test case not found', HttpStatus.NOT_FOUND);
    }

    const derivedTestCases = await this.prisma.testCase.findMany({
      where: { referenceId: id } as any,
      orderBy: { createdAt: 'desc' }
    });

    // Remove embeddings from returned test cases
    return derivedTestCases.map(({ embedding, ...rest }) => rest);
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
      referenceId: referenceId
    };
    // add generate embedding and create new test case
    const embedding = await this.generateEmbedding(mergedData);
    (mergedData as any).embedding = JSON.stringify(embedding);




    return this.create(mergedData);
  }

  async generateTestCaseWithAI(generateDto: GenerateTestCaseWithAIDto): Promise<AIGeneratedTestCaseResponseDto> {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      throw new HttpException(
        'Gemini API key is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Build the prompt for AI generation
      const systemPrompt = `You are a professional test case designer. Generate a detailed test case based on the user's request.

Your response MUST be a valid JSON object with the following structure:
{
  "name": "string - Clear and descriptive test case name",
  "description": "string - Detailed description of what this test case validates",
  "type": "positive|negative",
  "priority": "low|medium|high",
  "steps": [
    {
      "step": "string - Clear action to perform",
      "expectedResult": "string - Expected outcome of this step"
    }
  ],
  "expectedResult": "string - Final expected result of the entire test",
  "tags": ["string array - relevant tags"],
  "confidence": number between 0-1,
  "aiSuggestions": "string - optional suggestions for improvement"
}

Rules:
1. Generate realistic and practical test cases
2. Include detailed steps that are actionable
3. Use appropriate test case types and priorities
4. Provide relevant tags for categorization
5. Give confidence score based on prompt clarity
6. Response must be valid JSON only, no additional text
7. If user is any using language other than English, the value of json use that language (for example bahasa indonesia)`
        ;

      let userPrompt = `Generate a test case for: ${generateDto.prompt}`;

      if (generateDto.context) {
        userPrompt += `\n\nAdditional context: ${generateDto.context}`;
      }

      if (generateDto.preferredType) {
        userPrompt += `\n\nPreferred type: ${generateDto.preferredType}`;
      }

      if (generateDto.preferredPriority) {
        userPrompt += `\n\nPreferred priority: ${generateDto.preferredPriority}`;
      }

      const result = await model.generateContent([
        { text: systemPrompt },
        { text: userPrompt }
      ]);

      const responseText = result.response.text();

      // Parse the JSON response
      let aiResponse;
      try {
        // Clean up the response text to extract JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in AI response');
        }
        aiResponse = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse AI response:', responseText);
        throw new HttpException(
          'Invalid response from AI service',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Validate and format the response
      const response: AIGeneratedTestCaseResponseDto = {
        name: aiResponse.name || 'Generated Test Case',
        description: aiResponse.description || 'AI generated test case description',
        type: aiResponse.type || 'functional',
        priority: aiResponse.priority || 'medium',
        steps: aiResponse.steps || [
          {
            step: 'Generated step',
            expectedResult: 'Generated expected result'
          }
        ],
        expectedResult: aiResponse.expectedResult || 'Generated final result',
        tags: aiResponse.tags || ['ai-generated'],
        originalPrompt: generateDto.prompt,
        aiGenerated: true,
        confidence: aiResponse.confidence || 0.8,
        aiSuggestions: aiResponse.aiSuggestions
      };

      return response;

    } catch (error) {
      console.error('Gemini AI Error:', error.message);
      throw new HttpException(
        'Failed to generate test case with AI',
        HttpStatus.SERVICE_UNAVAILABLE,
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