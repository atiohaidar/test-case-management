"""
Gemini AI service for test case generation.
Handles Google Gemini AI integration with RAG support.
"""

import json
import re
import logging
from typing import List, Dict, Any, Optional
import os

logger = logging.getLogger(__name__)

# Try to import google.generativeai, but don't fail if not available
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("google-generativeai not installed. AI generation will not be available.")


class GeminiService:
    """Handles Google Gemini AI operations for test case generation"""

    def __init__(self):
        self._api_key = None
        self._configured = False
        self._ai_service = None

    @property
    def api_key(self):
        if self._api_key is None:
            self._api_key = os.getenv('GEMINI_API_KEY')
            if self._api_key and not self._configured and GEMINI_AVAILABLE:
                genai.configure(api_key=self._api_key)
                self._configured = True
                logger.info("Gemini AI configured successfully")
            elif not self._api_key:
                logger.warning("Gemini API key not found - AI generation will not be available")
        return self._api_key

    @property
    def ai_service(self):
        if self._ai_service is None:
            from ai_service import AIService
            self._ai_service = AIService()
        return self._ai_service

    def generate_test_case(
        self,
        prompt: str,
        context: Optional[str] = None,
        preferred_type: Optional[str] = None,
        preferred_priority: Optional[str] = None,
        use_rag: bool = True,
        rag_similarity_threshold: float = 0.7,
        max_rag_references: int = 3
    ) -> Dict[str, Any]:
        """Generate a test case using Gemini AI with optional RAG"""
        
        if not GEMINI_AVAILABLE:
            raise Exception("Gemini AI library not installed")
        
        if not self.api_key:
            raise Exception("Gemini API key is not configured")

        try:
            # Initialize variables for RAG
            rag_references = []
            enhanced_prompt = prompt
            generation_method = "pure_ai"

            # Perform RAG if enabled
            if use_rag:
                logger.info(f"Performing RAG retrieval for prompt: {prompt[:50]}...")

                try:
                    search_results = self.ai_service.semantic_search(
                        prompt,
                        min_similarity=rag_similarity_threshold,
                        limit=max_rag_references
                    )

                    if search_results:
                        generation_method = "rag"

                        # Convert search results to RAG references
                        for result in search_results:
                            rag_references.append({
                                'testCaseId': result['testCase']['id'],
                                'similarity': result['similarity'],
                                'testCase': {
                                    'id': result['testCase']['id'],
                                    'name': result['testCase']['name'],
                                    'type': result['testCase']['type'],
                                    'priority': result['testCase']['priority'],
                                    'tags': result['testCase'].get('tags', []),
                                }
                            })

                        # Format RAG context for AI prompt
                        rag_context = self._format_rag_context(search_results)
                        enhanced_prompt = f"{prompt}\n\n{rag_context}"

                        logger.info(f"Found {len(rag_references)} relevant test cases for RAG")
                    else:
                        logger.info("No relevant test cases found for RAG, using pure AI generation")

                except Exception as rag_error:
                    logger.warning(f"RAG retrieval failed: {rag_error}, falling back to pure AI")

            # Initialize Gemini model
            model = genai.GenerativeModel('gemini-2.0-flash')

            # Build the system prompt
            system_prompt = self._build_system_prompt(generation_method == "rag")

            # Build user prompt
            user_prompt = f"Generate a test case for: {enhanced_prompt}"

            if context:
                user_prompt += f"\n\nAdditional context: {context}"

            if preferred_type:
                user_prompt += f"\n\nPreferred type: {preferred_type}"

            if preferred_priority:
                user_prompt += f"\n\nPreferred priority: {preferred_priority}"

            # Generate content
            response = model.generate_content([
                {"text": system_prompt},
                {"text": user_prompt}
            ])

            response_text = response.text

            # Extract token usage
            token_usage = None
            try:
                if hasattr(response, 'usage_metadata'):
                    usage = response.usage_metadata
                    token_usage = {
                        'prompt_token_count': getattr(usage, 'prompt_token_count', None),
                        'candidates_token_count': getattr(usage, 'candidates_token_count', None),
                        'total_token_count': getattr(usage, 'total_token_count', None),
                    }
                    logger.info(f"Token usage - Total: {token_usage.get('total_token_count')}")
            except Exception as token_error:
                logger.warning(f"Could not retrieve token usage: {token_error}")

            # Parse the JSON response
            try:
                json_match = re.search(r'\{[\s\S]*\}', response_text)
                if not json_match:
                    raise ValueError('No valid JSON found in AI response')

                ai_response = json.loads(json_match.group())
            except (json.JSONDecodeError, ValueError) as parse_error:
                logger.error(f"Failed to parse AI response: {response_text}")
                raise Exception("Invalid response from AI service")

            # Format steps
            steps = []
            if ai_response.get('steps'):
                for step_data in ai_response['steps']:
                    steps.append({
                        'step': step_data.get('step', 'Generated step'),
                        'expectedResult': step_data.get('expectedResult', 'Generated expected result')
                    })
            else:
                steps = [{
                    'step': 'Generated step',
                    'expectedResult': 'Generated expected result'
                }]

            response_data = {
                'name': ai_response.get('name', 'Generated Test Case'),
                'description': ai_response.get('description', 'AI generated test case description'),
                'type': ai_response.get('type', 'positive'),
                'priority': ai_response.get('priority', 'medium'),
                'steps': steps,
                'expectedResult': ai_response.get('expectedResult', 'Generated final result'),
                'tags': ai_response.get('tags', ['ai-generated']),
                'originalPrompt': prompt,
                'aiGenerated': True,
                'confidence': ai_response.get('confidence', 0.8),
                'aiSuggestions': ai_response.get('aiSuggestions'),
                'aiGenerationMethod': generation_method,
                'ragReferences': rag_references,
                'tokenUsage': token_usage,
                'referencesCount': 0,
                'derivedCount': 0,
            }

            logger.info(f"Successfully generated test case using {generation_method} for prompt: {prompt}")
            return response_data

        except Exception as e:
            logger.error(f"Gemini AI Error: {e}")
            raise Exception(f"Failed to generate test case with AI: {str(e)}")

    def _format_rag_context(self, search_results: List[Dict[str, Any]]) -> str:
        """Format RAG references into context for AI prompt"""
        if not search_results:
            return ""

        context = "Berikut adalah contoh test case yang relevan sebagai referensi:\n\n"

        for i, result in enumerate(search_results, 1):
            tc = result['testCase']
            context += f"=== Contoh {i} (Similarity: {result['similarity']:.2f}) ===\n"
            context += f"Nama: {tc.get('name', 'N/A')}\n"
            context += f"Deskripsi: {tc.get('description', 'N/A')}\n"
            context += f"Tipe: {tc.get('type', 'N/A')}\n"
            context += f"Prioritas: {tc.get('priority', 'N/A')}\n"

            steps = tc.get('steps', [])
            if steps and isinstance(steps, list):
                context += "Langkah-langkah:\n"
                for j, step in enumerate(steps, 1):
                    if isinstance(step, dict):
                        context += f"  {j}. {step.get('step', 'N/A')} -> {step.get('expectedResult', 'N/A')}\n"

            context += f"Expected Result: {tc.get('expectedResult', 'N/A')}\n"

            tags = tc.get('tags', [])
            if tags and isinstance(tags, list):
                context += f"Tags: {', '.join(tags)}\n"

            context += "\n"

        context += "Gunakan contoh-contoh di atas sebagai referensi untuk membuat test case yang konsisten dan berkualitas.\n"
        return context

    def _build_system_prompt(self, has_rag_context: bool = False) -> str:
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
