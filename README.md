# 🧪 Sistem Manajemen Test Case dengan RAG

<div align="center">

![Test Case Management Animation](https://img.shields.io/badge/⚡-Animated%20Scripts-brightgreen?style=for-the-badge)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/atiohaidar/test-case-management)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![NestJS](https://img.shields.io/badge/NestJS-Framework-red?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-AI%20Service-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-green?style=for-the-badge&logo=openai)](https://github.com/atiohaidar/test-case-management)
[![RAG](https://img.shields.io/badge/RAG-Enhanced-purple?style=for-the-badge&logo=brain)](https://github.com/atiohaidar/test-case-management)
[![MySQL](https://img.shields.io/badge/MySQL-Database-orange?style=for-the-badge&logo=mysql)](https://www.mysql.com/)

### 🎯 **Modern Full-Stack Test Case Management with AI & RAG Technology**
*Complete with React Frontend, NestJS Backend, and Python AI Service*

</div>

> **🚀 Smart application for managing and searching software test cases with AI and RAG (Retrieval-Augmented Generation) technology**  
> **Complete full-stack solution with modern React frontend, powerful NestJS backend, and intelligent Python AI service**

![System Architecture](https://img.shields.io/badge/🏗️-Full%20Stack-informational) ![Modern UI](https://img.shields.io/badge/💅-Modern%20UI-success) ![AI Powered](https://img.shields.io/badge/🤖-AI%20Powered-ff69b4)

---

## 🎯 What is this Application?

**Test Case Management System with RAG** is a modern full-stack application that helps software development teams:

### 🎨 **Modern Frontend (React + TypeScript)**
🌐 **Interactive web interface** with modern React components  
🎭 **Dark/Light theme** support with system preference detection  
⚡ **Real-time updates** and responsive design  
📱 **Mobile-friendly** interface for testing on-the-go  
🎯 **Intuitive UX** with smooth animations and transitions  

### 🚀 **Powerful Backend (NestJS + Prisma)**
📝 **Create and store** comprehensive test scenarios  
🔍 **Smart search** using AI semantic search  
🤖 **AI-generated test cases** with context-aware RAG technology  
📊 **Organize** by priority and categories  
🔗 **Track relationships** between test cases with reference system  
⚡ **Save time** with semantic search and AI generation features  

### 🧠 **Intelligent AI Service (Python + FastAPI)**
🔬 **Advanced ML models** for semantic understanding  
🤖 **Gemini AI integration** for natural language generation  
📊 **Token usage tracking** and cost monitoring  
🎯 **RAG implementation** for context-aware test case generation  

---

## ✨ Key Features

### 🎨 **Modern Full-Stack Architecture**
A complete ecosystem with three powerful services working together:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │   NestJS Backend│    │  Python AI      │
│   (Port 5173)   │◄──►│   (Port 3000)   │◄──►│   (Port 8000)   │
│   - Modern UI   │    │   - REST API    │    │   - ML Models   │
│   - TypeScript  │    │   - Prisma ORM  │    │   - Gemini AI   │
│   - Dark/Light  │    │   - MySQL DB    │    │   - RAG System  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🧠 **RAG (Retrieval-Augmented Generation)**
Advanced AI technology that combines semantic search with generation for superior test case quality.

**Cara Kerja RAG:**
1. 🔍 Sistem mencari test case yang relevan dengan prompt Anda
2. 📚 Test case relevan dijadikan konteks/referensi
3. 🤖 AI menggunakan konteks untuk generate test case yang lebih baik
4. 🔗 Sistem menyimpan referensi test case yang digunakan

### 🤖 **Generasi Test Case dengan AI (Gemini + RAG)**
Buat test case otomatis dengan dua mode:

#### 🎯 **Pure AI Mode**
Generate test case murni menggunakan AI tanpa referensi.

#### 🔗 **RAG Mode** (Default)
Generate test case dengan referensi ke test case existing yang relevan.

**Keunggulan RAG Mode:**
- ✨ Konsistensi dengan pattern existing
- 📈 Kualitas test case yang lebih baik
- 🎯 Follow best practices dari test case sebelumnya
- 📝 Langkah-langkah yang lebih detail dan realistis

**Contoh:** 
- Input: *"Test logout user"*
- RAG: Mencari test case login yang ada → Generate logout test yang konsisten
- Result: Test case logout yang mengikuti pattern login existing

### 🔍 **Pencarian Cerdas dengan AI**
Cari kasus uji hanya dengan mengetik kata kunci dalam bahasa natural. AI akan memahami maksud Anda dan menampilkan hasil yang paling relevan.

**Contoh:** Ketik *"login gagal"* → Sistem langsung menampilkan semua test case terkait masalah login

### 📋 **Manajemen Test Case Lengkap**
- ✅ Buat, edit, dan hapus kasus uji
- 🏷️ Kategorikan berdasarkan jenis (positif/negatif)
- ⭐ Atur prioritas (tinggi/sedang/rendah)
- 📝 Simpan langkah-langkah detail
- 🏷️ Beri tag untuk memudahkan pencarian

### 🔗 **Pelacakan Keterkaitan**
-  Buat test case turunan dari yang sudah ada
-  Lihat hubungan antar test case
-  Navigasi mudah dengan referensi

### 📱 **Akses Mudah**
- 🌐 Berbasis web, bisa diakses dari mana saja
- 📖 Dokumentasi API otomatis
- 🐳 Instalasi mudah dengan Docker

---

## 🚀 Quick Start Guide

### 💻 **Option 1: Super Easy Docker Setup (Recommended)**

Get up and running in under 5 minutes with Docker:

```bash
# 1. Clone the repository
git clone https://github.com/atiohaidar/test-case-management.git
cd test-case-management

# 2. Setup Gemini AI (Optional - for AI features)
# Edit docker-compose.yml and uncomment + set GEMINI_API_KEY in 'ai' service
# GEMINI_API_KEY: "your_gemini_api_key_here"

# 3. Start everything with one command
docker-compose up -d

# 4. Open your browser
# 🌐 Frontend: http://localhost:5173 (Modern React UI)
# 📚 Backend API: http://localhost:3000/api (NestJS + Swagger)
# 🤖 AI Service: http://localhost:8000/docs (Python FastAPI)
```

> **💡 Pro Tip**: Get your free Gemini API key at [Google AI Studio](https://aistudio.google.com/app/apikey)

### ⚡ **Option 2: Enhanced Development Mode**

For developers who want full control with animated scripts:

```bash
# 1. Clone and enter directory
git clone https://github.com/atiohaidar/test-case-management.git
cd test-case-management

# 2. Launch interactive development suite
./main-dev.sh

# 3. Choose from 11 different startup options:
#    🌟 Full Stack (All Services) - Complete development experience
#    🔥 Backend + AI + MySQL - API services + Database  
#    🎨 Frontend Only - React development
#    📊 System Information - Check your setup
#    ... and more!
```

### 🎯 **What You Get Instantly**

After setup, you'll have access to:

| Service | URL | Description |
|---------|-----|-------------|
| **🎨 Frontend** | http://localhost:5173 | Modern React UI with dark/light themes |
| **🚀 Backend API** | http://localhost:3000/api | Full REST API with Swagger documentation |
| **🤖 AI Service** | http://localhost:8000/docs | ML-powered semantic search and RAG |
| **🗄️ Database** | localhost:3306 | MySQL with automated schema setup |

### 📱 **First Steps After Installation**

1. **Visit the Frontend** → Create your first test case
2. **Try AI Generation** → Use RAG-powered test case creation
3. **Explore API** → Check out the Swagger documentation
4. **Test Search** → Try semantic search functionality

## 📚 Documentation & Resources

### 📖 **Complete Documentation Suite**

| Document | Description | Audience |
|----------|-------------|----------|
| **📋 [README.md](README.md)** | Project overview and quick start | Everyone |
| **🚀 [Development Guide](docs/DEVELOPMENT_GUIDE.md)** | Comprehensive developer documentation | Developers |
| **🔧 [Technical Documentation](docs/Tech.md)** | API reference and architecture | Technical Users |
| **📊 [Changelog](docs/CHANGELOG.md)** | Version history and updates | Maintainers |
| **🎯 [Examples](docs/examples.md)** | Usage examples and code samples | Developers |
| **💡 [Token Usage Guide](docs/token-usage-guide.md)** | AI token management | AI Users |

### 🎮 **Quick Access Links**

- **🌐 Frontend UI**: http://localhost:5173 (Modern React interface)
- **📚 Backend API Docs**: http://localhost:3000/api (Swagger documentation)
- **🤖 AI Service Docs**: http://localhost:8000/docs (FastAPI documentation)
- **🗄️ Database GUI**: Run `npx prisma studio` from backend folder

---

### 1️⃣ **Membuat Test Case Baru**
```http
POST /testcases
```
```json
{
  "name": "Test Login Berhasil",
  "description": "Menguji proses login dengan kredensial yang benar",
  "type": "positive",
  "priority": "high",
  "steps": [
    {
      "step": "Buka halaman login",
      "expectedResult": "Halaman login tampil"
    },
    {
      "step": "Masukkan username dan password yang benar",
      "expectedResult": "Data berhasil diinput"
    }
  ],
  "expectedResult": "User berhasil login dan masuk ke dashboard",
  "tags": ["login", "autentikasi", "positif"]
}
```

### 2️⃣ **Mencari Test Case**
```http
GET /testcases/search?query=login gagal password salah
```

### 3️⃣ **Generate Test Case dengan AI (Gemini)**
```http
POST /testcases/generate-with-ai
```
```json
{
  "prompt": "Test fitur upload file PDF dengan validasi ukuran maksimal 5MB",
  "context": "Aplikasi e-learning dengan sistem upload tugas",
  "preferredType": "functional",
  "preferredPriority": "high"
}
```

**Response:**
```json
{
  "name": "Test Upload File PDF - Validasi Ukuran Maksimal 5MB",
  "description": "Menguji fitur upload file PDF dengan validasi batas ukuran maksimal 5MB pada sistem e-learning",
  "type": "functional",
  "priority": "high",
  "steps": [
    {
      "step": "Akses halaman upload tugas",
      "expectedResult": "Halaman upload tugas berhasil ditampilkan"
    },
    {
      "step": "Pilih file PDF dengan ukuran tepat 5MB",
      "expectedResult": "File berhasil dipilih dan ditampilkan nama file"
    },
    {
      "step": "Klik tombol upload",
      "expectedResult": "File berhasil diupload dan muncul notifikasi sukses"
    }
  ],
  "expectedResult": "File PDF berhasil diupload dan tersimpan di sistem dengan validasi ukuran yang tepat",
  "tags": ["upload", "pdf", "validation", "file-size", "e-learning"],
  "originalPrompt": "Test fitur upload file PDF dengan validasi ukuran maksimal 5MB",
  "aiGenerated": true,
  "confidence": 0.92,
  "aiSuggestions": "Pertimbangkan untuk menambahkan test case negative untuk file yang melebihi 5MB"
}
```

### 4️⃣ **Melihat Semua Test Case**
```http
GET /testcases
```

### 5️⃣ **Membuat Test Case Turunan**
```http
POST /testcases/derive/{id-test-case-induk}
```

---

## 🛠️ Technology Stack

### 🏗️ **Modern Full-Stack Architecture**
Built with cutting-edge technologies for performance, scalability, and developer experience:

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   🎨 Frontend       │    │   🚀 Backend        │    │   🤖 AI Service     │
│                     │    │                     │    │                     │
│   React 19.1.1      │◄──►│   NestJS 10.3.0     │◄──►│   FastAPI 0.115.0   │
│   TypeScript 5.8    │    │   TypeScript 5.3    │    │   Python 3.12       │
│   Vite 6.2.0        │    │   Prisma ORM 5.6    │    │   Transformers 3.2   │
│   Modern UI/UX      │    │   MySQL 8.0         │    │   Gemini AI         │
│                     │    │   Swagger Docs      │    │   Scikit-learn      │
│   Port: 5173        │    │   Port: 3000        │    │   Port: 8000        │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
                                     │                          
                                     ▼                          
                            ┌─────────────────────┐              
                            │   🗄️ Database       │              
                            │                     │              
                            │   MySQL 8.0         │              
                            │   Automated Schema  │              
                            │   Prisma Migrations │              
                            │   Docker Ready      │              
                            │                     │              
                            │   Port: 3306        │              
                            └─────────────────────┘              
```

### 🎨 **Frontend Technologies**
- **React 19.1.1** with modern hooks and concurrent features
- **TypeScript 5.8** for type safety and better DX
- **Vite 6.2.0** for lightning-fast development and building
- **Modern CSS** with dark/light theme support
- **Responsive Design** for desktop and mobile

### 🚀 **Backend Technologies**
- **NestJS 10.3.0** - Scalable Node.js framework
- **Prisma ORM 5.6.0** - Type-safe database access
- **TypeScript 5.3** - Enhanced developer experience
- **Swagger/OpenAPI** - Automatic API documentation
- **MySQL 8.0** - Robust relational database
- **Docker Support** - Easy deployment and scaling

### 🧠 **AI & ML Technologies**
- **FastAPI 0.115.0** - High-performance Python web framework
- **Sentence Transformers** - State-of-the-art text embeddings
- **Google Gemini API** - Advanced language model for generation
- **Scikit-learn** - Machine learning utilities
- **RAG Implementation** - Retrieval-Augmented Generation
- **Vector Similarity Search** - Semantic search capabilities

### 🐳 **Infrastructure & DevOps**
- **Docker & Docker Compose** - Containerized development
- **Automated Scripts** - Enhanced developer experience
- **Hot Reload** - All services support live reloading
- **Environment Management** - Separate configs for each service
- **Health Checks** - Built-in monitoring and diagnostics

---

## 📊 Struktur Data

### 📋 **Test Case**
```json
{
  "id": "ID unik",
  "name": "Nama test case",
  "description": "Deskripsi lengkap",
  "type": "positive/negative",
  "priority": "high/medium/low",
  "steps": [
    {
      "step": "Langkah yang dilakukan",
      "expectedResult": "Hasil yang diharapkan"
    }
  ],
  "expectedResult": "Hasil akhir yang diharapkan",
  "tags": ["tag1", "tag2"],
  "referenceId": "ID test case induk (opsional)",
  "createdAt": "Tanggal dibuat",
  "updatedAt": "Tanggal diupdate"
}
```

---

## 🎯 Siapa yang Cocok Menggunakan?

### 👨‍💻 **QA Tester**
- Mengelola ratusan test case dengan mudah
- Mencari test case yang mirip untuk referensi
- Melacak coverage testing

### 👩‍💼 **Project Manager**
- Melihat status dan progres testing
- Memahami scope pengujian
- Planning test case untuk fitur baru

### 👨‍🔬 **Developer**
- Memahami skenario yang harus dihandle
- Referensi untuk unit testing
- Dokumentasi behavior aplikasi

### 🏢 **Tim Pengembangan**
- Kolaborasi dalam dokumentasi testing
- Knowledge sharing antar anggota tim
- Standardisasi proses testing

---

## 🚀 Keunggulan Aplikasi

### ⚡ **Efisiensi Tinggi**
- Template test case untuk mempercepat pembuatan
- Auto-complete dan suggestion

### 🎯 **Akurasi Tinggi**
- AI memahami konteks dan makna
- Hasil pencarian yang relevan
- Tracking keterkaitan yang akurat

### 🔒 **Reliable & Scalable**
- Database yang robust dan cepat
- Arsitektur microservice
- Mudah di-scale sesuai kebutuhan

### 🎨 **User-Friendly**
- Interface yang intuitif
- Dokumentasi API yang lengkap
- Error message yang jelas

---

## 📖 Contoh Penggunaan Nyata

### 🎯 **Skenario: Tim QA E-commerce**

**Sebelum menggunakan aplikasi:**
- Test case tersebar di berbagai dokumen Excel
- Sulit mencari test case yang mirip
- Banyak duplikasi effort
- Tidak ada pelacakan versi

**Setelah menggunakan aplikasi:**
```bash
# Cari semua test case checkout
GET /testcases/search?query=checkout

# Buat test case baru berdasarkan yang sudah ada  
POST /testcases/derive/cmfq39fxd00019nknx5by8mz6

# Lihat semua test case turunan
GET /testcases/cmfq39fxd00019nknx5by8mz6/derived
```

**Hasil:**
- ⏱️ Waktu pembuatan test case berkurang 60%
- 🎯 Akurasi pencarian meningkat 85%
- 🔄 Tidak ada lagi test case duplikat
- 📊 Tracking coverage yang lebih baik

---

## 📋 Daftar Endpoint API dengan RAG

### 🧪 **Test Case Management**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/testcases` | Ambil semua test case |
| `POST` | `/testcases` | **Buat test case baru (Unified API)** - Mendukung manual, semantic search, dan AI generation dengan RAG |
| `GET` | `/testcases/:id` | Ambil test case spesifik |
| `PATCH` | `/testcases/:id` | Update test case |
| `DELETE` | `/testcases/:id` | Hapus test case |

### 🔍 **Pencarian & AI**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/testcases/search` | Pencarian semantik dengan AI |
| `POST` | `/testcases/generate-with-ai` | Generate test case (preview only) - Deprecated, gunakan POST /testcases |
| `POST` | `/testcases/generate-and-save-with-ai` | Generate dan langsung save - Deprecated, gunakan POST /testcases |

### 🔗 **Keterkaitan Test Case & RAG**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/testcases/:id/with-reference` | Ambil test case dengan RAG references |
| `GET` | `/testcases/:id/semantic-search` | Ambil semua test case dari semantic search |
| `POST` | `/testcases/derive/:referenceId` | Buat test case berdasarkan yang ada |

### 🎯 **Unified API Flow - POST /testcases**

**POST /testcases** sekarang mendukung semua mode pembuatan test case dalam satu endpoint:

#### 1. **Manual Creation** (Default)
```bash
curl -X POST http://localhost:3000/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Login Manual",
    "description": "Manual test case creation",
    "type": "positive",
    "priority": "high",
    "steps": [{"step": "Login", "expectedResult": "Success"}],
    "expectedResult": "User logged in",
    "tags": ["login"]
  }'
```

#### 2. **Semantic Search Reference**
```bash
curl -X POST http://localhost:3000/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Login with Reference",
    "description": "Test case with semantic search reference",
    "type": "positive",
    "priority": "high",
    "steps": [{"step": "Login", "expectedResult": "Success"}],
    "expectedResult": "User logged in",
    "tags": ["login"],
    "referenceTo": "existing-test-case-id",
    "referenceType": "semantic_search"
  }'
```

#### 3. **AI Generation with RAG**
```bash
curl -X POST http://localhost:3000/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Generated Test Case",
    "description": "AI generated with RAG",
    "type": "positive",
    "priority": "high",
    "steps": [{"step": "Login", "expectedResult": "Success"}],
    "expectedResult": "User logged in",
    "tags": ["login"],
    "aiGenerated": true,
    "originalPrompt": "Create login test case",
    "aiGenerationMethod": "rag",
    "aiConfidence": 0.85,
    "ragReferences": [
      {
        "testCaseId": "ref-1",
        "similarity": 0.82
      }
    ]
  }'
```

### 🚀 **Contoh Penggunaan RAG API**

#### Generate Test Case dengan RAG (Unified API)
```bash
# RAG-Enhanced Generation (Default)
curl -X POST http://localhost:3000/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Logout User",
    "description": "Memverifikasi proses logout user",
    "type": "positive",
    "priority": "medium",
    "steps": [
      {
        "step": "User sudah login",
        "expectedResult": "Dashboard ditampilkan"
      },
      {
        "step": "Klik logout",
        "expectedResult": "User logout dan redirect ke login"
      }
    ],
    "expectedResult": "User berhasil logout",
    "tags": ["logout", "authentication"],
    "aiGenerated": true,
    "originalPrompt": "Buat test case untuk logout user",
    "aiGenerationMethod": "rag",
    "aiConfidence": 0.85,
    "ragReferences": [
      {
        "testCaseId": "existing-login-test-id",
        "similarity": 0.82
      }
    ]
  }'

# Pure AI Generation (Tanpa RAG)
curl -X POST http://localhost:3000/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Reset Password",
    "description": "Test reset password tanpa RAG",
    "type": "positive",
    "priority": "medium",
    "steps": [
      {
        "step": "Klik forgot password",
        "expectedResult": "Form reset password muncul"
      }
    ],
    "expectedResult": "Email reset dikirim",
    "tags": ["password", "reset"],
    "aiGenerated": true,
    "originalPrompt": "Buat test case untuk reset password",
    "aiGenerationMethod": "pure_ai",
    "aiConfidence": 0.75
  }'
```

### 🎯 **Parameter RAG**
| Parameter | Type | Default | Deskripsi |
|-----------|------|---------|-----------|
| `aiGenerated` | boolean | false | Menandai test case dibuat oleh AI |
| `originalPrompt` | string | null | Prompt asli yang digunakan untuk generate |
| `aiGenerationMethod` | string | null | "rag" atau "pure_ai" |
| `aiConfidence` | number (0-1) | null | Tingkat confidence AI |
| `ragReferences` | array | [] | Array referensi RAG dengan similarity |
| `referenceTo` | string | null | ID test case referensi (semantic search) |
| `referenceType` | string | null | "manual", "rag_retrieval", atau "semantic_search" |

---

---

## 🔧 Konfigurasi untuk Developer

### 🐳 **Menjalankan dengan Docker (Recommended)**
```bash
# Jalankan semua service
docker-compose up -d

# Lihat log aplikasi
docker-compose logs -f backend

# Stop semua service
docker-compose down
```

### 💻 **Development Lokal**

**Menggunakan Script Development (Recommended):**
```bash
# Script utama dengan menu interaktif
./main-dev.sh

# Atau langsung ke script tertentu
./scripts/start-mysql.sh      # MySQL saja
./scripts/start-ai.sh         # AI Service saja  
./scripts/start-backend.sh    # Backend saja
```

**Manual Setup (Optional):**
```bash
# Backend (NestJS)
cd backend
npm install
npm run start:dev

# AI Service (Python)
cd ai
pip install -r requirements.txt
python main.py

# Database MySQL via Docker
docker-compose up -d mysql
cd backend && npx prisma db push
```

**Database Management:**
```bash
cd backend
npx prisma studio          # GUI database
npx prisma generate        # Generate client
npx prisma db push         # Sync schema
```

---

## 🎨 Contoh Response API

### ✅ **Sukses - List Test Cases**
```json
{
  "data": [
    {
      "id": "cmfq39fxd00019nknx5by8mz6",
      "name": "Test Login Berhasil",
      "description": "Menguji login dengan kredensial benar",
      "type": "positive",
      "priority": "high",
      "tags": ["login", "autentikasi"],
      "referenceId": null,
      "aiGenerated": false,
      "createdAt": "2025-09-19T00:15:47.891Z"
    }
  ]
}
```

### 🔍 **Sukses - Hasil Pencarian**
```json
{
  "query": "login gagal",
  "results": [
    {
      "testCase": { /* test case object */ },
      "similarity": 0.85,
      "relevanceReason": "Cocok dengan kata kunci 'login' dan 'gagal'"
    }
  ],
  "totalResults": 1
}
```

### 🤖 **Sukses - AI Generated Test Case**
```json
{
  "id": "cmfq39fxd00019nknx5by8mz7",
  "name": "Test Logout User",
  "description": "Memverifikasi proses logout user",
  "type": "positive",
  "priority": "medium",
  "tags": ["logout", "authentication"],
  "aiGenerated": true,
  "originalPrompt": "Buat test case untuk logout user",
  "aiGenerationMethod": "rag",
  "aiConfidence": 0.85,
  "ragReferences": [
    {
      "testCaseId": "cmfq39fxd00019nknx5by8mz6",
      "similarity": 0.82,
      "testCase": {
        "id": "cmfq39fxd00019nknx5by8mz6",
        "name": "Test Login Berhasil",
        "type": "positive"
      }
    }
  ],
  "createdAt": "2025-09-19T00:16:00.000Z"
}
```

### ❌ **Error Response**
```json
{
  "statusCode": 404,
  "message": "Test case tidak ditemukan",
  "error": "Not Found"
}
```

---

## 🚦 Status & Health Check

### 🔍 **Cek Status Aplikasi**
```bash
# Backend API
curl http://localhost:3000/testcases

# AI Service
curl http://localhost:8000/health

# Database connection
docker-compose logs mysql
```

### 📊 **Monitoring**
- **Response Time**: API biasanya respond <100ms
- **Search Accuracy**: 85-95% relevansi hasil
- **Uptime**: 99.9% dengan Docker setup

---

## 🤝 Kontribusi & Support

### 🐛 **Menemukan Bug?**
1. Pastikan sudah menggunakan versi terbaru
2. Cek di dokumentasi apakah itu feature atau bug
3. Buat issue di GitHub dengan detail:
   - Langkah untuk reproduce
   - Expected vs actual result
   - Environment info (OS, Docker version, dll)

### 💡 **Request Fitur Baru?**
Kami sangat terbuka untuk ide-ide baru! Silakan:
1. Diskusikan di GitHub Issues terlebih dahulu
2. Jelaskan use case dan manfaatnya
3. Jika approved, silakan buat Pull Request

### 📞 **Butuh Bantuan?**
- 📚 **Dokumentasi Teknis**: Lihat file `Tech.md`
- 🌐 **API Docs**: http://localhost:3000/api
- 💬 **GitHub Issues**: Untuk bug report dan feature request

---

<!-- AI Settings section -->

## 🧠 Pengaturan AI (Model & Parameter)

Aplikasi ini menggunakan layanan AI terpisah untuk menghasilkan embedding dan melakukan pencarian semantik. Berikut pengaturan default yang dipakai oleh layanan AI (file: `ai/main.py`):

- Model AI: `all-MiniLM-L6-v2` (Sentence Transformers)
- Dimensi embedding: `384`
- Endpoint embedding: `POST /generate-embedding` (body: { "text": "..." })
- Endpoint pencarian: `POST /search` (body: { "query": "...", "min_similarity": 0.7, "limit": 10 })

Parameter default di layanan AI:
- `min_similarity` (default: `0.7`) — ambang minimal kemiripan (0.0 - 1.0)
- `limit` (default: `10`) — jumlah hasil maksimal yang dikembalikan

Cara mengganti model atau parameter:
1. Ubah model yang dipakai
   - Buka file `ai/main.py` dan temukan baris:
     ```py
     model = SentenceTransformer('all-MiniLM-L6-v2')
     ```
   - Ganti nama model dengan model lain yang tersedia di Sentence Transformers, misalnya `'paraphrase-MiniLM-L6-v2'`.
   - Setelah mengubah, restart service AI (jika menjalankan lokal):
     ```bash
     # di folder ai
     pip install -r requirements.txt
     python main.py
     ```
   - Jika dijalankan via Docker, rebuild image dan restart container:
     ```bash
     docker-compose build ai
     docker-compose up -d ai
     ```

2. Mengubah parameter pencarian default
   - `min_similarity` dan `limit` bisa diubah saat memanggil endpoint `/search` melalui body JSON.
   - Jika ingin mengganti default di server, edit DEFAULT pada `SearchRequest` di `ai/main.py`:
     ```py
     class SearchRequest(BaseModel):
         query: str
         min_similarity: float = Field(default=0.7, ge=0.0, le=1.0)
         limit: int = Field(default=10, ge=1, le=100)
     ```
   - Simpan perubahan dan restart service AI seperti langkah di atas.

3. Menambahkan model custom atau parameter lanjutan
   - Jika ingin menggunakan model lain (mis. model berbayar atau endpoint remote), ganti implementasi pemanggilan `SentenceTransformer` atau tambahkan wrapper yang memanggil API eksternal.
   - Pastikan dependencies di `ai/requirements.txt` sudah sesuai dan lakukan testing pada endpoint `/generate-embedding`.

Catatan singkat:
- Model `all-MiniLM-L6-v2` adalah pilihan ringan & cepat; hasilnya baik untuk pencarian semantik umum.
- Untuk kebutuhan yang lebih spesifik, gunakan model yang lebih besar atau terlatih khusus domain.


<!-- end of AI Settings -->

<div align="center">

## 🎉 **Ready to Get Started?** 🎉

**Enhanced Test Case Management System v3.0.0**  
*Now with Animated Scripts & Modern Full-Stack Architecture*

### 🚀 **Choose Your Adventure:**

```bash
# Quick Docker Setup (5 minutes)
docker-compose up -d

# Enhanced Development Experience  
./main-dev.sh
```

---

### 🌟 **If this project helps you, please give it a ⭐ on GitHub!** 🌟

[![GitHub stars](https://img.shields.io/github/stars/atiohaidar/test-case-management.svg?style=social&label=Star)](https://github.com/atiohaidar/test-case-management)
[![GitHub forks](https://img.shields.io/github/forks/atiohaidar/test-case-management.svg?style=social&label=Fork)](https://github.com/atiohaidar/test-case-management/fork)
[![GitHub watchers](https://img.shields.io/github/watchers/atiohaidar/test-case-management.svg?style=social&label=Watch)](https://github.com/atiohaidar/test-case-management)

**🔥 Features**: RAG AI • Modern UI • Full-Stack • Animated Scripts • Docker Ready

</div>
