# Test Case Examples with RAG Implementation

## 🎯 Overview
Dokumen ini berisi contoh-contoh test case dan cara menggunakan fitur RAG (Retrieval-Augmented Generation) untuk membuat test case yang lebih konsisten dan berkualitas.

## 📋 Sample Test Cases untuk RAG Testing

### 1. Authentication Test Cases

#### Positive Test Case - Valid Login
```json
{
  "name": "Login dengan kredensial valid",
  "description": "Memverifikasi bahwa user dapat login dengan email dan password yang benar",
  "type": "positive",
  "priority": "high",
  "steps": [
    {
      "step": "Buka halaman login",
      "expectedResult": "Halaman login ditampilkan dengan form email dan password"
    },
    {
      "step": "Masukkan email yang valid (test@example.com)",
      "expectedResult": "Email berhasil diinput tanpa error"
    },
    {
      "step": "Masukkan password yang benar",
      "expectedResult": "Password berhasil diinput dan tersembunyi"
    },
    {
      "step": "Klik tombol 'Login'",
      "expectedResult": "User berhasil login dan diarahkan ke dashboard"
    }
  ],
  "expectedResult": "User berhasil masuk ke sistem dan dapat mengakses dashboard utama",
  "tags": ["authentication", "login", "positive", "critical"]
}
```

#### Negative Test Case - Invalid Password
```json
{
  "name": "Login dengan password salah",
  "description": "Memverifikasi bahwa sistem menolak login dengan password yang salah",
  "type": "negative",
  "priority": "high",
  "steps": [
    {
      "step": "Buka halaman login",
      "expectedResult": "Halaman login ditampilkan"
    },
    {
      "step": "Masukkan email yang valid (test@example.com)",
      "expectedResult": "Email berhasil diinput"
    },
    {
      "step": "Masukkan password yang salah",
      "expectedResult": "Password berhasil diinput"
    },
    {
      "step": "Klik tombol 'Login'",
      "expectedResult": "Sistem menampilkan pesan error 'Invalid credentials'"
    }
  ],
  "expectedResult": "User tidak dapat login dan tetap berada di halaman login dengan pesan error yang jelas",
  "tags": ["authentication", "login", "negative", "security"]
}
```

### 2. User Management Test Cases

#### Positive Test Case - Create User
```json
{
  "name": "Membuat user baru dengan data lengkap",
  "description": "Memverifikasi pembuatan user baru dengan semua field yang diperlukan",
  "type": "positive",
  "priority": "medium",
  "steps": [
    {
      "step": "Navigasi ke halaman 'Add User'",
      "expectedResult": "Form pembuatan user ditampilkan"
    },
    {
      "step": "Isi field nama dengan 'John Doe'",
      "expectedResult": "Nama berhasil diinput"
    },
    {
      "step": "Isi field email dengan 'john@example.com'",
      "expectedResult": "Email berhasil diinput"
    },
    {
      "step": "Pilih role 'Admin'",
      "expectedResult": "Role berhasil dipilih"
    },
    {
      "step": "Klik tombol 'Save'",
      "expectedResult": "User baru berhasil dibuat dan muncul di daftar user"
    }
  ],
  "expectedResult": "User baru berhasil dibuat dan tersimpan dalam sistem",
  "tags": ["user-management", "create", "admin", "positive"]
}
```

### 3. E-commerce Test Cases

#### Positive Test Case - Add to Cart
```json
{
  "name": "Menambahkan produk ke keranjang belanja",
  "description": "Memverifikasi functionality penambahan produk ke shopping cart",
  "type": "positive",
  "priority": "high",
  "steps": [
    {
      "step": "Login sebagai customer",
      "expectedResult": "Berhasil login dan masuk ke halaman utama"
    },
    {
      "step": "Cari produk 'iPhone 15'",
      "expectedResult": "Daftar produk iPhone 15 ditampilkan"
    },
    {
      "step": "Klik pada produk yang diinginkan",
      "expectedResult": "Halaman detail produk ditampilkan"
    },
    {
      "step": "Pilih quantity 2",
      "expectedResult": "Quantity berhasil diatur ke 2"
    },
    {
      "step": "Klik tombol 'Add to Cart'",
      "expectedResult": "Produk berhasil ditambahkan ke cart, cart counter bertambah"
    }
  ],
  "expectedResult": "Produk berhasil ditambahkan ke cart dengan quantity yang benar",
  "tags": ["ecommerce", "cart", "shopping", "positive"]
}
```

