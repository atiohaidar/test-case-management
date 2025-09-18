import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { TestCase } from './entities/testcase.entity';
import { CreateTestCaseDto } from './dto/create-testcase.dto';
import { UpdateTestCaseDto } from './dto/update-testcase.dto';
import { SearchTestCaseDto, SearchResultDto } from './dto/search-testcase.dto';

@Injectable()
export class TestCaseService {
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  constructor(
    @InjectRepository(TestCase)
    private testCaseRepository: Repository<TestCase>,
  ) { }

  async create(createTestCaseDto: CreateTestCaseDto): Promise<TestCase> {
    try {
      // Generate embedding for the test case
      const embedding = await this.generateEmbedding(createTestCaseDto);

      const testCase = this.testCaseRepository.create({
        ...createTestCaseDto,
        embedding: JSON.stringify(embedding),
      });

      return await this.testCaseRepository.save(testCase);
    } catch (error) {
      throw new HttpException(
        'Failed to create test case',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<TestCase[]> {
    const testCases = await this.testCaseRepository.find({
      order: { createdAt: 'DESC' },
    });
    // Remove embedding from each test case
    return testCases.map(({ embedding, ...rest }) => rest);
  }

  async findOne(id: string): Promise<TestCase> {
    const testCase = await this.testCaseRepository.findOne({ where: { id } });
    if (!testCase) {
      throw new HttpException('Test case not found', HttpStatus.NOT_FOUND);
    }
    // Remove embedding from returned test case
    const { embedding, ...rest } = testCase;
    return rest;
  }

  async update(id: string, updateTestCaseDto: UpdateTestCaseDto): Promise<TestCase> {
    const testCase = await this.findOne(id);

    try {
      // Generate new embedding if content changed
      const embedding = await this.generateEmbedding(updateTestCaseDto);

      Object.assign(testCase, updateTestCaseDto, {
        embedding: JSON.stringify(embedding),
      });

      return await this.testCaseRepository.save(testCase);
    } catch (error) {
      throw new HttpException(
        'Failed to update test case',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<void> {
    const testCase = await this.findOne(id);
    await this.testCaseRepository.remove(testCase);
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