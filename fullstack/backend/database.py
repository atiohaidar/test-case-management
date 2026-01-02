"""
Database operations for Flask backend.
Handles SQLite connections and queries for test case data.
No Docker or external database required - uses a local SQLite file.
"""

import sqlite3
import os
import logging
import json
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


def dict_factory(cursor, row):
    """Convert SQLite row to dictionary"""
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


class DatabaseConnection:
    """Handles SQLite database connections and operations"""

    def __init__(self):
        # SQLite database file path - defaults to 'testcase.db' in the backend folder
        self.db_path = os.getenv('DB_PATH', os.path.join(os.path.dirname(__file__), 'testcase.db'))
        # Initialize database on startup
        self.init_database()

    def get_connection(self):
        """Get a database connection"""
        try:
            connection = sqlite3.connect(self.db_path)
            connection.row_factory = dict_factory
            # Enable foreign keys
            connection.execute("PRAGMA foreign_keys = ON")
            return connection
        except sqlite3.Error as e:
            logger.error(f"Database connection error: {e}")
            raise Exception("Database connection failed")

    def init_database(self):
        """Initialize database tables if they don't exist"""
        connection = sqlite3.connect(self.db_path)
        cursor = connection.cursor()
        
        try:
            # Enable foreign keys
            cursor.execute("PRAGMA foreign_keys = ON")
            
            # Create testcases table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS testcases (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL,
                    type TEXT NOT NULL DEFAULT 'positive' CHECK(type IN ('positive', 'negative')),
                    priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('high', 'medium', 'low')),
                    steps TEXT,
                    expectedResult TEXT NOT NULL,
                    tags TEXT,
                    embedding TEXT,
                    aiGenerated INTEGER DEFAULT 0,
                    originalPrompt TEXT,
                    aiConfidence REAL,
                    aiSuggestions TEXT,
                    aiGenerationMethod TEXT,
                    tokenUsage TEXT,
                    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create testcase_references table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS testcase_references (
                    id TEXT PRIMARY KEY,
                    sourceId TEXT NOT NULL,
                    targetId TEXT NOT NULL,
                    similarityScore REAL,
                    referenceType TEXT NOT NULL,
                    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (sourceId) REFERENCES testcases(id) ON DELETE CASCADE,
                    FOREIGN KEY (targetId) REFERENCES testcases(id) ON DELETE CASCADE,
                    UNIQUE (sourceId, targetId)
                )
            """)
            
            # Create trigger to update updatedAt on testcases
            cursor.execute("""
                CREATE TRIGGER IF NOT EXISTS update_testcase_timestamp 
                AFTER UPDATE ON testcases
                FOR EACH ROW
                BEGIN
                    UPDATE testcases SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
                END
            """)
            
            connection.commit()
            logger.info(f"SQLite database initialized at {self.db_path}")
        except sqlite3.Error as e:
            logger.error(f"Database initialization error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    # ==================== TEST CASE OPERATIONS ====================

    def get_all_testcases(self) -> List[Dict[str, Any]]:
        """Get all test cases"""
        connection = self.get_connection()
        cursor = connection.cursor()

        try:
            cursor.execute("""
                SELECT * FROM testcases ORDER BY createdAt DESC
            """)
            return cursor.fetchall()
        except sqlite3.Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def get_testcase_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        """Get a test case by ID"""
        connection = self.get_connection()
        cursor = connection.cursor()

        try:
            cursor.execute("SELECT * FROM testcases WHERE id = ?", (id,))
            return cursor.fetchone()
        except sqlite3.Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def create_testcase(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new test case"""
        connection = self.get_connection()
        cursor = connection.cursor()

        try:
            cursor.execute("""
                INSERT INTO testcases (id, name, description, type, priority, steps, expectedResult, tags, embedding, aiGenerated, originalPrompt, aiConfidence, aiSuggestions, aiGenerationMethod, tokenUsage)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                1 if data.get('aiGenerated', False) else 0,
                data.get('originalPrompt'),
                data.get('aiConfidence'),
                data.get('aiSuggestions'),
                data.get('aiGenerationMethod'),
                data.get('tokenUsage'),
            ))
            connection.commit()
            
            return self.get_testcase_by_id(data['id'])
        except sqlite3.Error as e:
            logger.error(f"Database insert error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def update_testcase(self, id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a test case"""
        connection = self.get_connection()
        cursor = connection.cursor()

        try:
            cursor.execute("""
                UPDATE testcases 
                SET name = ?, description = ?, type = ?, priority = ?, steps = ?, expectedResult = ?, tags = ?, embedding = ?
                WHERE id = ?
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
        except sqlite3.Error as e:
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
            cursor.execute("DELETE FROM testcases WHERE id = ?", (id,))
            connection.commit()
        except sqlite3.Error as e:
            logger.error(f"Database delete error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def get_test_cases_for_embedding(self) -> List[Dict[str, Any]]:
        """Get all test cases that have embeddings for semantic search"""
        connection = self.get_connection()
        cursor = connection.cursor()

        query = """
        SELECT id, name, description, type, priority, steps, expectedResult, tags, embedding, createdAt, updatedAt
        FROM testcases
        WHERE embedding IS NOT NULL AND embedding != ''
        """

        try:
            cursor.execute(query)
            return cursor.fetchall()
        except sqlite3.Error as e:
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
            cursor.execute("SELECT COUNT(*) as count FROM testcases")
            result = cursor.fetchone()
            return result['count'] if result else 0
        except sqlite3.Error as e:
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
            cursor.execute("SELECT COUNT(*) as count FROM testcases WHERE embedding IS NOT NULL AND embedding != ''")
            result = cursor.fetchone()
            return result['count'] if result else 0
        except sqlite3.Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    # ==================== REFERENCE OPERATIONS ====================

    def get_reference_counts(self, testcase_id: str) -> Dict[str, int]:
        """Get reference counts for a test case"""
        connection = self.get_connection()
        cursor = connection.cursor()

        try:
            # References (outgoing)
            cursor.execute("SELECT COUNT(*) as count FROM testcase_references WHERE sourceId = ?", (testcase_id,))
            references_count = cursor.fetchone()['count']

            # Referenced by (incoming)
            cursor.execute("SELECT COUNT(*) as count FROM testcase_references WHERE targetId = ?", (testcase_id,))
            referenced_by_count = cursor.fetchone()['count']

            # RAG references
            cursor.execute("SELECT COUNT(*) as count FROM testcase_references WHERE sourceId = ? AND referenceType = 'rag_retrieval'", (testcase_id,))
            rag_count = cursor.fetchone()['count']

            # Manual references
            cursor.execute("SELECT COUNT(*) as count FROM testcase_references WHERE sourceId = ? AND referenceType = 'manual'", (testcase_id,))
            manual_count = cursor.fetchone()['count']

            # Derived from (semantic search)
            cursor.execute("SELECT COUNT(*) as count FROM testcase_references WHERE sourceId = ? AND referenceType = 'semantic_search'", (testcase_id,))
            derived_count = cursor.fetchone()['count']

            return {
                'references_count': references_count,
                'referenced_by_count': referenced_by_count,
                'rag_references_count': rag_count,
                'manual_references_count': manual_count,
                'derived_from_count': derived_count,
            }
        except sqlite3.Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def get_references(self, testcase_id: str) -> List[Dict[str, Any]]:
        """Get all references from a test case (outgoing)"""
        connection = self.get_connection()
        cursor = connection.cursor()

        try:
            cursor.execute("""
                SELECT r.id, r.targetId, r.similarityScore, r.referenceType,
                       t.id as target_id, t.name as target_name, t.type as target_type, t.priority as target_priority
                FROM testcase_references r
                JOIN testcases t ON r.targetId = t.id
                WHERE r.sourceId = ?
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
        except sqlite3.Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def get_referenced_by(self, testcase_id: str) -> List[Dict[str, Any]]:
        """Get all references to a test case (incoming)"""
        connection = self.get_connection()
        cursor = connection.cursor()

        try:
            cursor.execute("""
                SELECT r.id, r.sourceId, r.similarityScore, r.referenceType,
                       t.id as source_id, t.name as source_name, t.type as source_type, t.priority as source_priority
                FROM testcase_references r
                JOIN testcases t ON r.sourceId = t.id
                WHERE r.targetId = ?
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
        except sqlite3.Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()

    def get_derived_testcases(self, testcase_id: str) -> List[Dict[str, Any]]:
        """Get test cases derived from this one"""
        connection = self.get_connection()
        cursor = connection.cursor()

        try:
            cursor.execute("""
                SELECT t.id, t.name, t.type, t.priority, t.createdAt, t.aiGenerated,
                       r.id as ref_id, r.referenceType, r.similarityScore, r.createdAt as ref_createdAt
                FROM testcase_references r
                JOIN testcases t ON r.sourceId = t.id
                WHERE r.targetId = ?
            """, (testcase_id,))
            
            results = []
            for row in cursor.fetchall():
                results.append({
                    'id': row['id'],
                    'name': row['name'],
                    'type': row['type'],
                    'priority': row['priority'],
                    'createdAt': row['createdAt'] if row['createdAt'] else None,
                    'aiGenerated': bool(row['aiGenerated']),
                    'referenceInfo': {
                        'id': row['ref_id'],
                        'referenceType': row['referenceType'],
                        'similarityScore': row['similarityScore'],
                        'createdAt': row['ref_createdAt'] if row['ref_createdAt'] else None,
                    }
                })
            return results
        except sqlite3.Error as e:
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
                VALUES (?, ?, ?, ?, ?)
            """, (ref_id, source_id, target_id, reference_type, similarity_score))
            connection.commit()
        except sqlite3.IntegrityError as e:
            # SQLite UNIQUE constraint violation
            logger.warning(f"Reference already exists: {source_id} -> {target_id}")
        except sqlite3.Error as e:
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
            cursor.execute("DELETE FROM testcase_references WHERE id = ?", (reference_id,))
            connection.commit()
        except sqlite3.Error as e:
            logger.error(f"Database delete error: {e}")
            raise
        finally:
            cursor.close()
            connection.close()
