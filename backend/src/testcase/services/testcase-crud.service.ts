import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTestCaseDto } from '../dto/create-testcase.dto';
import { UpdateTestCaseDto } from '../dto/update-testcase.dto';
import { BusinessException, ExternalServiceException } from '../../common/exceptions';
import { TestCaseCreationResult } from '../dto/bulk-create-testcase.dto';

@Injectable()
export class TestCaseCrudService {
    constructor(private prisma: PrismaService) { }

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
                    aiGenerationMethod: createTestCaseDto.aiGenerationMethod,
                    tokenUsage: createTestCaseDto.tokenUsage,
                } as any,
            });

            // Remove embedding from returned test case
            const { embedding: _, ...rest } = testCase;
            return rest;
        } catch (error) {
            throw new BusinessException(
                'Failed to create test case',
                HttpStatus.INTERNAL_SERVER_ERROR,
                'TESTCASE_CREATE_FAILED'
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
            throw new BusinessException(
                'Test case not found',
                HttpStatus.NOT_FOUND,
                'TESTCASE_NOT_FOUND'
            );
        }
        // Remove embedding from returned test case
        const { embedding, ...rest } = testCase;
        return rest;
    }

    async update(id: string, updateTestCaseDto: UpdateTestCaseDto, embedding?: string) {
        // Check if test case exists
        const existingTestCase = await this.prisma.testCase.findUnique({ where: { id } });
        if (!existingTestCase) {
            throw new BusinessException(
                'Test case not found',
                HttpStatus.NOT_FOUND,
                'TESTCASE_NOT_FOUND'
            );
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
            throw new BusinessException(
                'Failed to update test case',
                HttpStatus.INTERNAL_SERVER_ERROR,
                'TESTCASE_UPDATE_FAILED'
            );
        }
    }

    async remove(id: string): Promise<void> {
        // Check if test case exists
        const existingTestCase = await this.prisma.testCase.findUnique({ where: { id } });
        if (!existingTestCase) {
            throw new BusinessException(
                'Test case not found',
                HttpStatus.NOT_FOUND,
                'TESTCASE_NOT_FOUND'
            );
        }

        await this.prisma.testCase.delete({ where: { id } });
    }

    async exists(id: string): Promise<boolean> {
        const testCase = await this.prisma.testCase.findUnique({ where: { id } });
        return !!testCase;
    }

    async bulkCreate(
        testCases: Array<{ dto: CreateTestCaseDto; embedding?: string }>,
    ): Promise<TestCaseCreationResult[]> {
        const results: TestCaseCreationResult[] = [];

        for (let i = 0; i < testCases.length; i++) {
            const { dto, embedding } = testCases[i];
            try {
                const testCase = await this.prisma.testCase.create({
                    data: {
                        name: dto.name,
                        description: dto.description,
                        type: dto.type,
                        priority: dto.priority,
                        steps: dto.steps as any,
                        expectedResult: dto.expectedResult,
                        tags: dto.tags as any,
                        embedding: embedding || JSON.stringify([]),
                        // AI metadata fields
                        aiGenerated: dto.aiGenerated || false,
                        originalPrompt: dto.originalPrompt,
                        aiConfidence: dto.aiConfidence,
                        aiSuggestions: dto.aiSuggestions,
                        aiGenerationMethod: dto.aiGenerationMethod,
                        tokenUsage: dto.tokenUsage,
                    } as any,
                });

                // Remove embedding from returned test case
                const { embedding: _, ...rest } = testCase;
                results.push({
                    success: true,
                    data: rest,
                    index: i,
                });
            } catch (error) {
                results.push({
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to create test case',
                    index: i,
                });
            }
        }

        return results;
    }
}