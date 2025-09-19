from pydantic import BaseModel, Field
from typing import List, Optional

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