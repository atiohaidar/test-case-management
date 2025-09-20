import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTestCaseDto } from '../dto/create-testcase.dto';
import { UpdateTestCaseDto } from '../dto/update-testcase.dto';

@Injectable()
export class TestCaseCrudService {
  constructor(private prisma: PrismaService) {}

  async create(createTestCaseDto: CreateTestCaseDto, embedding?: string) {
    try {
      const testCase = await this.prisma.testCase.create({
        data: {
          name: createTestCaseDto.name,
          description: createTestCaseDto.description,
          type: createTestCaseDto.type,
          priority: createTestCaseDto.priority,
          steps: createTestCaseDto.steps as any,
          expectedResult: createTestCaseDto.expectedResult,
          tags: createTestCaseDto.tags as any,
          embedding: embedding || JSON.stringify([]),
          // AI metadata fields
          aiGenerated: createTestCaseDto.aiGenerated || false,
          originalPrompt: createTestCaseDto.originalPrompt,
          aiConfidence: createTestCaseDto.aiConfidence,
          aiSuggestions: createTestCaseDto.aiSuggestions,
          tokenUsage: createTestCaseDto.tokenUsage,
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

  async update(id: string, updateTestCaseDto: UpdateTestCaseDto, embedding?: string) {
    // Check if test case exists
    const existingTestCase = await this.prisma.testCase.findUnique({ where: { id } });
    if (!existingTestCase) {
      throw new HttpException('Test case not found', HttpStatus.NOT_FOUND);
    }

    try {
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
          ...(updateTestCaseDto.tokenUsage !== undefined && { tokenUsage: updateTestCaseDto.tokenUsage }),
          ...(embedding && { embedding }),
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

  async exists(id: string): Promise<boolean> {
    const testCase = await this.prisma.testCase.findUnique({ where: { id } });
    return !!testCase;
  }
}