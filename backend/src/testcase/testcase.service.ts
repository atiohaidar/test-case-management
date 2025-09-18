import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestCaseDto } from './dto/create-testcase.dto';
import { UpdateTestCaseDto } from './dto/update-testcase.dto';
import { SearchTestCaseDto, SearchResultDto } from './dto/search-testcase.dto';

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
        },
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
        },
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