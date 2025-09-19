from fastapi import FastAPI
from app.config import config
from app.routers import (
    embedding_router,
    search_router, 
    ai_router,
    stats_router
)

def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    
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
    
    # Include routers
    app.include_router(embedding_router)
    app.include_router(search_router)
    app.include_router(ai_router)
    app.include_router(stats_router)
    
    return app

# Create app instance
app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=config.SERVICE_HOST, port=config.SERVICE_PORT)