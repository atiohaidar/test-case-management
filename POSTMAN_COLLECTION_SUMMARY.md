# 📮 Ringkasan Postman Collection - Test Case Management API

## 📁 File yang Dibuat

### 1. `Test-Case-Management-API.postman_collection.json`
File collection Postman lengkap dengan 40+ request yang terorganisir dalam 7 folder.

### 2. `POSTMAN_GUIDE.md`
Panduan lengkap penggunaan collection dalam Bahasa Indonesia/English.

### 3. `POSTMAN_COLLECTION_SUMMARY.md` (file ini)
Ringkasan singkat dalam Bahasa Indonesia.

---

## 🎯 Apa yang Tercakup dalam Collection

### 📋 7 Folder Utama:

#### 1. **Health & Monitoring** (4 requests)
- Basic health check
- Detailed health check
- Prometheus metrics
- Ping endpoint

#### 2. **Manual Test Case Creation - Tanpa AI** (3 requests)
Skenario pembuatan test case secara manual:
- ✅ Create Login Test Case - Positive
- ❌ Create Login Test Case - Negative  
- 📁 Create File Upload Test Case

**Use Case:** QA engineer membuat test case dari document requirement, pendekatan tradisional tanpa AI.

#### 3. **RAG Only - Semantic Search & Reference** (7 requests)
Menggunakan RAG untuk search dan reference **tanpa AI generation**:
- 🔍 Search Test Cases - Login Related
- 🔍 Search Test Cases - Upload File
- 📝 Create Test Case with Semantic Search Reference
- 📖 Get Test Case with References
- 📊 Get Full Detail with References
- 🌿 Derive Test Case from Existing
- 🔗 Add Manual Reference Between Test Cases

**Use Case:** Mencari test case yang mirip, avoid duplikasi, maintain traceability.

#### 4. **Generative AI dengan RAG** (4 requests) ⭐ **RECOMMENDED**
AI generation **dengan context** dari existing test cases:
- 🤖 Generate Test Case with RAG (Preview)
- 💾 Generate and Save Test Case with RAG
- 👤 Generate Registration Test with RAG
- 🌐 Generate API Test with RAG

**Cara Kerja:**
```
Prompt User
    ↓
1. System cari test case yang mirip (RAG)
    ↓
2. Test case dikirim sebagai context ke AI
    ↓
3. AI generate test case baru using context
    ↓
4. Hasil follow pattern dari existing tests
```

**Keunggulan:**
- ✅ Consistency dengan style existing
- ✅ Follow best practices
- ✅ Detailed steps based on similar tests
- ✅ Traceability via references
- ✅ Quality lebih tinggi dari Pure AI

#### 5. **Pure Generative AI - Tanpa RAG** (4 requests)
AI generation **tanpa context** dari existing tests:
- 🎯 Generate Test Case - Pure AI (Preview)
- 💾 Generate and Save - Pure AI
- 💳 Generate Payment Test - Pure AI
- 🔒 Generate Negative Test - Pure AI

**Kapan Digunakan:**
- Testing features baru yang belum ada precedent
- Butuh fresh perspective tanpa bias
- Security testing dengan latest patterns
- No similar test cases exist

#### 6. **Test Case Management** (5 requests)
CRUD operations standar:
- 📋 Get All Test Cases
- 📄 Get Test Case by ID
- ✏️ Update Test Case
- 🗑️ Delete Test Case
- 🌿 Get Derived Test Cases

#### 7. **Comparison Scenarios** (2 requests)
Perbandingan langsung **RAG vs Pure AI** dengan prompt yang sama:
- Part 1: Generate with RAG
- Part 2: Generate with Pure AI

**Tujuan:** Melihat perbedaan langsung antara kedua approach untuk use case yang sama.

---

## 🎯 Skenario Test Case Minimal

Sesuai requirement, berikut adalah skenario minimal yang **WAJIB dicoba**:

### 1️⃣ Skenario: Tanpa AI (Manual)
```
Folder: "1. Manual Test Case Creation (Without AI)"
Request: "Create Login Test Case - Positive"
```
**Deskripsi:** Membuat test case secara manual tanpa bantuan AI sama sekali.

### 2️⃣ Skenario: Menggunakan RAG Saja
```
Folder: "2. RAG Only (Semantic Search & Reference)"
Request: 
  1. "Search Test Cases - Login Related" (cari test case)
  2. "Create Test Case with Semantic Search Reference" (buat dengan reference)
```
**Deskripsi:** Menggunakan semantic search untuk menemukan test case yang relevan, lalu membuat test case baru dengan reference ke test case yang ditemukan.

### 3️⃣ Skenario: Generative AI dan RAG
```
Folder: "3. Generative AI with RAG"
Request: "Generate and Save Test Case with RAG"
```
**Deskripsi:** AI generate test case dengan bantuan RAG. System akan:
1. Search test case yang mirip dengan prompt
2. Gunakan test case tersebut sebagai context
3. AI generate test case baru yang follow pattern existing
4. Save dengan metadata RAG references

### 4️⃣ Skenario: Generative AI Saja (Tanpa RAG)
```
Folder: "4. Pure Generative AI (Without RAG)"
Request: "Generate and Save - Pure AI"
```
**Deskripsi:** AI generate test case murni dari prompt tanpa mencari atau menggunakan existing test cases sebagai referensi.

---

