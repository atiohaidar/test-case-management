#!/bin/bash

echo "🚀 Inserting demo test cases to backend..."

BASE_URL="http://localhost:3000"

# Check if backend is running
if ! curl -s $BASE_URL/health > /dev/null 2>&1; then
    echo "❌ Backend is not running on $BASE_URL"
    echo "Please start the backend first: cd backend && npm run start:dev"
    exit 1
fi

echo "✅ Backend is running, inserting test cases..."

# Test Case 1: Login Positive
echo "📝 Inserting: Login dengan kredensial valid..."
curl -s -X POST $BASE_URL/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Login dengan kredensial valid",
    "description": "Memverifikasi bahwa user dapat login dengan email dan password yang benar untuk mengakses sistem",
    "type": "positive",
    "priority": "high",
    "steps": [
      {"step": "Buka halaman login aplikasi", "expectedResult": "Halaman login ditampilkan dengan form email dan password"},
      {"step": "Masukkan email yang valid (test@example.com)", "expectedResult": "Email berhasil diinput tanpa error message"},
      {"step": "Masukkan password yang benar (password123)", "expectedResult": "Password berhasil diinput dan tersembunyi dengan asterisk"},
      {"step": "Klik tombol Login", "expectedResult": "User berhasil login dan diarahkan ke dashboard utama"}
    ],
    "expectedResult": "User berhasil masuk ke sistem dan dapat mengakses dashboard dengan menu navigasi yang lengkap",
    "tags": ["authentication", "login", "positive", "critical", "smoke-test"]
  }' | jq '.id // "Error"'

# Test Case 2: Login Negative  
echo "📝 Inserting: Login dengan password salah..."
curl -s -X POST $BASE_URL/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Login dengan password salah",
    "description": "Memverifikasi bahwa sistem menolak login dengan password yang salah dan menampilkan error message yang tepat",
    "type": "negative",
    "priority": "high",
    "steps": [
      {"step": "Buka halaman login aplikasi", "expectedResult": "Halaman login ditampilkan dengan form login"},
      {"step": "Masukkan email yang valid (test@example.com)", "expectedResult": "Email berhasil diinput"},
      {"step": "Masukkan password yang salah (wrongpassword)", "expectedResult": "Password berhasil diinput"},
      {"step": "Klik tombol Login", "expectedResult": "Sistem menampilkan error message Invalid credentials"}
    ],
    "expectedResult": "User tidak dapat login, tetap berada di halaman login dengan pesan error yang jelas dan tidak ada data sensitif yang terekspos",
    "tags": ["authentication", "login", "negative", "security", "error-handling"]
  }' | jq '.id // "Error"'

# Test Case 3: E-commerce Add to Cart
echo "📝 Inserting: Menambahkan produk ke keranjang belanja..."
curl -s -X POST $BASE_URL/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Menambahkan produk ke keranjang belanja",
    "description": "Memverifikasi functionality penambahan produk ke shopping cart dengan quantity yang tepat",
    "type": "positive",
    "priority": "high",
    "steps": [
      {"step": "Login sebagai customer yang valid", "expectedResult": "Berhasil login dan masuk ke halaman utama"},
      {"step": "Navigasi ke halaman produk atau search produk iPhone 15", "expectedResult": "Daftar produk iPhone 15 ditampilkan dengan informasi lengkap"},
      {"step": "Klik pada produk iPhone 15 Pro yang diinginkan", "expectedResult": "Halaman detail produk ditampilkan dengan harga, deskripsi, dan opsi quantity"},
      {"step": "Set quantity menjadi 2 unit", "expectedResult": "Quantity berhasil diatur ke 2 dan total harga terupdate"},
      {"step": "Klik tombol Add to Cart", "expectedResult": "Produk berhasil ditambahkan ke cart, cart counter bertambah menjadi 2"}
    ],
    "expectedResult": "Produk berhasil ditambahkan ke cart dengan quantity dan harga yang benar, cart icon menunjukkan jumlah item yang tepat",
    "tags": ["ecommerce", "cart", "shopping", "positive", "functional"]
  }' | jq '.id // "Error"'

# Test Case 4: API Testing
echo "📝 Inserting: API GET /users - Mengambil daftar user..."
curl -s -X POST $BASE_URL/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API GET /users - Mengambil daftar user",
    "description": "Memverifikasi endpoint API untuk mengambil daftar semua user dengan format response yang benar",
    "type": "positive",
    "priority": "medium",
    "steps": [
      {"step": "Setup API client dengan authentication token yang valid", "expectedResult": "API client berhasil dikonfigurasi dengan token"},
      {"step": "Send GET request ke endpoint /api/v1/users", "expectedResult": "Request berhasil dikirim tanpa error"},
      {"step": "Verify response status code adalah 200 OK", "expectedResult": "Status code 200 diterima"},
      {"step": "Verify response body structure dan data", "expectedResult": "Response berupa array of user objects dengan field id, name, email, role"},
      {"step": "Verify response time tidak lebih dari 2 detik", "expectedResult": "API response time kurang dari 2000ms"}
    ],
    "expectedResult": "API mengembalikan daftar user dengan format JSON yang benar, status code 200, dan response time yang acceptable",
    "tags": ["api", "get", "users", "positive", "performance"]
  }' | jq '.id // "Error"'

# Test Case 5: Search Functionality
echo "📝 Inserting: Pencarian produk dengan keyword valid..."
curl -s -X POST $BASE_URL/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pencarian produk dengan keyword valid",
    "description": "Memverifikasi fungsi search dapat menemukan produk berdasarkan keyword dengan hasil yang relevan",
    "type": "positive",
    "priority": "high",
    "steps": [
      {"step": "Buka halaman utama aplikasi e-commerce", "expectedResult": "Halaman utama ditampilkan dengan search box di header"},
      {"step": "Masukkan keyword laptop di search box", "expectedResult": "Keyword berhasil diinput dan muncul suggestion dropdown"},
      {"step": "Klik tombol search atau tekan Enter", "expectedResult": "Halaman hasil pencarian dimuat dengan loading indicator"},
      {"step": "Verify hasil pencarian menampilkan produk laptop", "expectedResult": "Daftar produk laptop ditampilkan dengan relevance yang baik"},
      {"step": "Verify ada filter dan sorting options", "expectedResult": "Filter harga, brand, dan sorting tersedia"}
    ],
    "expectedResult": "Sistem menampilkan hasil pencarian yang relevan dengan keyword laptop, disertai filter dan sorting yang berfungsi",
    "tags": ["search", "products", "positive", "functionality", "ui"]
  }' | jq '.id // "Error"'

echo ""
echo "✅ Demo data insertion completed!"
echo "🔍 You can now test semantic search with queries like:"
echo "  - login authentication"
echo "  - shopping cart ecommerce" 
echo "  - API testing"
echo "  - search functionality"
echo ""
echo "📊 Check all test cases: curl $BASE_URL/testcases"
echo "🔍 Search example: curl '$BASE_URL/testcases/search?query=login&minSimilarity=0.6&limit=5'"