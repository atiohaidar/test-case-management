from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import mysql.connector
from mysql.connector import Error
import json
import os
from dotenv import load_dotenv
import logging
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Test Case AI Service",
    description="AI service for test case embeddings and semantic search",
    version="1.0.0"
)

# Initialize the sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize Gemini AI
gemini_api_key = os.getenv('GEMINI_API_KEY')
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    logger.info("Gemini AI configured successfully")
else:
    logger.warning("Gemini API key not found - AI generation will not be available")

class EmbeddingRequest(BaseModel):
    text: str

class EmbeddingResponse(BaseModel):
    embedding: List[float]

class SearchRequest(BaseModel):
    query: str
    min_similarity: float = Field(default=0.7, ge=0.0, le=1.0)
    limit: int = Field(default=10, ge=1, le=100)

class SearchResult(BaseModel):
    similarity: float
    testCase: dict

class SearchResponse(BaseModel):
    results: List[SearchResult]

# AI Generation Models
class TestStep(BaseModel):
    step: str
    expectedResult: str

class RAGReference(BaseModel):
    testCaseId: str
    similarity: float
    testCase: dict

class GenerateTestCaseRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    preferredType: Optional[str] = None
    preferredPriority: Optional[str] = None
    # RAG Parameters
    useRAG: bool = Field(default=True, description="Enable/disable RAG retrieval")
    ragSimilarityThreshold: float = Field(default=0.7, ge=0.0, le=1.0, description="Minimum similarity threshold for RAG")
    maxRAGReferences: int = Field(default=3, ge=1, le=10, description="Maximum number of RAG references")

class GenerateTestCaseResponse(BaseModel):
    name: str
    description: str
    type: str
    priority: str
    steps: List[TestStep]
    expectedResult: str
    tags: List[str]
    originalPrompt: str
    aiGenerated: bool
    confidence: float
    aiSuggestions: Optional[str] = None
    # RAG Metadata
    aiGenerationMethod: str  # "pure_ai" | "rag"
    ragReferences: List[RAGReference] = []

class DatabaseConnection:
    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.port = int(os.getenv('DB_PORT', '3306'))
        self.username = os.getenv('DB_USERNAME', 'root')
        self.password = os.getenv('DB_PASSWORD', 'password')
        self.database = os.getenv('DB_DATABASE', 'testcase_management')
        
    def get_connection(self):
        try:
            connection = mysql.connector.connect(
                host=self.host,
                port=self.port,
                user=self.username,
                password=self.password,
                database=self.database
            )
            return connection
        except Error as e:
            logger.error(f"Database connection error: {e}")
            raise HTTPException(status_code=500, detail="Database connection failed")

db = DatabaseConnection()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Service"}

@app.post("/generate-embedding", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest):
    """Generate embedding for given text"""
    try:
        # Generate embedding using sentence transformer
        embedding = model.encode(request.text)
        
        # Convert numpy array to list for JSON serialization
        embedding_list = embedding.tolist()
        
        logger.info(f"Generated embedding for text: {request.text[:50]}...")
        
        return EmbeddingResponse(embedding=embedding_list)
    
    except Exception as e:
        logger.error(f"Embedding generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate embedding")

