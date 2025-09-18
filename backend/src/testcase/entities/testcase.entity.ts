import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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

@Entity('testcases')
export class TestCase {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('text')
  description: string;

  @ApiProperty({ enum: TestCaseType })
  @Column({
    type: 'enum',
    enum: TestCaseType,
  })
  type: TestCaseType;

  @ApiProperty({ enum: TestCasePriority })
  @Column({
    type: 'enum',
    enum: TestCasePriority,
  })
  priority: TestCasePriority;

  @ApiProperty({ type: 'object', isArray: true })
  @Column('json')
  steps: TestStep[];

  @ApiProperty()
  @Column('text')
  expectedResult: string;

  @ApiProperty({ type: [String] })
  @Column('json')
  tags: string[];

  @ApiProperty()
  @Column('text', { nullable: true })
  embedding?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}