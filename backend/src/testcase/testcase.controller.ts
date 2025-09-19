import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TestCaseService } from './testcase.service';
import { CreateTestCaseDto } from './dto/create-testcase.dto';
import { UpdateTestCaseDto } from './dto/update-testcase.dto';
import { SearchTestCaseDto, SearchResultDto } from './dto/search-testcase.dto';
import { GenerateTestCaseWithAIDto, AIGeneratedTestCaseResponseDto } from './dto/generate-testcase-ai.dto';
import { TestCaseDto } from './entities/testcase.entity';
import { TestCaseWithReferenceDto } from './dto/testcase-with-reference.dto';

@ApiTags('testcases')
@Controller('testcases')
export class TestCaseController {
  constructor(private readonly testCaseService: TestCaseService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new test case' })
  @ApiResponse({ status: 201, description: 'Test case created successfully', type: TestCaseDto })
  async create(@Body() createTestCaseDto: CreateTestCaseDto) {
    return this.testCaseService.create(createTestCaseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all test cases' })
  @ApiResponse({ status: 200, description: 'List of all test cases', type: [TestCaseDto] })
  async findAll() {
    return this.testCaseService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search test cases using semantic similarity' })
  @ApiResponse({ status: 200, description: 'Search results with similarity scores', type: [SearchResultDto] })
  async search(@Query() searchDto: SearchTestCaseDto): Promise<SearchResultDto[]> {
    return this.testCaseService.search(searchDto);
  }

  @Post('generate-with-ai')
  @ApiOperation({ summary: 'Generate a test case draft using AI (Gemini)' })
  @ApiResponse({
    status: 200,
    description: 'AI-generated test case draft (not saved to database)',
    type: AIGeneratedTestCaseResponseDto
  })
  @ApiResponse({ status: 500, description: 'AI service unavailable or API key not configured' })
  async generateWithAI(@Body() generateDto: GenerateTestCaseWithAIDto): Promise<AIGeneratedTestCaseResponseDto> {
    return this.testCaseService.generateTestCaseWithAI(generateDto);
  }

  @Post('generate-and-save-with-ai')
  @ApiOperation({
    summary: 'Generate and save a test case using AI with optional RAG',
    description: 'Generate test case with AI and automatically save to database. Supports RAG for better context-aware generation.'
  })
  @ApiResponse({
    status: 201,
    description: 'AI-generated test case created and saved successfully',
    type: TestCaseDto
  })
  @ApiResponse({ status: 500, description: 'AI service unavailable or API key not configured' })
  async generateAndSaveWithAI(@Body() generateDto: GenerateTestCaseWithAIDto) {
    return this.testCaseService.generateAndSaveTestCaseWithAI(generateDto);
  }

  @Get(':id/with-reference')
  @ApiOperation({ summary: 'Get a test case with reference information' })
  @ApiResponse({ status: 200, description: 'Test case with reference info found', type: TestCaseWithReferenceDto })
  @ApiResponse({ status: 404, description: 'Test case not found' })
  async findOneWithReference(@Param('id') id: string) {
    return this.testCaseService.getWithReference(id);
  }

  @Get(':id/derived')
  @ApiOperation({ summary: 'Get test cases derived from this test case' })
  @ApiResponse({ status: 200, description: 'List of derived test cases', type: [TestCaseDto] })
  @ApiResponse({ status: 404, description: 'Test case not found' })
  async getDerived(@Param('id') id: string) {
    return this.testCaseService.getDerivedTestCases(id);
  }

  @Post('derive/:referenceId')
  @ApiOperation({ summary: 'Create a new test case based on an existing one' })
  @ApiResponse({ status: 201, description: 'Test case derived successfully', type: TestCaseDto })
  @ApiResponse({ status: 404, description: 'Reference test case not found' })
  async deriveTestCase(
    @Param('referenceId') referenceId: string,
    @Body() createTestCaseDto: CreateTestCaseDto,
  ) {
    return this.testCaseService.deriveFromTestCase(referenceId, createTestCaseDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a test case by ID' })
  @ApiResponse({ status: 200, description: 'Test case found', type: TestCaseDto })
  @ApiResponse({ status: 404, description: 'Test case not found' })
  async findOne(@Param('id') id: string) {
    return this.testCaseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a test case' })
  @ApiResponse({ status: 200, description: 'Test case updated successfully', type: TestCaseDto })
  @ApiResponse({ status: 404, description: 'Test case not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTestCaseDto: UpdateTestCaseDto,
  ) {
    return this.testCaseService.update(id, updateTestCaseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a test case' })
  @ApiResponse({ status: 204, description: 'Test case deleted successfully' })
  @ApiResponse({ status: 404, description: 'Test case not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.testCaseService.remove(id);
  }
}