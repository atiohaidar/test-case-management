import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestCaseDto } from '../entities/testcase.entity';

export class TestCaseReferenceTargetDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    type: string;

    @ApiProperty()
    priority: string;

    @ApiProperty()
    createdAt: Date;
}

export class TestCaseReferenceDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    targetId: string;

    @ApiProperty({ description: 'Type of reference: manual_reference, rag_retrieval, or derived' })
    referenceType: string;

    @ApiPropertyOptional({ description: 'Similarity score (for RAG references)' })
    similarityScore?: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty({ type: TestCaseReferenceTargetDto })
    target: TestCaseReferenceTargetDto;
}

export class DerivedTestCaseReferenceInfoDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ description: 'Type of reference: manual_reference, rag_retrieval, or derived' })
    referenceType: string;

    @ApiPropertyOptional({ description: 'Similarity score (for RAG references)' })
    similarityScore?: number;

    @ApiProperty()
    createdAt: Date;
}

export class DerivedTestCaseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    type: string;

    @ApiProperty()
    priority: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty({ description: 'Whether this test case was AI-generated' })
    aiGenerated: boolean;

    @ApiProperty({ type: DerivedTestCaseReferenceInfoDto })
    referenceInfo: DerivedTestCaseReferenceInfoDto;
}

export class TestCaseFullDetailDto extends TestCaseDto {
    @ApiProperty({ 
        description: 'All references from this test case (outgoing references)', 
        type: [TestCaseReferenceDto] 
    })
    references: TestCaseReferenceDto[];

    @ApiProperty({ 
        description: 'All test cases that reference this one (incoming references/derived)', 
        type: [DerivedTestCaseDto] 
    })
    derivedTestCases: DerivedTestCaseDto[];

    @ApiProperty({ description: 'Total number of outgoing references' })
    referencesCount: number;

    @ApiProperty({ description: 'Total number of derived test cases' })
    derivedCount: number;
}