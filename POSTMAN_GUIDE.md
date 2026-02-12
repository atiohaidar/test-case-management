# 📮 Panduan Postman Collection - Test Case Management API

## 📋 Deskripsi

Collection Postman ini menyediakan contoh lengkap untuk menggunakan API Test Case Management System dengan berbagai skenario:

1. ✍️ **Manual Test Case Creation (Tanpa AI)**
2. 🔍 **RAG Only (Semantic Search & Reference)**
3. 🤖 **Generative AI dengan RAG**
4. 🎯 **Pure Generative AI (Tanpa RAG)**

## 🚀 Cara Import Collection

### Option 1: Import File JSON

1. Buka Postman
2. Click tombol **Import** di pojok kiri atas
3. Pilih file `Test-Case-Management-API.postman_collection.json`
4. Click **Import**

### Option 2: Import dari URL (jika sudah ada di GitHub)

1. Buka Postman
2. Click **Import** → **Link**
3. Paste URL raw file JSON
4. Click **Continue** → **Import**

## ⚙️ Setup Environment

Collection ini menggunakan variabel environment. Buat environment baru:

1. Click **Environments** di sidebar kiri
2. Click **+** untuk create new environment
3. Beri nama: `Test Case Management - Local`
4. Tambahkan variabel berikut:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:3000` | `http://localhost:3000` |

5. **Save** dan pilih environment ini

## 📁 Struktur Collection

### 1. Health & Monitoring 🏥

Endpoint untuk mengecek status service:

- **Basic Health Check** - Cek apakah backend berjalan
- **Detailed Health Check** - Info detail kesehatan sistem
- **Prometheus Metrics** - Metrics untuk monitoring
- **Ping** - Simple health check untuk load balancer

**📝 Kapan digunakan:**
- Sebelum mulai testing untuk memastikan service running
- Monitoring production service
- Health check integration dengan orchestrator (Kubernetes, etc)

---

### 2. Manual Test Case Creation (Tanpa AI) ✍️

Skenario pembuatan test case secara manual tanpa bantuan AI.

#### Requests:

1. **Create Login Test Case - Positive**
   - Membuat test case login dengan kredensial valid
   - Includes detailed steps dan expected results
   
2. **Create Login Test Case - Negative**
   - Test case untuk validasi login gagal dengan password salah
   
3. **Create File Upload Test Case**
   - Test case untuk fitur upload file dengan validasi ukuran

**📝 Use Case:**
- QA engineer membuat test case dari requirement document
- Traditional approach tanpa AI assistance
- Full control atas struktur dan content test case

**🎯 Expected Behavior:**
- Status: `201 Created`
- Response berisi test case object dengan ID
- ID tersimpan di environment variable untuk request selanjutnya

---

### 3. RAG Only (Semantic Search & Reference) 🔍

Menggunakan RAG (Retrieval-Augmented Generation) untuk search dan reference, **tanpa AI generation**.

#### Requests:

1. **Search Test Cases - Login Related**
   - Search test case menggunakan semantic similarity
   - Query: "login authentication"
   - Returns test cases yang paling relevan dengan similarity score
   
2. **Search Test Cases - Upload File**
   - Find test cases related to file upload
   
3. **Create Test Case with Semantic Search Reference**
   - Buat test case baru dengan referensi ke test case yang ditemukan via semantic search
   - Maintains traceability
   
4. **Get Test Case with References**
   - Retrieve test case beserta reference information
   
5. **Get Full Detail with References**
   - Complete test case dengan all incoming/outgoing references
   
6. **Derive Test Case from Existing**
   - Buat variation dari existing test case
   
7. **Add Manual Reference Between Test Cases**
   - Link dua test case secara manual

**📝 Use Case:**
- Mencari test case yang mirip sebelum membuat yang baru
- Menghindari duplikasi test case
- Tracking relationship antar test case
- Reuse dan adapt existing test cases

