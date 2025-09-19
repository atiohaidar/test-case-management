from pydantic import BaseModel, Field
from typing import List, Optional

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