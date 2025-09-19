import numpy as np
from sentence_transformers import SentenceTransformer
from fastapi import HTTPException
from typing import List
from ..config import config, logger
from ..models import EmbeddingRequest, EmbeddingResponse

class EmbeddingService:
    """Service for handling text embeddings using SentenceTransformers"""
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self.model = SentenceTransformer(config.SENTENCE_TRANSFORMER_MODEL)
            logger.info(f"Embedding service initialized with model: {config.SENTENCE_TRANSFORMER_MODEL}")
            EmbeddingService._initialized = True
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for given text"""
        try:
            # Generate embedding using sentence transformer
            embedding = self.model.encode(text)
            
            # Convert numpy array to list for JSON serialization
            embedding_list = embedding.tolist()
            
            logger.info(f"Generated embedding for text: {text[:50]}...")
            
            return embedding_list
            
        except Exception as e:
            logger.error(f"Embedding generation error: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate embedding")
    
    def generate_embedding_from_request(self, request: EmbeddingRequest) -> EmbeddingResponse:
        """Generate embedding from API request"""
        embedding = self.generate_embedding(request.text)
        return EmbeddingResponse(embedding=embedding)
    
    def get_model_info(self) -> dict:
        """Get information about the embedding model"""
        return {
            "model_name": config.SENTENCE_TRANSFORMER_MODEL,
            "embedding_dimension": config.EMBEDDING_DIMENSION
        }