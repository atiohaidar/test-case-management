"""
Main FastAPI application for AI service.
Refactored to use separated concerns with modular architecture.
"""

# Load environment variables FIRST before any other imports
import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
import logging

# Import separated modules AFTER environment is loaded
from models import (
    EmbeddingRequest, EmbeddingResponse,
    SearchRequest, SearchResult,
    GenerateTestCaseRequest, GenerateTestCaseResponse,
    TokenEstimateRequest, TokenEstimateResponse,
    StatisticsResponse, TokenInfoResponse
)
from services import ai_service, gemini_service, db

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Test Case AI Service",
    description="AI service for test case embeddings and semantic search",
    version="1.0.0"
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Service"}

# Embedding endpoints
@app.post("/generate-embedding", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest):
    """Generate embedding for given text"""
    return ai_service.generate_embedding(request)

# Search endpoints
@app.post("/search", response_model=list[SearchResult])
async def semantic_search(request: SearchRequest):
    """Perform semantic search on test cases"""
    return ai_service.semantic_search(request)

# AI Generation endpoints
@app.post("/generate-test-case", response_model=GenerateTestCaseResponse)
async def generate_test_case_with_ai(request: GenerateTestCaseRequest):
    """Generate a test case using Gemini AI with optional RAG"""
    return await gemini_service.generate_test_case(request)

# Statistics endpoints
@app.get("/stats", response_model=StatisticsResponse)
async def get_statistics():
    """Get AI service statistics"""
    return ai_service.get_statistics()

# Token estimation endpoints
@app.post("/estimate-tokens", response_model=TokenEstimateResponse)
async def estimate_tokens(request: TokenEstimateRequest):
    """Estimate token usage for a prompt before making the actual AI call"""
    return await gemini_service.estimate_tokens(request)

# Token info endpoints
@app.get("/token-info", response_model=TokenInfoResponse)
async def get_token_info():
    """Get information about token usage and pricing"""
    return gemini_service.get_token_info()

# Main execution
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)