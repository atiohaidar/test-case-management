import { IsString, IsEnum, IsArray, IsNotEmpty, ValidateNested, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
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

  // AI Generation Metadata (Optional fields for when saving AI-generated test cases)
  @ApiPropertyOptional({ description: 'Indicates if this test case was generated with AI assistance' })
  @IsBoolean()
  @IsOptional()
  aiGenerated?: boolean;

  @ApiPropertyOptional({ description: 'Original prompt used for AI generation' })
  @IsString()
  @IsOptional()
  originalPrompt?: string;

  @ApiPropertyOptional({ description: 'AI confidence score (0-1)', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  aiConfidence?: number;

  @ApiPropertyOptional({ description: 'AI suggestions for improvement' })
  @IsString()
  @IsOptional()
  aiSuggestions?: string;
}