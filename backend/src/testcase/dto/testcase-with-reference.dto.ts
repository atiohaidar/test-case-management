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

export class TestCaseWithReferenceDto extends TestCaseDto {
    @ApiProperty({ description: 'All references from this test case', type: [TestCaseReferenceDto] })
    references: TestCaseReferenceDto[];

    @ApiProperty({ description: 'Number of test cases derived from this test case' })
    derivedCount: number;
}