#### Negative Test Case - Empty Cart Checkout
```json
{
  "name": "Checkout dengan keranjang kosong",
  "description": "Memverifikasi bahwa sistem mencegah checkout dengan cart yang kosong",
  "type": "negative",
  "priority": "medium",
  "steps": [
    {
      "step": "Login sebagai customer",
      "expectedResult": "Berhasil login"
    },
    {
      "step": "Pastikan cart kosong",
      "expectedResult": "Cart menampilkan 0 items"
    },
    {
      "step": "Navigasi ke halaman checkout",
      "expectedResult": "Halaman checkout dapat diakses"
    },
    {
      "step": "Coba klik tombol 'Place Order'",
      "expectedResult": "Sistem menampilkan error 'Cart is empty'"
    }
  ],
  "expectedResult": "Checkout tidak dapat dilakukan dan user diberikan pesan error yang jelas",
  "tags": ["ecommerce", "checkout", "negative", "validation"]
}
```

### 4. API Test Cases

#### Positive Test Case - Get User List
```json
{
  "name": "API GET /users - Mengambil daftar user",
  "description": "Memverifikasi endpoint API untuk mengambil daftar semua user",
  "type": "positive",
  "priority": "medium",
  "steps": [
    {
      "step": "Setup API client dengan valid token",
      "expectedResult": "API client siap digunakan"
    },
    {
      "step": "Send GET request ke /api/users",
      "expectedResult": "Request berhasil dikirim"
    },
    {
      "step": "Verify response status code",
      "expectedResult": "Status code 200 OK"
    },
    {
      "step": "Verify response body structure",
      "expectedResult": "Response berupa array of user objects dengan field id, name, email"
    }
  ],
  "expectedResult": "API mengembalikan daftar user dengan format yang benar",
  "tags": ["api", "get", "users", "positive"]
}
```

### 5. Search Functionality Test Cases

#### Positive Test Case - Search Products
```json
{
  "name": "Pencarian produk dengan keyword valid",
  "description": "Memverifikasi fungsi search dapat menemukan produk berdasarkan keyword",
  "type": "positive",
  "priority": "high",
  "steps": [
    {
      "step": "Buka halaman utama aplikasi",
      "expectedResult": "Halaman utama ditampilkan dengan search box"
    },
    {
      "step": "Masukkan keyword 'laptop' di search box",
      "expectedResult": "Keyword berhasil diinput"
    },
    {
      "step": "Klik tombol search atau tekan Enter",
      "expectedResult": "Pencarian dimulai"
    },
    {
      "step": "Verify hasil pencarian",
      "expectedResult": "Daftar produk laptop ditampilkan dengan relevance yang baik"
    }
  ],
  "expectedResult": "Sistem menampilkan hasil pencarian yang relevan dengan keyword 'laptop'",
  "tags": ["search", "products", "positive", "functionality"]
}
```

## How to Use These Examples

1. **Copy the JSON** dari salah satu contoh di atas
2. **Paste ke API call** untuk create test case
3. **Modify sesuai kebutuhan** Anda
4. **Test semantic search** dengan query yang relevan

## Example API Calls

### Create Test Case
```bash
curl -X POST http://localhost:3000/testcases \
  -H "Content-Type: application/json" \
  -d '{"name":"Login dengan kredensial valid","description":"Memverifikasi bahwa user dapat login dengan email dan password yang benar","type":"positive","priority":"high","steps":[{"step":"Buka halaman login","expectedResult":"Halaman login ditampilkan dengan form email dan password"}],"expectedResult":"User berhasil masuk ke sistem","tags":["authentication","login","positive","critical"]}'
---

## 🤖 RAG Implementation Examples

### Step 1: Create Sample Test Cases untuk RAG
Pertama, buat beberapa test case yang akan dijadikan referensi:

```bash
# Test Case 1 - Login Testing
curl -X POST http://localhost:3000/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Login dengan Email Valid",
    "description": "Memverifikasi bahwa user dapat login dengan email dan password yang valid",
    "type": "positive",
    "priority": "high",
    "steps": [
      {
        "step": "Buka halaman login",
        "expectedResult": "Halaman login ditampilkan"
      },
      {
        "step": "Masukkan email valid: test@example.com",
        "expectedResult": "Email terisi di field email"
      },
      {
        "step": "Masukkan password valid: password123",
        "expectedResult": "Password terisi di field password"
      },
      {
        "step": "Klik tombol Login",
        "expectedResult": "User berhasil login dan diarahkan ke dashboard"
      }
    ],
    "expectedResult": "User berhasil masuk ke sistem dan dapat mengakses dashboard",
    "tags": ["login", "authentication", "positive"]
  }'

