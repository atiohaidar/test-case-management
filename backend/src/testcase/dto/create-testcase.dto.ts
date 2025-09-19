import { IsString, IsEnum, IsArray, IsNotEmpty, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestCaseType, TestCasePriority, TestStep } from '../entities/testcase.entity';

class TestStepDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  step: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expectedResult: string;
}

export class CreateTestCaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: TestCaseType })
  @IsEnum(TestCaseType)
  type: TestCaseType;

  @ApiProperty({ enum: TestCasePriority })
  @IsEnum(TestCasePriority)
  priority: TestCasePriority;

  @ApiProperty({ type: [TestStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestStepDto)
  steps: TestStep[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expectedResult: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiPropertyOptional({ description: 'ID of test case used as reference for creating this test case' })
  @IsString()
  @IsOptional()
  referenceId?: string;
}