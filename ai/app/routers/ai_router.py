from fastapi import APIRouter
from ..models import GenerateTestCaseRequest, GenerateTestCaseResponse
from ..services.service_manager import service_manager

router = APIRouter()

@router.post("/generate-test-case", response_model=GenerateTestCaseResponse)
async def generate_test_case_with_ai(request: GenerateTestCaseRequest):
    """Generate a test case using Gemini AI with optional RAG"""
    return await service_manager.ai_service.generate_test_case(request)