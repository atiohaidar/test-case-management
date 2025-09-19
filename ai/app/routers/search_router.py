from fastapi import APIRouter
from typing import List
from ..models import SearchRequest, SearchResult
from ..services.service_manager import service_manager

router = APIRouter()

@router.post("/search", response_model=List[SearchResult])
async def semantic_search(request: SearchRequest):
    """Perform semantic search on test cases"""
    return service_manager.search_service.search(request)