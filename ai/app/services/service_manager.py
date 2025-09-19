"""
Service Manager for AI Service

Manages singleton instances of all services to prevent multiple initializations
and ensure efficient resource usage.
"""

from typing import Optional
from .database_service import DatabaseService
from .embedding_service import EmbeddingService
from .search_service import SearchService
from .ai_generation_service import AIGenerationService
from ..config import logger

class ServiceManager:
    """Singleton service manager for all AI services"""
    
    _instance: Optional['ServiceManager'] = None
    _initialized: bool = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ServiceManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._database_service: Optional[DatabaseService] = None
            self._embedding_service: Optional[EmbeddingService] = None
            self._search_service: Optional[SearchService] = None
            self._ai_service: Optional[AIGenerationService] = None
            ServiceManager._initialized = True
            logger.info("Service manager initialized")
    
    @property
    def database_service(self) -> DatabaseService:
        if self._database_service is None:
            self._database_service = DatabaseService()
            logger.info("Database service initialized")
        return self._database_service
    
    @property 
    def embedding_service(self) -> EmbeddingService:
        if self._embedding_service is None:
            self._embedding_service = EmbeddingService()
            # Note: EmbeddingService logs its own initialization
        return self._embedding_service
    
    @property
    def search_service(self) -> SearchService:
        if self._search_service is None:
            # Pass existing services to avoid multiple initializations
            self._search_service = SearchService(
                database_service=self.database_service,
                embedding_service=self.embedding_service
            )
            logger.info("Search service initialized")
        return self._search_service
    
    @property
    def ai_service(self) -> AIGenerationService:
        if self._ai_service is None:
            # Pass existing search service to avoid multiple initializations
            self._ai_service = AIGenerationService(search_service=self.search_service)
            logger.info("AI generation service initialized")
        return self._ai_service

# Global service manager instance
service_manager = ServiceManager()