**💡 Keunggulan RAG (Retrieval):**
- ✅ Menemukan test case relevan dengan natural language
- ✅ Similarity score membantu prioritas
- ✅ Traceability dan relationship tracking
- ✅ Tidak perlu AI generation, lebih cepat

---

### 4. Generative AI dengan RAG 🤖🔍

Kombinasi paling powerful: **AI generation + RAG context**.

#### How It Works:

```
User Prompt 
    ↓
1. System searches similar test cases (RAG)
    ↓
2. Found test cases sent as context to AI
    ↓
3. AI generates new test case using context
    ↓
4. Result follows patterns from existing tests
```

#### Requests:

1. **Generate Test Case with RAG (Preview)**
   - Generate test case untuk "change password"
   - Uses RAG to find similar login/auth test cases
   - AI learns patterns from existing tests
   - **NOT saved**, preview only
   
2. **Generate and Save Test Case with RAG**
   - Generate test case untuk "reset password"
   - Searches similar email/auth test cases
   - Saves immediately to database
   - Includes RAG reference metadata
   
3. **Generate Registration Test with RAG**
   - AI learns validation patterns from existing tests
   
4. **Generate API Test with RAG**
   - AI learns API testing structure dari existing API tests

**📝 Use Case:**
- Membuat test case baru yang consistent dengan existing patterns
- Leveraging best practices dari test case sebelumnya
- Auto-generate test case dengan quality tinggi

**💡 Keunggulan AI + RAG:**
- ✅ Consistency dengan existing test style
- ✅ Follow best practices dari test case sebelumnya
- ✅ Detailed steps based on similar scenarios
- ✅ Maintains references untuk traceability
- ✅ Better quality daripada pure AI
- ✅ Saves time dengan auto-generation

**⚙️ RAG Parameters:**
```json
{
  "useRAG": true,                      // Enable RAG
  "ragSimilarityThreshold": 0.7,      // Min similarity (0-1)
  "maxRAGReferences": 3                // Max references to retrieve
}
```

**📊 Response includes:**
- `aiGenerated`: true
- `aiGenerationMethod`: "rag"
- `ragReferences`: Array of similar test cases used
- `tokenUsage`: Gemini API token usage
- `aiConfidence`: Confidence score

---

### 5. Pure Generative AI (Tanpa RAG) 🎯

AI generation **tanpa context** dari existing test cases.

#### Requests:

1. **Generate Test Case - Pure AI (Preview)**
   - Generate "shopping cart" test case
   - Pure AI tanpa retrieval
   - Preview only
   
2. **Generate and Save - Pure AI**
   - Generate "notification system" test
   - No reference to existing tests
   - Fresh perspective
   
3. **Generate Payment Test - Pure AI**
   - Payment gateway testing
   - Good for new features without precedent
   
4. **Generate Negative Test - Pure AI**
   - Security test untuk SQL injection
   - AI's general security knowledge

**📝 Use Case:**
- Testing completely new features dengan no similar tests
- Want fresh perspective tanpa bias dari existing tests
- Need AI's general best practices
- Security tests dengan latest attack patterns

**💡 Kapan Gunakan Pure AI:**
- ✅ New features yang belum pernah ada
- ✅ No similar test cases exist
- ✅ Want unbiased approach
- ✅ Security/vulnerability testing

**⚠️ Limitations:**
- ❌ Mungkin tidak consistent dengan existing test style
- ❌ No traceability to existing tests
- ❌ May need more manual review
- ❌ Generic approach

**⚙️ Pure AI Parameter:**
```json
{
  "useRAG": false  // Disable RAG
}
```

---

### 6. Test Case Management 📝

Basic CRUD operations:

- **Get All Test Cases** - List semua test cases
- **Get Test Case by ID** - Retrieve specific test case
- **Update Test Case** - Update fields (PATCH)
- **Delete Test Case** - Delete by ID
- **Get Derived Test Cases** - Get all derived test cases

**📝 Use Case:**
- Manajemen test case sehari-hari
- Update priority, tags, steps
- Delete obsolete test cases
- View test case relationships

---

### 7. Comparison Scenarios 🔬

