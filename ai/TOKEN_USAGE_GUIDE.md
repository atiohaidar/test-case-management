# Token Usage Monitoring untuk Gemini API

## Overview
AI service sekarang mendukung monitoring dan estimasi penggunaan token untuk Gemini API, membantu mengontrol biaya dan usage.

## Fitur Token Tracking

### 1. **Real-time Token Usage dalam Response**
Setiap call ke `/generate-test-case` sekarang mengembalikan informasi token usage:

```json
{
  "name": "Test Login",
  "description": "...",
  "tokenUsage": {
    "prompt_token_count": 245,
    "candidates_token_count": 187,
    "total_token_count": 432
  }
}
```

**Parameter Request:**
- `includeTokenUsage`: boolean (default: true) - Include token info dalam response

### 2. **Token Estimation Endpoint**
Estimasi token usage sebelum membuat actual API call:

**Endpoint:** `POST /estimate-tokens`

**Request:**
```json
{
  "prompt": "Test case untuk login functionality",
  "context": "Web application dengan authentication",
  "useRAG": true,
  "ragSimilarityThreshold": 0.7,
  "maxRAGReferences": 3
}
```

**Response:**
```json
{
  "estimated_input_tokens": 425,
  "estimated_cost_usd": 0.000064,
  "model_name": "gemini-1.5-flash",
  "note": "Estimation based on ~4 characters per token. Actual usage may vary."
}
```

### 3. **Token Information Endpoint**
Info tentang model, pricing, dan limits:

**Endpoint:** `GET /token-info`

**Response:**
```json
{
  "model": "gemini-1.5-flash",
  "pricing": {
    "input_tokens_per_1k": "$0.00015",
    "output_tokens_per_1k": "$0.0006",
    "currency": "USD"
  },
  "limits": {
    "max_input_tokens": 1048576,
    "max_output_tokens": 8192
  },
  "estimation_method": "~4 characters per token",
  "note": "Pricing dan limits bersifat approximate"
}
```

## Cara Menggunakan

### 1. **Monitoring Real-time Usage**
```python
import requests

# Generate test case dengan token tracking
response = requests.post("http://localhost:8000/generate-test-case", json={
    "prompt": "Test login with invalid password",
    "includeTokenUsage": True  # Enable token tracking
})

data = response.json()
if data.get("tokenUsage"):
    print(f"Tokens used: {data['tokenUsage']['total_token_count']}")
    print(f"Cost estimate: ${data['tokenUsage']['total_token_count'] * 0.00015 / 1000:.6f}")
```

### 2. **Pre-estimation untuk Budget Control**
```python
# Estimate sebelum actual call
estimate_response = requests.post("http://localhost:8000/estimate-tokens", json={
    "prompt": "Test complex user workflow",
    "useRAG": True
})

estimate = estimate_response.json()
print(f"Estimated tokens: {estimate['estimated_input_tokens']}")
print(f"Estimated cost: ${estimate['estimated_cost_usd']}")

# Proceed jika dalam budget
if estimate['estimated_cost_usd'] < 0.01:  # Budget limit
    # Make actual API call
    actual_response = requests.post("http://localhost:8000/generate-test-case", json={
        "prompt": "Test complex user workflow",
        "includeTokenUsage": True
    })
```

### 3. **Batch Monitoring untuk Analytics**
```python
# Track usage untuk multiple requests
total_tokens = 0
total_cost = 0

prompts = [
    "Test user registration",
    "Test password reset",
    "Test file upload"
]

for prompt in prompts:
    response = requests.post("http://localhost:8000/generate-test-case", json={
        "prompt": prompt,
        "includeTokenUsage": True
    })
    
    token_usage = response.json().get("tokenUsage")
    if token_usage:
        tokens = token_usage["total_token_count"]
        cost = tokens * 0.00015 / 1000  # Rough calculation
        
        total_tokens += tokens
        total_cost += cost
        
        print(f"Prompt: {prompt}")
        print(f"Tokens: {tokens}, Cost: ${cost:.6f}")

print(f"\nTotal tokens: {total_tokens}")
print(f"Total cost: ${total_cost:.6f}")
```

## Logging dan Monitoring

### Log Output
AI service sekarang mencatat token usage dalam logs:
```
INFO:app.main:Token usage - Prompt: 245, Candidates: 187, Total: 432
INFO:app.main:Successfully generated test case using rag for prompt: Test login functionality
```

### Dashboard Metrics
Untuk production monitoring, bisa integrate dengan:
- **Prometheus**: Collect token metrics
- **Grafana**: Visualize usage trends
- **Alerting**: Warning ketika usage mendekati limit

## Cost Optimization Tips

### 1. **RAG Optimization**
- Gunakan `ragSimilarityThreshold` lebih tinggi untuk mengurangi context
- Limit `maxRAGReferences` untuk kontrol token usage
- Disable RAG untuk prompts sederhana

### 2. **Prompt Engineering**
- Gunakan prompt yang lebih concise
- Batch multiple requests jika memungkinkan
- Cache results untuk prompts yang similar

### 3. **Budget Controls**
```python
# Implementasi budget control
class TokenBudgetManager:
    def __init__(self, daily_budget_usd=10.0):
        self.daily_budget = daily_budget_usd
        self.daily_usage = 0.0
    
    def can_make_request(self, estimated_cost):
        return (self.daily_usage + estimated_cost) <= self.daily_budget
    
    def record_usage(self, actual_cost):
        self.daily_usage += actual_cost
```

## Error Handling
Jika token usage tidak bisa diambil:
```python
try:
    token_usage = response_data.get("tokenUsage")
    if token_usage:
        # Process token info
        pass
    else:
        logger.warning("Token usage not available in response")
except Exception as e:
    logger.error(f"Error processing token usage: {e}")
```

## Production Considerations

1. **Rate Limiting**: Monitor requests per minute untuk avoid quota limits
2. **Caching**: Cache responses untuk identical prompts
3. **Monitoring**: Set up alerts untuk unusual token usage
4. **Budgeting**: Implement daily/monthly spending limits
5. **Analytics**: Track usage patterns untuk optimization

## Gemini API Limits
- **Input**: 1M tokens maximum
- **Output**: 8K tokens maximum  
- **Rate Limits**: Check Google AI Studio untuk latest limits
- **Pricing**: Update regularly, pricing dapat berubah