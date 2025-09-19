import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestCaseDto } from '../entities/testcase.entity';

export class TestCaseReferenceDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    createdAt: Date;
}

export class TestCaseWithReferenceDto extends TestCaseDto {
    @ApiPropertyOptional({ description: 'Reference test case information', type: TestCaseReferenceDto })
    reference?: TestCaseReferenceDto;

    @ApiProperty({ description: 'Number of test cases derived from this test case' })
    derivedCount: number;
}