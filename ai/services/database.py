"""
Database operations for AI service.
Handles MySQL connections and queries for test case data.
Separated from main.py for better organization and maintainability.
"""

import mysql.connector
from mysql.connector import Error
import os
import logging
from typing import List, Dict, Any, Optional
from fastapi import HTTPException

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
            raise HTTPException(status_code=500, detail="Database connection failed")

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
            test_cases = cursor.fetchall()
            return test_cases
        except Error as e:
            logger.error(f"Database query error: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch test cases")
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
            raise HTTPException(status_code=500, detail="Failed to get test case count")
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
            raise HTTPException(status_code=500, detail="Failed to get embedded test case count")
        finally:
            cursor.close()
            connection.close()

    def test_connection(self) -> bool:
        """Test database connection"""
        try:
            connection = self.get_connection()
            cursor = connection.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
            connection.close()
            return True
        except Error:
            return False


# Global database instance
db = DatabaseConnection()