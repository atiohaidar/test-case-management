"""
AI/ML service for embeddings and semantic search.
Handles sentence transformer operations and similarity calculations.
Separated from main.py for better organization and maintainability.
"""

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import json
import logging
import os
from typing import List, Dict, Any
from fastapi import HTTPException

from models import EmbeddingRequest, EmbeddingResponse, SearchRequest, SearchResult
from services.database import db

logger = logging.getLogger(__name__)


class AIService:
    """Handles AI/ML operations for embeddings and semantic search"""

    def __init__(self):
        # Initialize the sentence transformer model using environment variable
        model_name = os.getenv('MODEL_NAME', 'all-MiniLM-L6-v2')
        self.model = SentenceTransformer(model_name)
        logger.info(f"Sentence transformer model initialized: {model_name}")

        # Store model configuration
        self.model_name = model_name
        self.embedding_dimension = int(os.getenv('EMBEDDING_DIMENSION', '384'))

    def generate_embedding(self, request: EmbeddingRequest) -> EmbeddingResponse:
        """Generate embedding for given text"""
        try:
            # Generate embedding using sentence transformer
            embedding = self.model.encode(request.text)

            # Convert numpy array to list for JSON serialization
            embedding_list = embedding.tolist()

            logger.info(f"Generated embedding for text: {request.text[:50]}...")

            return EmbeddingResponse(embedding=embedding_list)

        except Exception as e:
            logger.error(f"Embedding generation error: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate embedding")

    def semantic_search(self, request: SearchRequest) -> List[SearchResult]:
        """Perform semantic search on test cases"""
        try:
            # Generate embedding for search query
            query_embedding = self.model.encode(request.query)

            # Get all test cases from database
            test_cases = db.get_test_cases_for_embedding()

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

    def get_statistics(self) -> Dict[str, Any]:
        """Get AI service statistics"""
        try:
            total_count = db.get_test_case_count()
            embedded_count = db.get_embedded_test_case_count()

            return {
                "total_test_cases": total_count,
                "embedded_test_cases": embedded_count,
                "embedding_coverage": (embedded_count / total_count * 100) if total_count > 0 else 0,
                "model_name": self.model_name,
                "embedding_dimension": self.embedding_dimension
            }

        except Exception as e:
            logger.error(f"Statistics error: {e}")
            raise HTTPException(status_code=500, detail="Failed to get statistics")


# Global AI service instance
ai_service = AIService()