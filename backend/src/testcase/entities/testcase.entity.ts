import { ApiProperty } from '@nestjs/swagger';

export enum TestCaseType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
}

export enum TestCasePriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface TestStep {
  step: string;
  expectedResult: string;
}

// DTO classes for Swagger documentation
export class TestCaseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: TestCaseType })
  type: TestCaseType;

  @ApiProperty({ enum: TestCasePriority })
  priority: TestCasePriority;

  @ApiProperty({ type: 'object', isArray: true })
  steps: TestStep[];

  @ApiProperty()
  expectedResult: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ required: false })
  referenceId?: string;

  @ApiProperty({ required: false, description: 'Whether this test case was AI-generated' })
  aiGenerated?: boolean;

  @ApiProperty({ required: false, description: 'Original prompt used for AI generation' })
  originalPrompt?: string;

  @ApiProperty({ required: false, description: 'AI confidence score (0-1)' })
  aiConfidence?: number;

  @ApiProperty({ required: false, description: 'AI suggestions for improvement' })
  aiSuggestions?: string;

  @ApiProperty({ required: false, description: 'AI generation method' })
  aiGenerationMethod?: string;

  @ApiProperty({ required: false, description: 'Token usage from Gemini AI' })
  tokenUsage?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// This interface mirrors the Prisma TestCase model for API documentation
export interface TestCase {
  id: string;
  name: string;
  description: string;
  type: TestCaseType;
  priority: TestCasePriority;
  steps: TestStep[];
  expectedResult: string;
  tags: string[];
  embedding?: string;
  referenceId?: string;
  createdAt: Date;
  updatedAt: Date;
}