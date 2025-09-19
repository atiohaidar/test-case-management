import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestCaseType, TestCasePriority } from '../entities/testcase.entity';

export class GenerateTestCaseWithAIDto {
    @ApiProperty({ description: 'Prompt untuk AI dalam bahasa natural' })
    @IsString()
    @IsNotEmpty()
    prompt: string;

    @ApiPropertyOptional({ description: 'Konteks tambahan untuk AI generation' })
    @IsString()
    @IsOptional()
    context?: string;

    @ApiPropertyOptional({
        enum: TestCaseType,
        description: 'Tipe test case yang diinginkan (optional, AI akan menentukan jika tidak disebutkan)'
    })
    @IsEnum(TestCaseType)
    @IsOptional()
    preferredType?: TestCaseType;

    @ApiPropertyOptional({
        enum: TestCasePriority,
        description: 'Prioritas yang diinginkan (optional, AI akan menentukan jika tidak disebutkan)'
    })
    @IsEnum(TestCasePriority)
    @IsOptional()
    preferredPriority?: TestCasePriority;
}

export class AIGeneratedTestCaseResponseDto {
    @ApiProperty({ description: 'Nama test case yang dihasilkan AI' })
    name: string;

    @ApiProperty({ description: 'Deskripsi test case yang dihasilkan AI' })
    description: string;

    @ApiProperty({ enum: TestCaseType, description: 'Tipe test case yang ditentukan AI' })
    type: TestCaseType;

    @ApiProperty({ enum: TestCasePriority, description: 'Prioritas yang ditentukan AI' })
    priority: TestCasePriority;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                step: { type: 'string' },
                expectedResult: { type: 'string' }
            }
        },
        description: 'Langkah-langkah test case yang dihasilkan AI'
    })
    steps: Array<{
        step: string;
        expectedResult: string;
    }>;

    @ApiProperty({ description: 'Expected result akhir yang dihasilkan AI' })
    expectedResult: string;

    @ApiProperty({ type: [String], description: 'Tags yang dihasilkan AI' })
    tags: string[];

    @ApiProperty({ description: 'Prompt asli yang digunakan untuk generate' })
    originalPrompt: string;

    @ApiProperty({ description: 'Keterangan bahwa test case ini dibuat dengan bantuan AI' })
    aiGenerated: boolean;

    @ApiProperty({ description: 'Confidence score dari AI (0-1)' })
    confidence: number;

    @ApiProperty({ description: 'Saran dari AI untuk improvement' })
    aiSuggestions?: string;
}