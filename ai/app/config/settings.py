import os
import logging
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Config:
    """Configuration class for AI service"""
    
    # Database configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', '3306'))
    DB_USERNAME = os.getenv('DB_USERNAME', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
    DB_DATABASE = os.getenv('DB_DATABASE', 'testcase_management')
    
    # AI Model configuration
    SENTENCE_TRANSFORMER_MODEL = 'all-MiniLM-L6-v2'
    EMBEDDING_DIMENSION = 384
    
    # Gemini AI configuration
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    GEMINI_MODEL = 'gemini-1.5-flash'
    
    # Service configuration
    SERVICE_HOST = os.getenv('SERVICE_HOST', '0.0.0.0')
    SERVICE_PORT = int(os.getenv('SERVICE_PORT', '8000'))
    
    @classmethod
    def setup_gemini(cls):
        """Initialize Gemini AI if API key is available"""
        if cls.GEMINI_API_KEY:
            genai.configure(api_key=cls.GEMINI_API_KEY)
            logger.info("Gemini AI configured successfully")
            return True
        else:
            logger.warning("Gemini API key not found - AI generation will not be available")
            return False

config = Config()