"""
Pydantic models for AI service requests and responses.
Separated from main.py for better organization and maintainability.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


# Embedding Models
class EmbeddingRequest(BaseModel):
    text: str

class EmbeddingResponse(BaseModel):
    embedding: List[float]


# Search Models
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

class TokenUsage(BaseModel):
    """Token usage information from Gemini API"""
    prompt_token_count: Optional[int] = None
    candidates_token_count: Optional[int] = None
    total_token_count: Optional[int] = None

class GenerateTestCaseRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    preferredType: Optional[str] = None
    preferredPriority: Optional[str] = None
    # RAG Parameters
    useRAG: bool = Field(default=True, description="Enable/disable RAG retrieval")
    ragSimilarityThreshold: float = Field(default=0.7, ge=0.0, le=1.0, description="Minimum similarity threshold for RAG")
    maxRAGReferences: int = Field(default=3, ge=1, le=10, description="Maximum number of RAG references")
    # Token tracking
    includeTokenUsage: bool = Field(default=True, description="Include token usage in response")

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
    # Token usage information
    tokenUsage: Optional[TokenUsage] = None


# Token Estimation Models
class TokenEstimateRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    useRAG: bool = Field(default=True)
    ragSimilarityThreshold: float = Field(default=0.7)
    maxRAGReferences: int = Field(default=3)

class TokenEstimateResponse(BaseModel):
    estimated_input_tokens: int
    estimated_cost_usd: Optional[float] = None
    model_name: str
    note: str


# Statistics Models
class StatisticsResponse(BaseModel):
    total_test_cases: int
    embedded_test_cases: int
    embedding_coverage: float
    model_name: str
    embedding_dimension: int


# Token Info Models
class TokenPricingInfo(BaseModel):
    input_tokens_per_1k: str
    output_tokens_per_1k: str
    currency: str

class TokenLimitsInfo(BaseModel):
    max_input_tokens: int
    max_output_tokens: int

class TokenInfoResponse(BaseModel):
    model: str
    pricing: TokenPricingInfo
    limits: TokenLimitsInfo
    estimation_method: str
    note: str