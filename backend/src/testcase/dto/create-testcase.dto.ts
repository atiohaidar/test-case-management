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

class RAGReferenceDto {
  @ApiProperty({ description: 'ID test case yang dijadikan referensi' })
  @IsString()
  @IsNotEmpty()
  testCaseId: string;

  @ApiProperty({ description: 'Similarity score dengan prompt (0-1)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  similarity: number;

  @ApiPropertyOptional({ description: 'Full test case object (optional, for AI responses)' })
  @IsOptional()
  testCase?: any;
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

  @ApiPropertyOptional({ description: 'Token usage from Gemini AI' })
  @IsOptional()
  tokenUsage?: any;

  // Reference Management (for semantic search -> edit -> save flow)
  @ApiPropertyOptional({ description: 'ID test case yang dijadikan referensi (untuk semantic search flow)' })
  @IsString()
  @IsOptional()
  referenceTo?: string;

  @ApiPropertyOptional({
    description: 'Tipe reference',
    enum: ['manual', 'rag_retrieval', 'semantic_search']
  })
  @IsEnum(['manual', 'rag_retrieval', 'semantic_search'])
  @IsOptional()
  referenceType?: 'manual' | 'rag_retrieval' | 'semantic_search';

  @ApiPropertyOptional({
    description: 'Metode AI generation yang digunakan',
    enum: ['pure_ai', 'rag']
  })
  @IsEnum(['pure_ai', 'rag'])
  @IsOptional()
  aiGenerationMethod?: string;

  @ApiPropertyOptional({
    type: [RAGReferenceDto],
    description: 'Referensi test case yang digunakan dalam RAG (jika ada)'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RAGReferenceDto)
  @IsOptional()
  ragReferences?: RAGReferenceDto[];
}