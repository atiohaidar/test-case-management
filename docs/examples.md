# Test Case Examples

## Sample Test Cases for Testing the System

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
      "step": "Masukkan email yang valid",
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
```

### Search Test Cases
```bash
# Search for authentication related test cases
curl "http://localhost:3000/testcases/search?query=login%20authentication&minSimilarity=0.6&limit=5"

# Search for API related test cases  
curl "http://localhost:3000/testcases/search?query=API%20endpoint&minSimilarity=0.7&limit=3"

# Search for ecommerce functionality
curl "http://localhost:3000/testcases/search?query=shopping%20cart%20checkout&minSimilarity=0.5&limit=10"
```

## Expected Similarity Scores

Ketika melakukan search dengan contoh test cases di atas:

- **Query "login authentication"** → Test case login akan mendapat similarity ~0.85-0.95
- **Query "shopping cart"** → Test case e-commerce akan mendapat similarity ~0.80-0.90  
- **Query "API testing"** → Test case API akan mendapat similarity ~0.75-0.85
- **Query "user management"** → Test case user management akan mendapat similarity ~0.80-0.90

Similarity score berkisar antara 0-1, dimana:
- **0.9-1.0**: Sangat relevan
- **0.8-0.9**: Relevan  
- **0.7-0.8**: Cukup relevan
- **0.6-0.7**: Kurang relevan
- **<0.6**: Tidak relevan