# Test Case 2 - Registration Testing  
curl -X POST http://localhost:3000/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Registrasi User Baru",
    "description": "Memverifikasi proses registrasi user baru dengan data valid",
    "type": "positive",
    "priority": "high",
    "steps": [
      {
        "step": "Buka halaman registrasi",
        "expectedResult": "Form registrasi ditampilkan"
      },
      {
        "step": "Isi nama lengkap: John Doe",
        "expectedResult": "Nama terisi di field name"
      },
      {
        "step": "Isi email: john@example.com",
        "expectedResult": "Email terisi di field email"
      },
      {
        "step": "Isi password: securepass123",
        "expectedResult": "Password terisi dan disembunyikan"
      },
      {
        "step": "Klik tombol Register",
        "expectedResult": "Akun berhasil dibuat dan user mendapat konfirmasi"
      }
    ],
    "expectedResult": "User baru berhasil terdaftar dalam sistem",
    "tags": ["registration", "user-management", "positive"]
  }'
```

### Step 2: Test RAG Generation

#### Example 1: RAG untuk Login-related Test Case
```bash
# Prompt yang akan mencari referensi login test case
curl -X POST http://localhost:3000/testcases/generate-with-ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Buat test case untuk logout user dari sistem",
    "useRAG": true,
    "ragSimilarityThreshold": 0.6,
    "maxRAGReferences": 3,
    "preferredType": "positive",
    "preferredPriority": "medium"
  }'
```

**Expected RAG Response:**
```json
{
  "name": "Test Logout User dari Sistem",
  "description": "Memverifikasi proses logout user dari sistem",
  "type": "positive",
  "priority": "medium",
  "steps": [
    {
      "step": "User sudah dalam keadaan login",
      "expectedResult": "Dashboard user ditampilkan"
    },
    {
      "step": "Klik menu profile atau user settings",
      "expectedResult": "Dropdown menu ditampilkan"
    },
    {
      "step": "Klik tombol Logout",
      "expectedResult": "User berhasil logout dan diarahkan ke halaman login"
    }
  ],
  "expectedResult": "User berhasil logout dan tidak dapat mengakses halaman yang memerlukan autentikasi",
  "tags": ["logout", "authentication", "positive"],
  "originalPrompt": "Buat test case untuk logout user dari sistem",
  "aiGenerated": true,
  "confidence": 0.85,
  "aiGenerationMethod": "rag",
  "tokenUsage": {
    "inputTokens": 120,
    "outputTokens": 350,
    "totalTokens": 470,
    "estimatedCost": 0.000235
  },
  "ragReferences": [
    {
      "testCaseId": "cm123abc456",
      "similarity": 0.82,
      "testCase": {
        "id": "cm123abc456",
        "name": "Test Login dengan Email Valid",
        "type": "positive",
        "priority": "high",
        "tags": ["login", "authentication"]
      }
    }
  ]
}
```

#### Example 2: RAG untuk Registration-related Test Case
```bash
# Prompt yang akan mencari referensi registration test case
curl -X POST http://localhost:3000/testcases/generate-with-ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Buat test case untuk registrasi dengan email yang sudah terdaftar",
    "useRAG": true,
    "ragSimilarityThreshold": 0.6,
    "maxRAGReferences": 3,
    "preferredType": "negative",
    "preferredPriority": "high"
  }'
```

#### Example 3: Generate and Save dengan RAG
```bash
# Langsung save ke database dengan RAG references
curl -X POST http://localhost:3000/testcases/generate-and-save-with-ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Buat test case untuk reset password user",
    "useRAG": true,
    "ragSimilarityThreshold": 0.6,
    "maxRAGReferences": 3,
    "context": "Aplikasi web dengan sistem user management",
    "preferredType": "positive",
    "preferredPriority": "medium"
  }'
