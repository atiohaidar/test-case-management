import json
import re
from fastapi import HTTPException
from typing import List
import google.generativeai as genai
from ..config import config, logger
from ..models import (
    GenerateTestCaseRequest, 
    GenerateTestCaseResponse, 
    TestStep, 
    RAGReference,
    SearchRequest
)
from .search_service import SearchService

class AIGenerationService:
    """Service for handling AI-powered test case generation"""
    
    def __init__(self, search_service: SearchService = None):
        self.search_service = search_service or SearchService()
        self.gemini_available = config.setup_gemini()
    
    async def generate_test_case(self, request: GenerateTestCaseRequest) -> GenerateTestCaseResponse:
        """Generate a test case using Gemini AI with optional RAG"""
        if not self.gemini_available:
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
                rag_references, enhanced_prompt, generation_method = await self._perform_rag(request)
            
            # Initialize Gemini model
            model = genai.GenerativeModel(config.GEMINI_MODEL)
            
            # Build the system prompt (enhanced for RAG)
            system_prompt = self._build_system_prompt(generation_method == "rag")
            
            # Build user prompt
            user_prompt = self._build_user_prompt(request, enhanced_prompt)

            # Generate content
            response = model.generate_content([
                {"text": system_prompt},
                {"text": user_prompt}
            ])

            response_text = response.text
            
            # Parse and validate the response
            ai_response = self._parse_ai_response(response_text)
            
            # Format the final response
            response_data = self._format_response(ai_response, request, generation_method, rag_references)

            logger.info(f"Successfully generated test case using {generation_method} for prompt: {request.prompt}")
            return response_data

        except Exception as e:
            logger.error(f"Gemini AI Error: {e}")
            raise HTTPException(
                status_code=503,
                detail="Failed to generate test case with AI"
            )
    
    async def _perform_rag(self, request: GenerateTestCaseRequest) -> tuple:
        """Perform RAG retrieval and return references, enhanced prompt, and method"""
        try:
            # Perform semantic search for relevant test cases
            search_request = SearchRequest(
                query=request.prompt,
                min_similarity=request.ragSimilarityThreshold,
                limit=request.maxRAGReferences
            )
            
            search_results = self.search_service.search(search_request)
            
            if search_results:
                generation_method = "rag"
                
                # Convert search results to RAG references
                rag_references = []
                for result in search_results:
                    rag_references.append(RAGReference(
                        testCaseId=result.testCase['id'],
                        similarity=result.similarity,
                        testCase=result.testCase
                    ))
                
                # Format RAG context for AI prompt
                rag_context = self._format_rag_context(rag_references)
                enhanced_prompt = f"{request.prompt}\n\n{rag_context}"
                
                logger.info(f"Found {len(rag_references)} relevant test cases for RAG")
                return rag_references, enhanced_prompt, generation_method
            else:
                logger.info("No relevant test cases found for RAG, using pure AI generation")
                return [], request.prompt, "pure_ai"
                
        except Exception as rag_error:
            logger.warning(f"RAG retrieval failed: {rag_error}, falling back to pure AI")
            return [], request.prompt, "pure_ai"
    
    def _format_rag_context(self, rag_references: List[RAGReference]) -> str:
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
    
    def _build_user_prompt(self, request: GenerateTestCaseRequest, enhanced_prompt: str) -> str:
        """Build user prompt for AI generation"""
        user_prompt = f"Generate a test case for: {enhanced_prompt}"
        
        if request.context:
            user_prompt += f"\n\nAdditional context: {request.context}"
        
        if request.preferredType:
            user_prompt += f"\n\nPreferred type: {request.preferredType}"
        
        if request.preferredPriority:
            user_prompt += f"\n\nPreferred priority: {request.preferredPriority}"
        
        return user_prompt
    
    def _parse_ai_response(self, response_text: str) -> dict:
        """Parse and validate AI response"""
        try:
            # Clean up the response text to extract JSON
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if not json_match:
                raise ValueError('No valid JSON found in AI response')
            
            ai_response = json.loads(json_match.group())
            return ai_response
        except (json.JSONDecodeError, ValueError) as parse_error:
            logger.error(f"Failed to parse AI response: {response_text}")
            raise HTTPException(
                status_code=500,
                detail="Invalid response from AI service"
            )
    
    def _format_response(self, ai_response: dict, request: GenerateTestCaseRequest, 
                        generation_method: str, rag_references: List[RAGReference]) -> GenerateTestCaseResponse:
        """Format the final response"""
        # Validate and format steps
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

        return GenerateTestCaseResponse(
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
            ragReferences=rag_references
        )