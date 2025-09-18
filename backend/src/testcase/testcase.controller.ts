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
import { TestCaseDto } from './entities/testcase.entity';

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