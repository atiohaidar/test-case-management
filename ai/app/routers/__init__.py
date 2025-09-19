from .embedding_router import router as embedding_router
from .search_router import router as search_router  
from .ai_router import router as ai_router
from .stats_router import router as stats_router

__all__ = [
    "embedding_router",
    "search_router", 
    "ai_router",
    "stats_router"
]