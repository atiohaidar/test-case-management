from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import mysql.connector
from mysql.connector import Error
import json
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Test Case AI Service",
    description="AI service for test case embeddings and semantic search",
    version="1.0.0"
)

# Initialize the sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

class EmbeddingRequest(BaseModel):
    text: str

class EmbeddingResponse(BaseModel):
    embedding: List[float]

class SearchRequest(BaseModel):
    query: str
    min_similarity: float = Field(default=0.7, ge=0.0, le=1.0)
    limit: int = Field(default=10, ge=1, le=100)

class SearchResult(BaseModel):
    testCase: dict
    similarity: float

class SearchResponse(BaseModel):
    results: List[SearchResult]

class DatabaseConnection:
    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.port = int(os.getenv('DB_PORT', '3306'))
        self.username = os.getenv('DB_USERNAME', 'root')
        self.password = os.getenv('DB_PASSWORD', 'password')
        self.database = os.getenv('DB_DATABASE', 'testcase_management')
        
    def get_connection(self):
        try:
            connection = mysql.connector.connect(
                host=self.host,
                port=self.port,
                user=self.username,
                password=self.password,
                database=self.database
            )
            return connection
        except Error as e:
            logger.error(f"Database connection error: {e}")
            raise HTTPException(status_code=500, detail="Database connection failed")

db = DatabaseConnection()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Service"}

@app.post("/generate-embedding", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest):
    """Generate embedding for given text"""
    try:
        # Generate embedding using sentence transformer
        embedding = model.encode(request.text)
        
        # Convert numpy array to list for JSON serialization
        embedding_list = embedding.tolist()
        
        logger.info(f"Generated embedding for text: {request.text[:50]}...")
        
        return EmbeddingResponse(embedding=embedding_list)
    
    except Exception as e:
        logger.error(f"Embedding generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate embedding")

@app.post("/search", response_model=List[SearchResult])
async def semantic_search(request: SearchRequest):
    """Perform semantic search on test cases"""
    try:
        # Generate embedding for search query
        query_embedding = model.encode(request.query)
        
        # Get all test cases from database
        connection = db.get_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
        SELECT id, name, description, type, priority, steps, expectedResult, tags, embedding, createdAt, updatedAt
        FROM testcases
        WHERE embedding IS NOT NULL AND embedding != ''
        """
        
        cursor.execute(query)
        test_cases = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        if not test_cases:
            return []
        
        # Calculate similarities
        results = []
        
        for test_case in test_cases:
            try:
                # Parse stored embedding
                stored_embedding = json.loads(test_case['embedding'])
                
                if not stored_embedding:
                    continue
                    
                # Calculate cosine similarity
                similarity = cosine_similarity(
                    [query_embedding], 
                    [stored_embedding]
                )[0][0]
                
                # Filter by minimum similarity
                if similarity >= request.min_similarity:
                    # Convert test case data
                    test_case_data = {
                        'id': test_case['id'],
                        'name': test_case['name'],
                        'description': test_case['description'],
                        'type': test_case['type'],
                        'priority': test_case['priority'],
                        'steps': json.loads(test_case['steps']) if test_case['steps'] else [],
                        'expectedResult': test_case['expectedResult'],
                        'tags': json.loads(test_case['tags']) if test_case['tags'] else [],
                        'createdAt': test_case['createdAt'].isoformat() if test_case['createdAt'] else None,
                        'updatedAt': test_case['updatedAt'].isoformat() if test_case['updatedAt'] else None,
                    }
                    
                    results.append(SearchResult(
                        testCase=test_case_data,
                        similarity=float(similarity)
                    ))
                    
            except (json.JSONDecodeError, KeyError) as e:
                logger.warning(f"Skipping test case {test_case.get('id', 'unknown')} due to invalid embedding: {e}")
                continue
        
        # Sort by similarity (highest first) and limit results
        results.sort(key=lambda x: x.similarity, reverse=True)
        results = results[:request.limit]
        
        logger.info(f"Found {len(results)} similar test cases for query: {request.query}")
        
        return results
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform semantic search")

@app.get("/stats")
async def get_statistics():
    """Get AI service statistics"""
    try:
        connection = db.get_connection()
        cursor = connection.cursor()
        
        # Count total test cases
        cursor.execute("SELECT COUNT(*) FROM testcases")
        total_count = cursor.fetchone()[0]
        
        # Count test cases with embeddings
        cursor.execute("SELECT COUNT(*) FROM testcases WHERE embedding IS NOT NULL AND embedding != ''")
        embedded_count = cursor.fetchone()[0]
        
        cursor.close()
        connection.close()
        
        return {
            "total_test_cases": total_count,
            "embedded_test_cases": embedded_count,
            "embedding_coverage": (embedded_count / total_count * 100) if total_count > 0 else 0,
            "model_name": "all-MiniLM-L6-v2",
            "embedding_dimension": 384
        }
        
    except Exception as e:
        logger.error(f"Statistics error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get statistics")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)