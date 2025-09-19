import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { SearchTestCaseDto, SearchResultDto } from '../dto/search-testcase.dto';
import { ITestCaseSearchService } from './interfaces';

@Injectable()
export class TestCaseSearchService implements ITestCaseSearchService {
    private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    async search(searchDto: SearchTestCaseDto): Promise<SearchResultDto[]> {
        try {
            const response = await axios.post(`${this.aiServiceUrl}/search`, {
                query: searchDto.query,
                min_similarity: searchDto.minSimilarity || 0.7,
                limit: searchDto.limit || 10,
            });

            return response.data;
        } catch (error) {
            console.error('AI Service Error:', error.message);
            throw new HttpException(
                'Failed to perform semantic search',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }
}