## 📊 Perbandingan 4 Skenario

| Skenario | Kecepatan | Kualitas | Consistency | Traceability |
|----------|-----------|----------|-------------|--------------|
| **Manual** | 🐌 Lambat | ⭐⭐⭐⭐ Tinggi | ⭐⭐⭐ Tergantung | ⭐⭐ Manual |
| **RAG Saja** | ⚡ Cepat | ⭐⭐⭐⭐ Tinggi | ⭐⭐⭐⭐ Baik | ⭐⭐⭐⭐⭐ Excellent |
| **AI + RAG** ⭐ | ⚡⚡ Sangat Cepat | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent |
| **Pure AI** | ⚡⚡ Sangat Cepat | ⭐⭐⭐ Good | ⭐⭐ Variable | ⭐ None |

---

## 🚀 Quick Start - 5 Menit

### Langkah 1: Import Collection
1. Buka Postman
2. Click **Import**
3. Pilih file `Test-Case-Management-API.postman_collection.json`
4. Click **Import**

### Langkah 2: Setup Environment
1. Click **Environments**
2. Create new environment: "Test Case Management - Local"
3. Add variable: `base_url` = `http://localhost:3000`
4. **Save** dan select environment

### Langkah 3: Start Backend
```bash
# Pastikan backend dan AI service running
docker-compose up -d

# Atau manual
cd backend && npm run start:dev
cd ai && python main.py
```

### Langkah 4: Test Health
Run request: **Health & Monitoring → Basic Health Check**

### Langkah 5: Coba 4 Skenario Minimal

**Skenario 1 - Manual (Tanpa AI):**
```
Folder: 1. Manual Test Case Creation
Run: "Create Login Test Case - Positive"
Expected: Status 201, test case created
```

**Skenario 2 - RAG Saja:**
```
Folder: 2. RAG Only
Run: "Search Test Cases - Login Related"
Expected: Status 200, list of similar test cases dengan similarity score
```

**Skenario 3 - AI + RAG:**
```
Folder: 3. Generative AI with RAG
Run: "Generate and Save Test Case with RAG"
Expected: Status 201, AI-generated test case dengan RAG references
```

**Skenario 4 - Pure AI:**
```
Folder: 4. Pure Generative AI
Run: "Generate and Save - Pure AI"
Expected: Status 201, AI-generated test case tanpa references
```

---

## 💡 Tips Penting

### 1. Jalankan Secara Berurutan
Untuk hasil terbaik, jalankan requests secara sequential dalam satu folder karena ada dependencies (environment variables).

### 2. Check Response
Perhatikan fields penting:
- **Manual/RAG:** `id`, `name`, `steps`, `tags`
- **AI Generation:** `aiGenerated`, `aiGenerationMethod`, `ragReferences`, `tokenUsage`

### 3. Console Logging
Comparison scenarios log hasil ke Console (bottom panel). Check untuk lihat perbandingan detail.

### 4. Automated Tests
Setiap request punya automated tests:
- Validates status code
- Validates response structure
- Auto-saves IDs to environment
Check tab **Test Results** setelah run.

---

## 🎓 Learning Path

### Pemula (Hari 1)
1. Health checks
2. Manual test case creation (3 requests)
3. Get all test cases
4. Get test case by ID

### Intermediate (Hari 2)
1. Search test cases (RAG)
2. Create with semantic search reference
3. Get test case with references
4. Derive test case

### Advanced (Hari 3)
1. Generate with AI + RAG
2. Compare RAG vs Pure AI
3. Analyze token usage
4. Review RAG references quality

---

## 📞 Bantuan

### Dokumentasi Lengkap
Baca `POSTMAN_GUIDE.md` untuk:
- Penjelasan detail setiap endpoint
- Use cases lengkap
- Troubleshooting
- Best practices

### API Documentation
- Backend Swagger: http://localhost:3000/api
- AI Service Docs: http://localhost:8000/docs

### Issues?
- Check service status: Run health check
- Verify environment variables
- Check backend & AI service logs
- Open GitHub issue jika perlu

---

## ✅ Checklist Validasi

Sebelum production, pastikan sudah test:

- [ ] ✅ Health check berhasil
- [ ] ✅ Manual creation berfungsi (Skenario 1)
- [ ] ✅ Semantic search return results (Skenario 2)
- [ ] ✅ AI + RAG generation works (Skenario 3)
- [ ] ✅ Pure AI generation works (Skenario 4)
- [ ] ✅ CRUD operations (GET, UPDATE, DELETE)
- [ ] ✅ References tracking berfungsi
- [ ] ✅ RAG references terisi dengan benar
- [ ] ✅ Token usage tercatat
- [ ] ✅ Automated tests pass

---

## 🎉 Summary

Collection ini menyediakan **29 requests** yang mencakup:
- ✅ 4 skenario test case creation (Manual, RAG, AI+RAG, Pure AI)
- ✅ Semantic search dan RAG features
- ✅ Complete CRUD operations
- ✅ Health monitoring
- ✅ Comparison scenarios
- ✅ Automated tests
- ✅ Environment variables management

**Best Practice:** Gunakan **AI + RAG** untuk majority use cases karena memberikan balance terbaik antara speed, quality, dan consistency.

---

**Selamat mencoba! 🚀**

Untuk pertanyaan lebih lanjut, baca `POSTMAN_GUIDE.md` atau buka issue di GitHub.
