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
  createdAt: Date;
  updatedAt: Date;
}