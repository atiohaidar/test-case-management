import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTestCaseDto } from './create-testcase.dto';

export class BulkCreateTestCaseDto {
  @ApiProperty({ 
    type: [CreateTestCaseDto],
    description: 'Array of test cases to create'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestCaseDto)
  testCases: CreateTestCaseDto[];
}

export class TestCaseCreationResult {
  @ApiProperty({ description: 'Whether the test case was created successfully' })
  success: boolean;

  @ApiProperty({ description: 'The created test case data', required: false })
  data?: any;

  @ApiProperty({ description: 'Error message if creation failed', required: false })
  error?: string;

  @ApiProperty({ description: 'Index of the test case in the input array' })
  index: number;
}

export class BulkCreateTestCaseResponseDto {
  @ApiProperty({ 
    type: [TestCaseCreationResult],
    description: 'Results for each test case creation attempt'
  })
  results: TestCaseCreationResult[];

  @ApiProperty({ description: 'Total number of test cases in the request' })
  total: number;

  @ApiProperty({ description: 'Number of successfully created test cases' })
  successCount: number;

  @ApiProperty({ description: 'Number of failed test case creations' })
  failureCount: number;
}
