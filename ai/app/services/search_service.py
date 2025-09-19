import json
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import HTTPException
from typing import List
from ..config import logger
from ..models import SearchRequest, SearchResult
from .database_service import DatabaseService
from .embedding_service import EmbeddingService

class SearchService:
    """Service for handling semantic search operations"""
    
    def __init__(self, database_service: DatabaseService = None, embedding_service: EmbeddingService = None):
        self.database_service = database_service or DatabaseService()
        self.embedding_service = embedding_service or EmbeddingService()
    
    def search(self, request: SearchRequest) -> List[SearchResult]:
        """Perform semantic search on test cases"""
        try:
            # Generate embedding for search query
            query_embedding = self.embedding_service.generate_embedding(request.query)
            
            # Get all test cases from database
            test_cases = self.database_service.get_all_test_cases_with_embeddings()
            
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
                        test_case_data = self._format_test_case(test_case)
                        
                        results.append(SearchResult(
                            similarity=float(similarity),
                            testCase=test_case_data
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
    
    def _format_test_case(self, test_case: dict) -> dict:
        """Format test case data for response"""
        return {
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