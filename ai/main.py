#!/usr/bin/env python3
"""
Test Case AI Service - Main Entry Point

A refactored, modular AI service for test case embeddings and semantic search.
Follows clean code principles with separation of concerns.
"""

from app.main import app

if __name__ == "__main__":
    import uvicorn
    from app.config import config
    
    uvicorn.run(
        "main:app",  # Use import string for reload to work
        host=config.SERVICE_HOST, 
        port=config.SERVICE_PORT,
        reload=True  # Enable for development
    )