@app.post("/search", response_model=List[SearchResult])
async def semantic_search(request: SearchRequest):
    """Perform semantic search on test cases"""
    try:
        # Generate embedding for search query
        query_embedding = model.encode(request.query)
        
        # Get all test cases from database
        connection = db.get_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
        SELECT id, name, description, type, priority, steps, expectedResult, tags, embedding, createdAt, updatedAt
        FROM testcases
        WHERE embedding IS NOT NULL AND embedding != ''
        """
        
        cursor.execute(query)
        test_cases = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        if not test_cases:
            return []
        
        # Calculate similarities
        results = []
        
        for test_case in test_cases:
            try:
                # Parse stored embedding
                stored_embedding = json.loads(test_case['embedding'])
                
                if not stored_embedding:
                    continue
                    
                # Calculate cosine similarity
                similarity = cosine_similarity(
                    [query_embedding], 
                    [stored_embedding]
                )[0][0]
                
                # Filter by minimum similarity
                if similarity >= request.min_similarity:
                    # Convert test case data
                    test_case_data = {
                        'id': test_case['id'],
                        'name': test_case['name'],
                        'description': test_case['description'],
                        'type': test_case['type'],
                        'priority': test_case['priority'],
                        'steps': json.loads(test_case['steps']) if test_case['steps'] else [],
                        'expectedResult': test_case['expectedResult'],
                        'tags': json.loads(test_case['tags']) if test_case['tags'] else [],
                        'createdAt': test_case['createdAt'].isoformat() if test_case['createdAt'] else None,
                        'updatedAt': test_case['updatedAt'].isoformat() if test_case['updatedAt'] else None,
                    }
                    
                    results.append(SearchResult(
                        similarity=float(similarity),
                        testCase=test_case_data
                    ))
                    
            except (json.JSONDecodeError, KeyError) as e:
                logger.warning(f"Skipping test case {test_case.get('id', 'unknown')} due to invalid embedding: {e}")
                continue
        
        # Sort by similarity (highest first) and limit results
        results.sort(key=lambda x: x.similarity, reverse=True)
        results = results[:request.limit]
        
        logger.info(f"Found {len(results)} similar test cases for query: {request.query}")
        
        return results
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform semantic search")

@app.post("/generate-test-case", response_model=GenerateTestCaseResponse)
async def generate_test_case_with_ai(request: GenerateTestCaseRequest):
    """Generate a test case using Gemini AI with optional RAG"""
    if not gemini_api_key:
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
                search_request = SearchRequest(
                    query=request.prompt,
                    min_similarity=request.ragSimilarityThreshold,
                    limit=request.maxRAGReferences
                )
                
                search_results = await semantic_search(search_request)
                
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
                    rag_context = await format_rag_context(rag_references)
                    enhanced_prompt = f"{request.prompt}\n\n{rag_context}"
                    
                    logger.info(f"Found {len(rag_references)} relevant test cases for RAG")
                else:
                    logger.info("No relevant test cases found for RAG, using pure AI generation")
                    
            except Exception as rag_error:
                logger.warning(f"RAG retrieval failed: {rag_error}, falling back to pure AI")
                # Continue with pure AI if RAG fails
        
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Build the system prompt (enhanced for RAG)
        system_prompt = await build_system_prompt(generation_method == "rag")
        
        # Build user prompt
        user_prompt = f"Generate a test case for: {enhanced_prompt}"
        
        if request.context:
            user_prompt += f"\n\nAdditional context: {request.context}"
        
        if request.preferredType:
            user_prompt += f"\n\nPreferred type: {request.preferredType}"
        
        if request.preferredPriority:
            user_prompt += f"\n\nPreferred priority: {request.preferredPriority}"

        # Generate content
        response = model.generate_content([
            {"text": system_prompt},
            {"text": user_prompt}
        ])

        response_text = response.text
        
        # Parse the JSON response
        try:
            # Clean up the response text to extract JSON
            import re
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
            ragReferences=rag_references
        )

        logger.info(f"Successfully generated test case using {generation_method} for prompt: {request.prompt}")
        return response_data

    except Exception as e:
        logger.error(f"Gemini AI Error: {e}")
        raise HTTPException(
            status_code=503,
            detail="Failed to generate test case with AI"
        )

async def format_rag_context(rag_references: List[RAGReference]) -> str:
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

async def build_system_prompt(has_rag_context: bool = False) -> str:
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

@app.get("/stats")
async def get_statistics():
    """Get AI service statistics"""
    try:
        connection = db.get_connection()
        cursor = connection.cursor()
        
        # Count total test cases
        cursor.execute("SELECT COUNT(*) FROM testcases")
        total_count = cursor.fetchone()[0]
        
        # Count test cases with embeddings
        cursor.execute("SELECT COUNT(*) FROM testcases WHERE embedding IS NOT NULL AND embedding != ''")
        embedded_count = cursor.fetchone()[0]
        
        cursor.close()
        connection.close()
        
        return {
            "total_test_cases": total_count,
            "embedded_test_cases": embedded_count,
            "embedding_coverage": (embedded_count / total_count * 100) if total_count > 0 else 0,
            "model_name": "all-MiniLM-L6-v2",
            "embedding_dimension": 384
        }
        
    except Exception as e:
        logger.error(f"Statistics error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get statistics")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)