import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TestCaseEmbeddingService {
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  async generateEmbedding(testCaseData: any): Promise<number[]> {
    try {
      // Combine all text fields for embedding
      const text = [
        testCaseData.name,
        testCaseData.description,
        // testCaseData.expectedResult,
        // testCaseData.steps?.map(step => `${step.step} -> ${step.expectedResult}`).join(' '),
        testCaseData.tags?.join(' '),
      ].filter(Boolean).join(' ');

      const response = await axios.post(`${this.aiServiceUrl}/generate-embedding`, {
        text: text,
      });

      return response.data.embedding;
    } catch (error) {
      console.error('Embedding generation error:', error.message);
      // Return empty array if embedding fails
      return [];
    }
  }
}