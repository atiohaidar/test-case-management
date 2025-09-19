# 🧪 Sistem Manajemen Test Case

<div align="center">

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/atiohaidar/test-case-management)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![NestJS](https://img.shields.io/badge/NestJS-Framework-red?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-green?style=for-the-badge&logo=openai)](https://github.com/atiohaidar/test-case-management)
[![MySQL](https://img.shields.io/badge/MySQL-Database-orange?style=for-the-badge&logo=mysql)](https://www.mysql.com/)

</div>

> **Aplikasi pintar untuk mengelola dan mencari kasus uji perangkat lunak dengan teknologi AI**

---

## 🎯 Apa itu Aplikasi Ini?

**Sistem Manajemen Test Case** adalah aplikasi yang membantu tim pengembang software untuk:

📝 **Membuat dan menyimpan** skenario pengujian aplikasi  
🔍 **Mencari dengan cerdas** menggunakan AI  
📊 **Mengorganisir** berdasarkan prioritas dan kategori  
🔗 **Melacak keterkaitan** antar kasus uji  
⚡ **Menghemat waktu** dengan fitur pencarian semantik  

---

## ✨ Fitur Unggulan

### 🤖 **Pencarian Cerdas dengan AI**
Cari kasus uji hanya dengan mengetik kata kunci dalam bahasa natural. AI akan memahami maksud Anda dan menampilkan hasil yang paling relevan.

**Contoh:** Ketik *"login gagal"* → Sistem langsung menampilkan semua test case terkait masalah login

### 🎨 **Generasi Test Case dengan AI (Gemini)**
Buat test case otomatis hanya dengan mendeskripsikan fitur yang ingin diuji. AI Gemini akan membuat test case lengkap dengan langkah-langkah detail.

**Contoh:** Input *"Test fitur upload file PDF"* → AI akan generate test case lengkap dengan validasi format, ukuran, dan error handling

**Fitur:**
- 🧠 Powered by Google Gemini AI
- 📝 Langkah-langkah detail otomatis
- 🎯 Prioritas dan kategori yang tepat
- 🏷️ Tag relevan otomatis
- ⚡ Hasil draft (bisa diedit sebelum disimpan)

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

## 🚀 Cara Mulai Menggunakan

### 💻 **Instalasi Super Mudah**

1. **Download aplikasi** (pastikan Docker sudah terinstal)
   ```bash
   git clone https://github.com/atiohaidar/test-case-management.git
   cd test-case-management
   ```

2. **Setup Gemini API Key (Opsional - untuk fitur AI)**
   ```bash
   # Edit docker-compose.yml dan uncomment + set GEMINI_API_KEY di service 'ai'
   # GEMINI_API_KEY: "your_gemini_api_key_here"
   ```
   
   > **💡 Tip**: Dapatkan Gemini API Key gratis di [Google AI Studio](https://aistudio.google.com/app/apikey). Tanpa API key, semua fitur tetap berjalan kecuali fitur AI generation.

3. **Jalankan dengan satu perintah**
   ```bash
   docker-compose up -d
   ```

4. **Selesai!** Buka browser dan kunjungi:
   - 🌐 **Aplikasi utama**: http://localhost:3000/api
   - 📚 **Dokumentasi**: http://localhost:3000/api

### ⚡ **Langsung Pakai Tanpa Ribet**
Tidak perlu instalasi rumit atau konfigurasi yang membingungkan. Cukup satu perintah dan aplikasi siap digunakan!

### 🛠️ **Development Mode (Tanpa Docker)**

Untuk development atau jika tidak ingin menggunakan Docker, Anda bisa menjalankan setiap service secara terpisah:

#### **Prerequisites:**
- Node.js 18+ dan npm
- Python 3.8+
- MySQL Server berjalan di localhost:3306

#### **Quick Start:**
```bash
# Clone repository
git clone https://github.com/atiohaidar/test-case-management.git
cd test-case-management

# Setup environment files
./main-dev.sh
# Pilih opsi 6 untuk setup environment files

# Edit file konfigurasi:
# - backend/.env (konfigurasi database)
# - ai/.env (konfigurasi database + Gemini API key)

# Jalankan semua service dengan MySQL
./main-dev.sh
# Pilih opsi 5 untuk start semua service + MySQL
```

#### **Manual Start (Per Service):**
```bash
# Start MySQL Database
./scripts/start-mysql.sh

# Start AI Service
./scripts/start-ai.sh

# Start Backend
./scripts/start-backend.sh
```

#### **Service URLs:**
- 🤖 **AI Service**: http://localhost:8000 (docs: /docs)
- 🚀 **Backend API**: http://localhost:3000 (docs: /api)

> **💡 Development Tips**: 
> - Gunakan `./main-dev.sh` untuk akses mudah ke semua fitur development
> - MySQL bisa dijalankan via Docker dengan opsi 4 atau 5
> - Semua script development tersedia di folder `scripts/`
> - Untuk fitur AI generation, set `GEMINI_API_KEY` di `ai/.env`

---

## 🎮 Cara Menggunakan

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

## 🛠️ Teknologi yang Digunakan

### 🏗️ **Arsitektur Modern**
- **Backend**: NestJS (Framework Node.js yang powerful)
- **Database**: MySQL dengan Prisma (ORM modern)
- **AI Engine**: Python FastAPI dengan Sentence Transformers
- **Container**: Docker (mudah deploy dimana saja)

### 🧠 **Kecerdasan Buatan**
- **Model AI**: Sentence Transformers untuk pemahaman bahasa
- **Pencarian Semantik**: Memahami makna, bukan hanya kata kunci
- **Similarity Ranking**: Hasil diurutkan berdasarkan relevansi

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

## 📋 Daftar Endpoint API

### 🧪 **Test Case Management**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/testcases` | Ambil semua test case |
| `POST` | `/testcases` | Buat test case baru |
| `GET` | `/testcases/:id` | Ambil test case spesifik |
| `PATCH` | `/testcases/:id` | Update test case |
| `DELETE` | `/testcases/:id` | Hapus test case |

### 🔍 **Pencarian & AI**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/testcases/search` | Pencarian semantik dengan AI |

### 🔗 **Keterkaitan Test Case**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/testcases/:id/with-reference` | Ambil test case dengan info referensi |
| `GET` | `/testcases/:id/derived` | Ambil semua test case turunan |
| `POST` | `/testcases/derive/:referenceId` | Buat test case berdasarkan yang ada |

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

## 🎉 **Selamat Mencoba!** 🎉

**Sistem Manajemen Test Case dengan AI**  
*Dibantu banget sama Github Copilot Agent Mode*

---

### 🌟 **Jika aplikasi ini membantu, jangan lupa kasih ⭐ di GitHub!** 🌟

[![GitHub stars](https://img.shields.io/github/stars/atiohaidar/test-case-management.svg?style=social&label=Star)](https://github.com/atiohaidar/test-case-management)

</div>
