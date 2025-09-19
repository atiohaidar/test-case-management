import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

def detailed_gemini_check():
    """Detailed check of Gemini API response structure"""
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ No API key found")
        return
        
    genai.configure(api_key=api_key)
    
    # Use the latest model that supports usage metadata
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    
    try:
        # Generate content with return_usage flag
        response = model.generate_content(
            "Jelaskan Apa itu RAG",
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=100,
            )
        )
        
        print("📊 Response object type:", type(response))
        print("📊 Response attributes:", [attr for attr in dir(response) if not attr.startswith('_')])
        # print all result of response
        print("📊 Full response:", response)
        # Check specifically for usage metadata
        if hasattr(response, 'usage_metadata'):
            print("✅ Found usage_metadata!")
            usage = response.usage_metadata
            print(f"   Type: {type(usage)}")
            print(f"   Attributes: {[attr for attr in dir(usage) if not attr.startswith('_')]}")
            
            # Try to access token counts
            try:
                print(f"   Prompt tokens: {usage.prompt_token_count}")
                print(f"   Candidates tokens: {usage.candidates_token_count}")  
                print(f"   Total tokens: {usage.total_token_count}")
            except AttributeError as e:
                print(f"   ❌ Could not access token counts: {e}")
        else:
            print("❌ No usage_metadata found")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    detailed_gemini_check()