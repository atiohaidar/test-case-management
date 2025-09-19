from fastapi import APIRouter
from ..models import EmbeddingRequest, EmbeddingResponse
from ..services.service_manager import service_manager
from ..config import logger

router = APIRouter()

@router.post("/generate-embedding", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest):
    """Generate embedding for given text"""
    return service_manager.embedding_service.generate_embedding_from_request(request)

@router.get("/embedding/info")
async def get_embedding_info():
    """Get information about the embedding model"""
    return service_manager.embedding_service.get_model_info()