Side-by-side comparison RAG vs Pure AI dengan **same prompt**.

#### Requests:

1. **Part 1 - RAG**
   - Generate "user profile update - change email"
   - WITH RAG enabled
   
2. **Part 2 - Pure AI**
   - Same prompt: "user profile update - change email"
   - WITHOUT RAG

**📝 Use Case:**
- Understand difference between RAG and Pure AI
- Evaluate which approach better for your use case
- See RAG benefits in action

**🔍 What to Compare:**
- ✅ Level of detail
- ✅ Step structure
- ✅ Consistency with existing style
- ✅ Completeness
- ✅ References (RAG has, Pure AI doesn't)
- ✅ Number of steps
- ✅ Token usage

**📊 Comparison logged in Console:**
- Check Postman Console (bottom panel)
- View side-by-side comparison

---

## 🎯 Recommended Testing Flow

### Flow 1: Getting Started (New User)

```
1. Health & Monitoring
   └─> Basic Health Check

2. Manual Test Case Creation
   └─> Create Login Test Case - Positive
   └─> Create Login Test Case - Negative
   └─> Create File Upload Test Case

3. RAG Only - Search
   └─> Search Test Cases - Login Related
   └─> View found test cases

4. Test Case Management
   └─> Get All Test Cases
   └─> Get Test Case by ID
```

### Flow 2: RAG Enhancement

```
1. Manual Creation (build knowledge base)
   └─> Create several test cases manually

2. Semantic Search
   └─> Search Test Cases

3. Create with Reference
   └─> Create Test Case with Semantic Search Reference
   └─> Get Test Case with References
```

### Flow 3: AI Generation Comparison

```
1. Run Comparison Part 1 (RAG)
   └─> Save result

2. Run Comparison Part 2 (Pure AI)
   └─> Save result

3. Compare responses
   └─> Check Console logs
   └─> Review differences
```

### Flow 4: Production-like Testing

```
1. Health Check
   └─> Ensure service ready

2. Generate with AI + RAG
   └─> Generate and Save Test Case with RAG
   
3. Verify
   └─> Get Test Case by ID
   └─> Get Test Case with References

4. Update if needed
   └─> Update Test Case

5. Search for related
   └─> Search Test Cases
```

---

## 📊 Comparison: Manual vs RAG vs AI+RAG vs Pure AI

| Aspect | Manual | RAG Only | AI + RAG | Pure AI |
|--------|--------|----------|----------|---------|
| **Speed** | ⭐ Slow | ⭐⭐⭐ Fast | ⭐⭐⭐⭐ Very Fast | ⭐⭐⭐⭐ Very Fast |
| **Quality** | ⭐⭐⭐⭐ High | ⭐⭐⭐⭐ High | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good |
| **Consistency** | ⭐⭐⭐ Depends | ⭐⭐⭐⭐ High | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐ Variable |
| **Traceability** | ⭐⭐ Manual | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent | ⭐ None |
| **New Features** | ⭐⭐⭐⭐ Good | ⭐⭐ Limited | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |
| **Context Aware** | ⭐⭐⭐⭐⭐ High | ⭐⭐⭐⭐⭐ High | ⭐⭐⭐⭐⭐ High | ⭐⭐ Low |
| **Cost** | 💰 Time cost | 💰 Free | 💰💰 AI tokens | 💰💰 AI tokens |

### Recommendations:

- **Manual**: When you need precise control atau very specific requirements
- **RAG Only**: Search, find, reference existing test cases - fast and free
- **AI + RAG**: Best for most cases - fast, high quality, consistent
- **Pure AI**: New features, security tests, fresh perspective needed

---

## 🔧 Environment Variables Auto-saved

Collection ini otomatis menyimpan ID ke environment variables:

- `login_test_case_id` - ID dari login test case
- `login_negative_test_case_id` - ID dari negative login test
- `file_upload_test_case_id` - ID dari file upload test
- `rag_generated_test_case_id` - ID dari RAG-generated test
- `comparison_rag_id` - ID comparison test dengan RAG
- `comparison_pure_id` - ID comparison test pure AI

Variables ini digunakan untuk requests berikutnya (chaining).

---

## 🧪 Testing Tips

### 1. Run Sequentially for Best Results

Jalankan requests dalam urutan untuk memanfaatkan environment variables:

```
Manual Creation → Search → Reference Creation → Management
```

### 2. Check Response Details

Perhatikan fields berikut dalam response:

**For Manual Creation:**
- `id` - Test case ID
- `name`, `description`, `steps`
- `tags`, `priority`, `type`

**For RAG Search:**
- `similarity` - Score kemiripan (0-1)
- `testCase` - Test case object

**For AI Generation:**
- `aiGenerated` - Always true
- `aiGenerationMethod` - "rag" or "pure_ai"
- `ragReferences` - Array of references (if RAG)
- `tokenUsage` - Gemini token usage
- `aiConfidence` - Confidence score

### 3. Use Tests Tab

Setiap request punya automated tests di tab **Tests**:
- Status code validation
- Response structure validation
- Auto-save IDs to environment

Check test results di **Test Results** tab.

### 4. Console Logging

Comparison scenarios log results ke Console:
- Click **Console** at bottom
- View detailed comparison data

---

## 🚨 Common Issues & Solutions

### Issue 1: Connection Refused

**Error:** `Could not connect to localhost:3000`

**Solution:**
```bash
# Make sure backend is running (from project root)
cd backend
npm run start:dev

# Or using Docker (from project root)
docker-compose up -d backend

# Verify service is running
curl http://localhost:3000/monitoring/health
```

### Issue 2: 500 Error on AI Generation

**Error:** `AI service unavailable`

**Solution:**
- Pastikan AI service running (port 8000)
- Set GEMINI_API_KEY di environment variable
```bash
# From project root
cd ai
python main.py

# Verify AI service
curl http://localhost:8000/health
```

**Note:** Some AI generation requests may fail without valid GEMINI_API_KEY.

### Issue 5: Security Warning about Credentials

**Warning:** Example requests contain hardcoded credentials

**Note:** Credentials in collection (e.g., testuser@example.com, Password123!) are **example placeholders only**. 
- For production: Use environment variables
- For testing: Use your own test credentials
- Never commit real credentials to version control

### Issue 3: Empty RAG References

**Error:** AI generation success tapi `ragReferences` empty

**Solution:**
- Create beberapa test cases manually dulu
- Semantic search butuh data untuk retrieve
- Lower `ragSimilarityThreshold` (e.g., 0.5)

### Issue 4: 404 Not Found on ID-based Requests

**Error:** `Test case not found`

**Solution:**
- Run creation requests first
- Check environment variables sudah set
- Use actual ID dari response sebelumnya

---

## 📖 Additional Resources

- **Backend API Docs (Swagger)**: http://localhost:3000/api
- **AI Service Docs**: http://localhost:8000/docs
- **Repository**: https://github.com/atiohaidar/test-case-management
- **Main README**: [README.md](README.md)
- **Technical Docs**: [docs/Tech.md](docs/Tech.md)

---

## 🤝 Contributing

Found issues atau want to add more scenarios? Contributions welcome!

1. Fork the repository
2. Create feature branch
3. Add new requests to collection
4. Submit pull request

---

## 📝 Summary: When to Use Each Approach

### ✍️ Manual Creation
**When:** You need precise control, very specific requirements
**Best for:** Critical test cases, compliance testing, detailed scenarios

### 🔍 RAG Only (Search & Reference)
**When:** Looking for existing test cases, avoiding duplication
**Best for:** Reusing tests, finding similar scenarios, traceability

### 🤖 AI + RAG (Recommended ⭐)
**When:** Creating new test cases efficiently with high quality
**Best for:** Most day-to-day test case creation, maintaining consistency

### 🎯 Pure AI
**When:** Testing new features, need fresh perspective
**Best for:** New features, security tests, unbiased approach

---

**Happy Testing! 🎉**

For questions or support, please open an issue on GitHub.
