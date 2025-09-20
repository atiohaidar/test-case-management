import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTestCaseDto } from '../dto/create-testcase.dto';

@Injectable()
export class TestCaseReferenceService {
  constructor(private prisma: PrismaService) {}

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

  async deriveFromTestCase(referenceId: string, createTestCaseDto: CreateTestCaseDto, crudService: any) {
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
    const newTestCase = await crudService.create(mergedData);

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

  async createRAGReferences(sourceId: string, ragReferences: any[]) {
    if (!ragReferences || ragReferences.length === 0) {
      return [];
    }

    const referencePromises = ragReferences.map(ref =>
      this.prisma.testCaseReference.create({
        data: {
          sourceId,
          targetId: ref.testCaseId,
          similarityScore: ref.similarity,
          referenceType: 'rag_retrieval',
        },
      })
    );

    return await Promise.all(referencePromises);
  }

  async getReferencesForTestCase(sourceId: string) {
    const references = await this.prisma.testCaseReference.findMany({
      where: { sourceId },
      include: {
        target: {
          select: { id: true, name: true, type: true, priority: true }
        }
      }
    });

    return references.map(ref => ({
      id: ref.id,
      targetId: ref.targetId,
      similarityScore: ref.similarityScore,
      referenceType: ref.referenceType,
      target: ref.target
    }));
  }
}