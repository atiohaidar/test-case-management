"""
Database operations for Flask backend.
Handles MySQL connections and queries for test case data.
"""

import mysql.connector
from mysql.connector import Error
import os
import logging
import json
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class DatabaseConnection:
    """Handles MySQL database connections and operations"""

    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.port = int(os.getenv('DB_PORT', '3306'))
        self.username = os.getenv('DB_USERNAME', 'root')
        self.password = os.getenv('DB_PASSWORD', 'password')
        self.database = os.getenv('DB_DATABASE', 'testcase_management')

    def get_connection(self):
        """Get a database connection"""
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
            raise Exception("Database connection failed")

    def init_database(self):
        """Initialize database tables if they don't exist"""
        connection = self.get_connection()
        cursor = connection.cursor()
        
        try:
            # Create testcases table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS testcases (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    type ENUM('positive', 'negative') NOT NULL DEFAULT 'positive',
                    priority ENUM('high', 'medium', 'low') NOT NULL DEFAULT 'medium',
                    steps JSON,
                    expectedResult TEXT NOT NULL,
                    tags JSON,
                    embedding TEXT,
                    aiGenerated BOOLEAN DEFAULT FALSE,
                    originalPrompt TEXT,
                    aiConfidence FLOAT,
                    aiSuggestions TEXT,
                    aiGenerationMethod VARCHAR(50),
                    tokenUsage JSON,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
            
            # Create testcase_references table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS testcase_references (
                    id VARCHAR(50) PRIMARY KEY,
                    sourceId VARCHAR(50) NOT NULL,
                    targetId VARCHAR(50) NOT NULL,
                    similarityScore FLOAT,
                    referenceType VARCHAR(50) NOT NULL,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (sourceId) REFERENCES testcases(id) ON DELETE CASCADE,
                    FOREIGN KEY (targetId) REFERENCES testcases(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_reference (sourceId, targetId)
                )
            """)
            
            connection.commit()
            logger.info("Database tables initialized successfully")
        except Error as e:
            logger.error(f"Database initialization error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    # ==================== TEST CASE OPERATIONS ====================

    def get_all_testcases(self) -> List[Dict[str, Any]]:
        """Get all test cases"""
        connection = self.get_connection()
        cursor = connection.cursor(dictionary=True)

        try:
            cursor.execute("""
                SELECT * FROM testcases ORDER BY createdAt DESC
            """)
            return cursor.fetchall()
        except Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def get_testcase_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        """Get a test case by ID"""
        connection = self.get_connection()
        cursor = connection.cursor(dictionary=True)

        try:
            cursor.execute("SELECT * FROM testcases WHERE id = %s", (id,))
            return cursor.fetchone()
        except Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def create_testcase(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new test case"""
        connection = self.get_connection()
        cursor = connection.cursor(dictionary=True)

        try:
            cursor.execute("""
                INSERT INTO testcases (id, name, description, type, priority, steps, expectedResult, tags, embedding, aiGenerated, originalPrompt, aiConfidence, aiSuggestions, aiGenerationMethod, tokenUsage)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                data['id'],
                data['name'],
                data['description'],
                data.get('type', 'positive'),
                data.get('priority', 'medium'),
                data.get('steps', '[]'),
                data.get('expectedResult', ''),
                data.get('tags', '[]'),
                data.get('embedding'),
                data.get('aiGenerated', False),
                data.get('originalPrompt'),
                data.get('aiConfidence'),
                data.get('aiSuggestions'),
                data.get('aiGenerationMethod'),
                data.get('tokenUsage'),
            ))
            connection.commit()
            
            return self.get_testcase_by_id(data['id'])
        except Error as e:
            logger.error(f"Database insert error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def update_testcase(self, id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a test case"""
        connection = self.get_connection()
        cursor = connection.cursor(dictionary=True)

        try:
            cursor.execute("""
                UPDATE testcases 
                SET name = %s, description = %s, type = %s, priority = %s, steps = %s, expectedResult = %s, tags = %s, embedding = %s
                WHERE id = %s
            """, (
                data['name'],
                data['description'],
                data['type'],
                data['priority'],
                data['steps'],
                data['expectedResult'],
                data['tags'],
                data.get('embedding'),
                id,
            ))
            connection.commit()
            
            return self.get_testcase_by_id(id)
        except Error as e:
            logger.error(f"Database update error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def delete_testcase(self, id: str):
        """Delete a test case"""
        connection = self.get_connection()
        cursor = connection.cursor()

        try:
            cursor.execute("DELETE FROM testcases WHERE id = %s", (id,))
            connection.commit()
        except Error as e:
            logger.error(f"Database delete error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def get_test_cases_for_embedding(self) -> List[Dict[str, Any]]:
        """Get all test cases that have embeddings for semantic search"""
        connection = self.get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT id, name, description, type, priority, steps, expectedResult, tags, embedding, createdAt, updatedAt
        FROM testcases
        WHERE embedding IS NOT NULL AND embedding != ''
        """

        try:
            cursor.execute(query)
            return cursor.fetchall()
        except Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def get_test_case_count(self) -> int:
        """Get total count of test cases"""
        connection = self.get_connection()
        cursor = connection.cursor()

        try:
            cursor.execute("SELECT COUNT(*) FROM testcases")
            count = cursor.fetchone()[0]
            return count
        except Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def get_embedded_test_case_count(self) -> int:
        """Get count of test cases with embeddings"""
        connection = self.get_connection()
        cursor = connection.cursor()

        try:
            cursor.execute("SELECT COUNT(*) FROM testcases WHERE embedding IS NOT NULL AND embedding != ''")
            count = cursor.fetchone()[0]
            return count
        except Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    # ==================== REFERENCE OPERATIONS ====================

    def get_reference_counts(self, testcase_id: str) -> Dict[str, int]:
        """Get reference counts for a test case"""
        connection = self.get_connection()
        cursor = connection.cursor(dictionary=True)

        try:
            # References (outgoing)
            cursor.execute("SELECT COUNT(*) as count FROM testcase_references WHERE sourceId = %s", (testcase_id,))
            references_count = cursor.fetchone()['count']

            # Referenced by (incoming)
            cursor.execute("SELECT COUNT(*) as count FROM testcase_references WHERE targetId = %s", (testcase_id,))
            referenced_by_count = cursor.fetchone()['count']

            # RAG references
            cursor.execute("SELECT COUNT(*) as count FROM testcase_references WHERE sourceId = %s AND referenceType = 'rag_retrieval'", (testcase_id,))
            rag_count = cursor.fetchone()['count']

            # Manual references
            cursor.execute("SELECT COUNT(*) as count FROM testcase_references WHERE sourceId = %s AND referenceType = 'manual'", (testcase_id,))
            manual_count = cursor.fetchone()['count']

            # Derived from (semantic search)
            cursor.execute("SELECT COUNT(*) as count FROM testcase_references WHERE sourceId = %s AND referenceType = 'semantic_search'", (testcase_id,))
            derived_count = cursor.fetchone()['count']

            return {
                'references_count': references_count,
                'referenced_by_count': referenced_by_count,
                'rag_references_count': rag_count,
                'manual_references_count': manual_count,
                'derived_from_count': derived_count,
            }
        except Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def get_references(self, testcase_id: str) -> List[Dict[str, Any]]:
        """Get all references from a test case (outgoing)"""
        connection = self.get_connection()
        cursor = connection.cursor(dictionary=True)

        try:
            cursor.execute("""
                SELECT r.id, r.targetId, r.similarityScore, r.referenceType,
                       t.id as target_id, t.name as target_name, t.type as target_type, t.priority as target_priority
                FROM testcase_references r
                JOIN testcases t ON r.targetId = t.id
                WHERE r.sourceId = %s
            """, (testcase_id,))
            
            results = []
            for row in cursor.fetchall():
                results.append({
                    'id': row['id'],
                    'targetId': row['targetId'],
                    'similarityScore': row['similarityScore'],
                    'referenceType': row['referenceType'],
                    'target': {
                        'id': row['target_id'],
                        'name': row['target_name'],
                        'type': row['target_type'],
                        'priority': row['target_priority'],
                    }
                })
            return results
        except Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def get_referenced_by(self, testcase_id: str) -> List[Dict[str, Any]]:
        """Get all references to a test case (incoming)"""
        connection = self.get_connection()
        cursor = connection.cursor(dictionary=True)

        try:
            cursor.execute("""
                SELECT r.id, r.sourceId, r.similarityScore, r.referenceType,
                       t.id as source_id, t.name as source_name, t.type as source_type, t.priority as source_priority
                FROM testcase_references r
                JOIN testcases t ON r.sourceId = t.id
                WHERE r.targetId = %s
            """, (testcase_id,))
            
            results = []
            for row in cursor.fetchall():
                results.append({
                    'id': row['id'],
                    'sourceId': row['sourceId'],
                    'similarityScore': row['similarityScore'],
                    'referenceType': row['referenceType'],
                    'source': {
                        'id': row['source_id'],
                        'name': row['source_name'],
                        'type': row['source_type'],
                        'priority': row['source_priority'],
                    }
                })
            return results
        except Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def get_derived_testcases(self, testcase_id: str) -> List[Dict[str, Any]]:
        """Get test cases derived from this one"""
        connection = self.get_connection()
        cursor = connection.cursor(dictionary=True)

        try:
            cursor.execute("""
                SELECT t.id, t.name, t.type, t.priority, t.createdAt, t.aiGenerated,
                       r.id as ref_id, r.referenceType, r.similarityScore, r.createdAt as ref_createdAt
                FROM testcase_references r
                JOIN testcases t ON r.sourceId = t.id
                WHERE r.targetId = %s
            """, (testcase_id,))
            
            results = []
            for row in cursor.fetchall():
                results.append({
                    'id': row['id'],
                    'name': row['name'],
                    'type': row['type'],
                    'priority': row['priority'],
                    'createdAt': row['createdAt'].isoformat() if row['createdAt'] else None,
                    'aiGenerated': bool(row['aiGenerated']),
                    'referenceInfo': {
                        'id': row['ref_id'],
                        'referenceType': row['referenceType'],
                        'similarityScore': row['similarityScore'],
                        'createdAt': row['ref_createdAt'].isoformat() if row['ref_createdAt'] else None,
                    }
                })
            return results
        except Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def create_reference(self, source_id: str, target_id: str, reference_type: str, similarity_score: float = None):
        """Create a reference between two test cases"""
        connection = self.get_connection()
        cursor = connection.cursor()

        import uuid
        ref_id = str(uuid.uuid4()).replace('-', '')[:25]

        try:
            cursor.execute("""
                INSERT INTO testcase_references (id, sourceId, targetId, referenceType, similarityScore)
                VALUES (%s, %s, %s, %s, %s)
            """, (ref_id, source_id, target_id, reference_type, similarity_score))
            connection.commit()
        except Error as e:
            if 'Duplicate entry' in str(e):
                logger.warning(f"Reference already exists: {source_id} -> {target_id}")
            else:
                logger.error(f"Database insert error: {e}")
                raise
        finally:
            cursor.close()
            connection.close()

    def delete_reference(self, reference_id: str):
        """Delete a reference"""
        connection = self.get_connection()
        cursor = connection.cursor()

        try:
            cursor.execute("DELETE FROM testcase_references WHERE id = %s", (reference_id,))
            connection.commit()
        except Error as e:
            logger.error(f"Database delete error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()
