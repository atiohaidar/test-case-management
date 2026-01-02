"""
AI/ML service for embeddings and semantic search.
Handles sentence transformer operations and similarity calculations.
"""

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import json
import logging
import os
from typing import List, Dict, Any

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
        
        # Database reference (set later)
        self._db = None
    
    def set_database(self, db):
        """Set database reference for queries"""
        self._db = db
    
    @property
    def db(self):
        if self._db is None:
            from database import DatabaseConnection
            self._db = DatabaseConnection()
        return self._db

    def generate_embedding_vector(self, text: str) -> List[float]:
        """Generate embedding for given text and return as list"""
        try:
            embedding = self.model.encode(text)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Embedding generation error: {e}")
            return []

    def generate_embedding(self, text: str) -> Dict[str, Any]:
        """Generate embedding for given text"""
        try:
            embedding = self.model.encode(text)
            embedding_list = embedding.tolist()
            logger.info(f"Generated embedding for text: {text[:50]}...")
            return {'embedding': embedding_list}
        except Exception as e:
            logger.error(f"Embedding generation error: {e}")
            raise Exception("Failed to generate embedding")

    def semantic_search(self, query: str, min_similarity: float = 0.7, limit: int = 10) -> List[Dict[str, Any]]:
        """Perform semantic search on test cases"""
        try:
            # Generate embedding for search query
            query_embedding = self.model.encode(query)

            # Get all test cases from database
            test_cases = self.db.get_test_cases_for_embedding()

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
                    if similarity >= min_similarity:
                        # Convert test case data
                        test_case_data = {
                            'id': test_case['id'],
                            'name': test_case['name'],
                            'description': test_case['description'],
                            'type': test_case['type'],
                            'priority': test_case['priority'],
                            'steps': json.loads(test_case['steps']) if isinstance(test_case['steps'], str) else test_case['steps'],
                            'expectedResult': test_case['expectedResult'],
                            'tags': json.loads(test_case['tags']) if isinstance(test_case['tags'], str) else test_case['tags'],
                            'createdAt': test_case['createdAt'].isoformat() if test_case['createdAt'] else None,
                            'updatedAt': test_case['updatedAt'].isoformat() if test_case['updatedAt'] else None,
                            'aiGenerated': False,
                            'referencesCount': 0,
                            'referencedByCount': 0,
                            'ragReferencesCount': 0,
                            'manualReferencesCount': 0,
                            'derivedFromCount': 0,
                        }

                        results.append({
                            'similarity': float(similarity),
                            'testCase': test_case_data
                        })

                except (json.JSONDecodeError, KeyError) as e:
                    logger.warning(f"Skipping test case {test_case.get('id', 'unknown')} due to invalid embedding: {e}")
                    continue

            # Sort by similarity (highest first) and limit results
            results.sort(key=lambda x: x['similarity'], reverse=True)
            results = results[:limit]

            logger.info(f"Found {len(results)} similar test cases for query: {query}")

            return results

        except Exception as e:
            logger.error(f"Search error: {e}")
            raise Exception("Failed to perform semantic search")

    def get_statistics(self) -> Dict[str, Any]:
        """Get AI service statistics"""
        try:
            total_count = self.db.get_test_case_count()
            embedded_count = self.db.get_embedded_test_case_count()

            return {
                "total_test_cases": total_count,
                "embedded_test_cases": embedded_count,
                "embedding_coverage": (embedded_count / total_count * 100) if total_count > 0 else 0,
                "model_name": self.model_name,
                "embedding_dimension": self.embedding_dimension
            }

        except Exception as e:
            logger.error(f"Statistics error: {e}")
            raise Exception("Failed to get statistics")
