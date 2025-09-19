import mysql.connector
from mysql.connector import Error
from fastapi import HTTPException
from typing import List, Dict, Any
from ..config import config, logger

class DatabaseService:
    """Database service for handling MySQL connections and operations"""
    
    def __init__(self):
        self.host = config.DB_HOST
        self.port = config.DB_PORT
        self.username = config.DB_USERNAME
        self.password = config.DB_PASSWORD
        self.database = config.DB_DATABASE
        
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
    
    def get_all_test_cases_with_embeddings(self) -> List[Dict[str, Any]]:
        """Get all test cases that have embeddings"""
        try:
            connection = self.get_connection()
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
            
            return test_cases
            
        except Exception as e:
            logger.error(f"Error fetching test cases: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch test cases")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics"""
        try:
            connection = self.get_connection()
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
            }
            
        except Exception as e:
            logger.error(f"Error getting statistics: {e}")
            raise HTTPException(status_code=500, detail="Failed to get statistics")