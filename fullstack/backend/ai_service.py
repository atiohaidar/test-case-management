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
        """Perform semantic search on test cases using optimized matrix operations"""
        try:
            # Generate embedding for search query
            query_embedding = self.model.encode(query)

            # Get all test cases from database
            test_cases = self.db.get_test_cases_for_embedding()

            if not test_cases:
                return []

            # Prepare embeddings for bulk calculation
            embeddings = []
            valid_tc_indices = []
            
            for i, tc in enumerate(test_cases):
                try:
                    stored_embedding = json.loads(tc['embedding'])
                    if stored_embedding and len(stored_embedding) == self.embedding_dimension:
                        embeddings.append(stored_embedding)
                        valid_tc_indices.append(i)
                except (json.JSONDecodeError, KeyError, TypeError):
                    continue

            if not embeddings:
                return []

            # Bulk calculate cosine similarity using NumPy
            # cosine_similarity expects [n_samples_a, n_features] and [n_samples_b, n_features]
            similarities = cosine_similarity(
                [query_embedding],
                embeddings
            )[0]

            # Filter and format results
            results = []
            for idx, similarity in zip(valid_tc_indices, similarities):
                if similarity >= min_similarity:
                    tc = test_cases[idx]
                    
                    # Convert test case data (reuse logic but cleaner)
                    test_case_data = {
                        'id': tc['id'],
                        'name': tc['name'],
                        'description': tc['description'],
                        'type': tc['type'],
                        'priority': tc['priority'],
                        'steps': json.loads(tc['steps']) if isinstance(tc['steps'], str) else tc['steps'],
                        'expectedResult': tc['expectedResult'],
                        'tags': json.loads(tc['tags']) if isinstance(tc['tags'], str) else tc['tags'],
                        'createdAt': tc['createdAt'] if isinstance(tc['createdAt'], str) else tc['createdAt'].isoformat() if tc['createdAt'] else None,
                        'updatedAt': tc['updatedAt'] if isinstance(tc['updatedAt'], str) else tc['updatedAt'].isoformat() if tc['updatedAt'] else None,
                        'aiGenerated': bool(tc.get('aiGenerated', False)),
                        'referencesCount': 0,
                    }

                    results.append({
                        'similarity': float(similarity),
                        'testCase': test_case_data
                    })

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
