"""
Gemini AI service for test case generation.
Handles Google Gemini AI integration with RAG support.
Separated from main.py for better organization and maintainability.
"""

import json
import re
import logging
from typing import List, Optional
import google.generativeai as genai
import os

from fastapi import HTTPException
from models import (
    GenerateTestCaseRequest, GenerateTestCaseResponse,
    TestStep, RAGReference, TokenUsage,
    TokenEstimateRequest, TokenEstimateResponse
)
from services.ai_service import ai_service

logger = logging.getLogger(__name__)


class GeminiService:
    """Handles Google Gemini AI operations for test case generation"""

    def __init__(self):
        # Don't initialize API key here - do it lazily when needed
        self._api_key = None
        self._configured = False

    @property
    def api_key(self):
        if self._api_key is None:
            self._api_key = os.getenv('GEMINI_API_KEY')
            if self._api_key and not self._configured:
                genai.configure(api_key=self._api_key)
                self._configured = True
                logger.info("Gemini AI configured successfully")
            elif not self._api_key:
                logger.warning("Gemini API key not found - AI generation will not be available")
        return self._api_key

    async def generate_test_case(self, request: GenerateTestCaseRequest) -> GenerateTestCaseResponse:
        """Generate a test case using Gemini AI with optional RAG"""
        if not self.api_key:
            raise HTTPException(
                status_code=500,
                detail="Gemini API key is not configured"
            )

        try:
            # Initialize variables for RAG
            rag_references = []
            enhanced_prompt = request.prompt
            generation_method = "pure_ai"

            # Perform RAG if enabled
            if request.useRAG:
                logger.info(f"Performing RAG retrieval for prompt: {request.prompt[:50]}...")

                try:
                    # Perform semantic search for relevant test cases
                    from models import SearchRequest
                    search_request = SearchRequest(
                        query=request.prompt,
                        min_similarity=request.ragSimilarityThreshold,
                        limit=request.maxRAGReferences
                    )

                    search_results = ai_service.semantic_search(search_request)

                    if search_results:
                        generation_method = "rag"

                        # Convert search results to RAG references
                        for result in search_results:
                            rag_references.append(RAGReference(
                                testCaseId=result.testCase['id'],
                                similarity=result.similarity,
                                testCase=result.testCase
                            ))

                        # Format RAG context for AI prompt
                        rag_context = await self._format_rag_context(rag_references)
                        enhanced_prompt = f"{request.prompt}\n\n{rag_context}"

                        logger.info(f"Found {len(rag_references)} relevant test cases for RAG")
                    else:
                        logger.info("No relevant test cases found for RAG, using pure AI generation")

                except Exception as rag_error:
                    logger.warning(f"RAG retrieval failed: {rag_error}, falling back to pure AI")
                    # Continue with pure AI if RAG fails

            # Initialize Gemini model
            model = genai.GenerativeModel('gemini-2.0-flash')

            # Build the system prompt (enhanced for RAG)
            system_prompt = await self._build_system_prompt(generation_method == "rag")

            # Build user prompt
            user_prompt = f"Generate a test case for: {enhanced_prompt}"

            if request.context:
                user_prompt += f"\n\nAdditional context: {request.context}"

            if request.preferredType:
                user_prompt += f"\n\nPreferred type: {request.preferredType}"

            if request.preferredPriority:
                user_prompt += f"\n\nPreferred priority: {request.preferredPriority}"

            # Generate content with token tracking
            response = model.generate_content([
                {"text": system_prompt},
                {"text": user_prompt}
            ])

            response_text = response.text

            # Log token usage information if available
            try:
                # Gemini API provides usage metadata in response
                if hasattr(response, 'usage_metadata'):
                    usage = response.usage_metadata
                    logger.info(f"Token usage - Prompt: {usage.prompt_token_count}, "
                               f"Candidates: {usage.candidates_token_count}, "
                               f"Total: {usage.total_token_count}")

                # Alternative: Check if response has prompt_feedback with token info
                if hasattr(response, 'prompt_feedback'):
                    logger.info(f"Prompt feedback: {response.prompt_feedback}")

            except Exception as token_error:
                logger.warning(f"Could not retrieve token usage: {token_error}")

            # Parse the JSON response
            try:
                # Clean up the response text to extract JSON
                json_match = re.search(r'\{[\s\S]*\}', response_text)
                if not json_match:
                    raise ValueError('No valid JSON found in AI response')

                ai_response = json.loads(json_match.group())
            except (json.JSONDecodeError, ValueError) as parse_error:
                logger.error(f"Failed to parse AI response: {response_text}")
                raise HTTPException(
                    status_code=500,
                    detail="Invalid response from AI service"
                )

            # Collect token usage information
            token_usage = None
            if request.includeTokenUsage:
                try:
                    if hasattr(response, 'usage_metadata'):
                        usage = response.usage_metadata
                        token_usage = TokenUsage(
                            prompt_token_count=getattr(usage, 'prompt_token_count', None),
                            candidates_token_count=getattr(usage, 'candidates_token_count', None),
                            total_token_count=getattr(usage, 'total_token_count', None)
                        )
                except Exception as token_error:
                    logger.warning(f"Could not extract token usage: {token_error}")

            # Validate and format the response
            steps = []
            if ai_response.get('steps'):
                for step_data in ai_response['steps']:
                    steps.append(TestStep(
                        step=step_data.get('step', 'Generated step'),
                        expectedResult=step_data.get('expectedResult', 'Generated expected result')
                    ))
            else:
                steps = [TestStep(
                    step='Generated step',
                    expectedResult='Generated expected result'
                )]

            response_data = GenerateTestCaseResponse(
                name=ai_response.get('name', 'Generated Test Case'),
                description=ai_response.get('description', 'AI generated test case description'),
                type=ai_response.get('type', 'positive'),
                priority=ai_response.get('priority', 'medium'),
                steps=steps,
                expectedResult=ai_response.get('expectedResult', 'Generated final result'),
                tags=ai_response.get('tags', ['ai-generated']),
                originalPrompt=request.prompt,
                aiGenerated=True,
                confidence=ai_response.get('confidence', 0.8),
                aiSuggestions=ai_response.get('aiSuggestions'),
                aiGenerationMethod=generation_method,
                ragReferences=rag_references,
                tokenUsage=token_usage
            )

            logger.info(f"Successfully generated test case using {generation_method} for prompt: {request.prompt}")
            return response_data

        except Exception as e:
            logger.error(f"Gemini AI Error: {e}")
            raise HTTPException(
                status_code=503,
                detail="Failed to generate test case with AI"
            )

    async def estimate_tokens(self, request: TokenEstimateRequest) -> TokenEstimateResponse:
        """Estimate token usage for a prompt before making the actual AI call"""
        try:
            # Build the same prompt that would be sent to AI
            enhanced_prompt = request.prompt

            # If RAG is enabled, simulate the enhancement
            if request.useRAG:
                # Perform search to get potential RAG context
                from models import SearchRequest
                search_request = SearchRequest(
                    query=request.prompt,
                    min_similarity=request.ragSimilarityThreshold,
                    limit=request.maxRAGReferences
                )

                search_results = ai_service.semantic_search(search_request)

                if search_results:
                    # Simulate RAG context formatting
                    rag_context = "Berikut adalah contoh test case yang relevan sebagai referensi:\n\n"
                    for i, result in enumerate(search_results, 1):
                        tc = result.testCase
                        rag_context += f"=== Contoh {i} ===\n"
                        rag_context += f"Nama: {tc.get('name', 'N/A')}\n"
                        rag_context += f"Deskripsi: {tc.get('description', 'N/A')}\n"
                        # Add more context simulation...
                        rag_context += "\n"

                    enhanced_prompt = f"{request.prompt}\n\n{rag_context}"

            # Build system and user prompts
            system_prompt = await self._build_system_prompt(request.useRAG)
            user_prompt = f"Generate a test case for: {enhanced_prompt}"

            if request.context:
                user_prompt += f"\n\nAdditional context: {request.context}"

            # Estimate tokens (rough estimation: ~4 characters per token)
            total_text = system_prompt + user_prompt
            estimated_tokens = len(total_text) // 4

            # Gemini 1.5 Flash pricing (as of 2024): $0.00015 per 1K input tokens
            estimated_cost = (estimated_tokens / 1000) * 0.00015

            return TokenEstimateResponse(
                estimated_input_tokens=estimated_tokens,
                estimated_cost_usd=round(estimated_cost, 6),
                model_name="gemini-1.5-flash",
                note="Estimation based on ~4 characters per token. Actual usage may vary."
            )

        except Exception as e:
            logger.error(f"Token estimation error: {e}")
            raise HTTPException(status_code=500, detail="Failed to estimate tokens")

    def get_token_info(self) -> dict:
        """Get information about token usage and pricing"""
        return {
            "model": "gemini-1.5-flash",
            "pricing": {
                "input_tokens_per_1k": "$0.00015",
                "output_tokens_per_1k": "$0.0006",
                "currency": "USD"
            },
            "limits": {
                "max_input_tokens": 1048576,  # 1M tokens
                "max_output_tokens": 8192
            },
            "estimation_method": "~4 characters per token",
            "note": "Pricing and limits are approximate and may change. Check Google AI Studio for latest information."
        }

    async def _format_rag_context(self, rag_references: List[RAGReference]) -> str:
        """Format RAG references into context for AI prompt"""
        if not rag_references:
            return ""

        context = "Berikut adalah contoh test case yang relevan sebagai referensi:\n\n"

        for i, ref in enumerate(rag_references, 1):
            tc = ref.testCase
            context += f"=== Contoh {i} (Similarity: {ref.similarity:.2f}) ===\n"
            context += f"Nama: {tc.get('name', 'N/A')}\n"
            context += f"Deskripsi: {tc.get('description', 'N/A')}\n"
            context += f"Tipe: {tc.get('type', 'N/A')}\n"
            context += f"Prioritas: {tc.get('priority', 'N/A')}\n"

            if tc.get('steps') and isinstance(tc['steps'], list):
                context += "Langkah-langkah:\n"
                for j, step in enumerate(tc['steps'], 1):
                    if isinstance(step, dict):
                        context += f"  {j}. {step.get('step', 'N/A')} -> {step.get('expectedResult', 'N/A')}\n"

            context += f"Expected Result: {tc.get('expectedResult', 'N/A')}\n"

            if tc.get('tags') and isinstance(tc['tags'], list):
                context += f"Tags: {', '.join(tc['tags'])}\n"

            context += "\n"

        context += "Gunakan contoh-contoh di atas sebagai referensi untuk membuat test case yang konsisten dan berkualitas.\n"
        return context

    async def _build_system_prompt(self, has_rag_context: bool = False) -> str:
        """Build system prompt for AI generation"""
        base_prompt = """You are a professional test case designer. Generate a detailed test case based on the user's request.

Your response MUST be a valid JSON object with the following structure:
{
  "name": "string - Clear and descriptive test case name",
  "description": "string - Detailed description of what this test case validates",
  "type": "positive|negative",
  "priority": "low|medium|high",
  "steps": [
    {
      "step": "string - Clear action to perform",
      "expectedResult": "string - Expected outcome of this step"
    }
  ],
  "expectedResult": "string - Final expected result of the entire test",
  "tags": ["string array - relevant tags"],
  "confidence": number between 0-1,
  "aiSuggestions": "string - optional suggestions for improvement"
}

Rules:
1. Generate realistic and practical test cases
2. Include detailed steps that are actionable
3. Use appropriate test case types and priorities
4. Provide relevant tags for categorization
5. Give confidence score based on prompt clarity
6. Response must be valid JSON only, no additional text
7. If user is using any language other than English, the values in JSON should use that language (for example Bahasa Indonesia)"""

        if has_rag_context:
            base_prompt += """
8. IMPORTANT: Use the provided example test cases as references for consistency
9. Follow similar patterns, naming conventions, and structures from the examples
10. Ensure your generated test case complements rather than duplicates the examples
11. Maintain quality and detail level similar to the reference examples"""

        return base_prompt


# Global Gemini service instance
gemini_service = GeminiService()