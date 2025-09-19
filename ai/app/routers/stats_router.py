from fastapi import APIRouter
from ..services.service_manager import service_manager
from ..config import config

router = APIRouter()

@router.get("/stats")
async def get_statistics():
    """Get AI service statistics"""
    stats = service_manager.database_service.get_statistics()
    
    # Add model information
    stats.update({
        "model_name": config.SENTENCE_TRANSFORMER_MODEL,
        "embedding_dimension": config.EMBEDDING_DIMENSION
    })
    
    return stats