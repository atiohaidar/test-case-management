import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsNumber, IsInt, Min, Max } from 'class-validator';
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

    // RAG Parameters
    @ApiPropertyOptional({
        description: 'Aktifkan/nonaktifkan RAG (Retrieval-Augmented Generation)',
        default: true
    })
    @IsBoolean()
    @IsOptional()
    useRAG?: boolean = true;

    @ApiPropertyOptional({
        description: 'Threshold similarity minimum untuk RAG (0-1)',
        minimum: 0,
        maximum: 1,
        default: 0.7
    })
    @IsNumber()
    @Min(0)
    @Max(1)
    @IsOptional()
    ragSimilarityThreshold?: number = 0.7;

    @ApiPropertyOptional({
        description: 'Maksimal jumlah referensi test case untuk RAG',
        minimum: 1,
        maximum: 10,
        default: 3
    })
    @IsInt()
    @Min(1)
    @Max(10)
    @IsOptional()
    maxRAGReferences?: number = 3;
}

export class RAGReferenceDto {
    @ApiProperty({ description: 'ID test case yang dijadikan referensi' })
    testCaseId: string;

    @ApiProperty({ description: 'Similarity score dengan prompt (0-1)' })
    similarity: number;

    @ApiProperty({ description: 'Data test case referensi' })
    testCase: any;
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

    // RAG Metadata
    @ApiProperty({
        description: 'Metode AI generation yang digunakan',
        enum: ['pure_ai', 'rag']
    })
    aiGenerationMethod: string;

    @ApiProperty({
        type: [RAGReferenceDto],
        description: 'Referensi test case yang digunakan dalam RAG'
    })
    ragReferences: RAGReferenceDto[];
}