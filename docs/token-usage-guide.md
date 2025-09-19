# Token Usage Tracking - Quick Reference

## 📊 Overview
System otomatis melacak penggunaan token dari Gemini API untuk setiap AI-generated test case dan menyimpannya di database.

## 🗄️ Database Schema
```prisma
model TestCase {
  // ... other fields
  tokenUsage     Json?     // Token usage dari Gemini AI
  // ... other fields
}
```

## 📝 Token Usage Object Structure
```json
{
  "inputTokens": 120,
  "outputTokens": 350,
  "totalTokens": 470,
  "estimatedCost": 0.000235
}
```

## 🚀 API Endpoints yang Include Token Usage

### 1. Generate Test Case with AI
```bash
POST /testcases/generate-with-ai
```
**Response includes**: `tokenUsage` object

### 2. Generate and Save Test Case with AI
```bash
POST /testcases/generate-and-save-with-ai
```
**Response includes**: `tokenUsage` object

### 3. Get Full Detail
```bash
GET /testcases/:id/full
```
**Response includes**: `tokenUsage` object dari database

### 4. Create Test Case (manual)
```bash
POST /testcases
```
**Request body can include**: `tokenUsage` object (optional)

### 5. Update Test Case (manual)
```bash
PATCH /testcases/:id
```
**Request body can include**: `tokenUsage` object (optional)

## 🔧 Implementation Details

### Backend (NestJS)
- **Service**: TestCaseService stores tokenUsage in create/update methods
- **DTOs**: CreateTestCaseDto dan UpdateTestCaseDto include tokenUsage field
- **Entity**: TestCaseDto include tokenUsage field for Swagger documentation

### AI Service (FastAPI)
- **Gemini Integration**: Captures `usage_metadata` from Gemini API responses
- **Response**: Returns tokenUsage object dengan estimated cost calculation

### Database
- **Storage**: Token usage disimpan sebagai JSON di field `tokenUsage`
- **Migration**: Added via Prisma migration `add_token_usage_field`
- **Query**: Available in all TestCase queries including getFullDetail

## 💡 Use Cases

1. **Cost Monitoring**: Track total token usage dan estimated costs
2. **Performance Analysis**: Analyze input vs output token ratios
3. **Audit Trail**: Complete history token usage per test case
4. **Billing**: Data untuk billing purposes jika diperlukan
5. **Optimization**: Identify opportunities untuk prompt optimization

## 📊 Cost Estimation Formula
```javascript
// Basic Gemini 1.5 Flash pricing (example)
const INPUT_COST_PER_TOKEN = 0.00000075;  // $0.075 per 1M tokens
const OUTPUT_COST_PER_TOKEN = 0.0000003;  // $0.30 per 1M tokens

const estimatedCost = 
  (inputTokens * INPUT_COST_PER_TOKEN) + 
  (outputTokens * OUTPUT_COST_PER_TOKEN);
```

## 🔒 Data Persistence
- ✅ Token usage disimpan permanen di database
- ✅ Available di semua relevant API responses
- ✅ Included dalam getFullDetail untuk complete audit trail
- ✅ Optional field - tidak required untuk manual test case creation