```

### Step 3: Verify RAG References
```bash
# Lihat test case yang baru dibuat beserta referensinya
curl -X GET http://localhost:3000/testcases/{new-test-case-id}/with-reference
```

### Step 4: Get Complete Reference & Derived Information
```bash
# Lihat test case dengan informasi lengkap (references + derived)
curl -X GET http://localhost:3000/testcases/{new-test-case-id}/full
```

**Expected Response dengan Complete Information:**
```json
{
  "id": "cm456def789",
  "name": "Test Reset Password User",
  "description": "Memverifikasi proses reset password user",
  "type": "positive",
  "priority": "medium",
  "aiGenerated": true,
  "originalPrompt": "Buat test case untuk reset password user",
  "aiConfidence": 0.87,
  "aiGenerationMethod": "rag",
  "tokenUsage": {
    "inputTokens": 140,
    "outputTokens": 380,
    "totalTokens": 520,
    "estimatedCost": 0.000260
  },
  "createdAt": "2025-09-19T10:30:00Z",
  "updatedAt": "2025-09-19T10:30:00Z",
  
  // Outgoing references (test cases this one refers to)
  "references": [
    {
      "id": "ref123",
      "targetId": "cm123abc456",
      "referenceType": "rag_retrieval",
      "similarityScore": 0.75,
      "createdAt": "2025-09-19T10:30:00Z",
      "target": {
        "id": "cm123abc456",
        "name": "Test Login dengan Email Valid",
        "type": "positive",
        "priority": "high",
        "createdAt": "2025-09-19T09:00:00Z"
      }
    }
  ],
  
  // Incoming references (test cases that reference this one)
  "derivedTestCases": [
    {
      "id": "cm789ghi012",
      "name": "Test Reset Password dengan Email Invalid",
      "type": "negative",
      "priority": "medium",
      "createdAt": "2025-09-19T11:00:00Z",
      "aiGenerated": true,
      "referenceInfo": {
        "id": "ref456",
        "referenceType": "derived",
        "similarityScore": null,
        "createdAt": "2025-09-19T11:00:00Z"
      }
    }
  ],
  
  // Summary counts
  "referencesCount": 1,
  "derivedCount": 1
}
```

**Use Cases untuk `/full` Endpoint:**
- **Complete Test Case Analysis**: Melihat seluruh network relationship
- **Quality Assurance**: Menganalisis consistency berdasarkan references
- **Test Case Dependencies**: Memahami impact analysis saat ada perubahan
- **AI Generation Review**: Melihat kualitas RAG retrieval dan derived test cases

**Expected Response dengan References:**
```json
{
  "id": "cm456def789",
  "name": "Test Reset Password User", 
  "description": "Memverifikasi proses reset password user",
  "type": "positive",
  "priority": "medium",
  "aiGenerated": true,
  "aiGenerationMethod": "rag",
  "references": [
    {
      "id": "ref123",
      "targetId": "cm123abc456",
      "similarityScore": 0.75,
      "referenceType": "rag_retrieval",
      "target": {
        "id": "cm123abc456",
        "name": "Test Login dengan Email Valid",
        "type": "positive",
        "priority": "high"
      }
    }
  ],
  "derivedCount": 1
}
```

### Comparison: Pure AI vs RAG

#### Pure AI Generation
```bash
# Generate tanpa RAG (Pure AI)
curl -X POST http://localhost:3000/testcases/generate-with-ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Buat test case untuk proses pembayaran",
    "useRAG": false,
    "preferredType": "positive",
    "preferredPriority": "high"
  }'
```

#### RAG Generation  
```bash
# Generate dengan RAG (akan mencari test case relevan)
curl -X POST http://localhost:3000/testcases/generate-with-ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Buat test case untuk proses pembayaran",
    "useRAG": true,
    "ragSimilarityThreshold": 0.6,
    "maxRAGReferences": 3,
    "preferredType": "positive", 
    "preferredPriority": "high"
  }'
```

### Search Test Cases
```bash
# Search for authentication related test cases
curl "http://localhost:3000/testcases/search?query=login%20authentication&minSimilarity=0.6&limit=5"

# Search for registration related test cases
curl "http://localhost:3000/testcases/search?query=user%20registration%20sign%20up&minSimilarity=0.5&limit=3"

# Search for logout functionality
curl "http://localhost:3000/testcases/search?query=logout%20sign%20out&minSimilarity=0.6&limit=5"
```

## 📊 Expected Similarity Scores

Ketika melakukan RAG generation dengan contoh test cases di atas:

- **Query "logout user"** → Login test case akan mendapat similarity ~0.75-0.85
- **Query "registrasi email terdaftar"** → Registration test case akan mendapat similarity ~0.80-0.90  
- **Query "reset password"** → Login/Registration test cases akan mendapat similarity ~0.65-0.75
- **Query "user authentication"** → Authentication test cases akan mendapat similarity ~0.85-0.95

Similarity score berkisar antara 0-1, dimana:
- **0.9-1.0**: Sangat relevan
- **0.8-0.9**: Relevan  
- **0.7-0.8**: Cukup relevan
- **0.6-0.7**: Kurang relevan
- **<0.6**: Tidak relevan

## 🎯 RAG Best Practices

1. **Threshold Setting**: 
   - Gunakan 0.7+ untuk hasil yang sangat relevan
   - Gunakan 0.6+ untuk cakupan yang lebih luas
   - Gunakan 0.5+ untuk eksplorasi

2. **Max References**: 
   - 1-2 untuk fokus yang sangat spesifik
   - 3-5 untuk balance antara context dan relevance
   - 5+ untuk eksplorasi yang luas

3. **Prompt Quality**:
   - Gunakan keyword yang jelas dan spesifik
   - Sertakan konteks domain jika perlu
   - Hindari prompt yang terlalu umum atau ambigu
- **0.7-0.8**: Cukup relevan
- **0.6-0.7**: Kurang relevan
- **<0.6**: Tidak relevan