Page All Testcase
- menampilkan semua list test case yang ada


Page Detailed Test Case
- menampilkan semua data dari full, jadi kelihatan semua informasi dari derifed dan references. token useage nya juga ada informasinya . jadi kelihatan token yang digunakn bagaimana
disini juga bisa update dan edit test case nya


Page buat test caase. disitu ada pilihan untuk membuat test case secara manual, kemudian disitu juga ada pilihan untuk membuatkan test case nya dengan
1. mencari secara manual mengguankan semantic search, kemudian digunakan pada test case tersebut (dengan bisa diedit), berarti tipe reference nya semantic search. 
2. menggunakan prompt tanpa diaktifkan RAG 
3. menggunakan prompt dengan diaktifkan RAG tipe reference nya semantic search

nah disini yang menggunakna prompt, tidak lagnsung disimpan, tapi di generate dulu, lalu nanti untuk hasilnya bisa di edit. dan menyimpan test case nya manual, tetapi tersimpan juga info kalau ini test case nya dari mana sumbernya. kalau di reference, kalau misal pure dari semantic search, berarti nanti reference type nya semantic search

terus kalau dari RAG Retrival yang AI, berarti namanya RAG Rerival


untuk method post nya seperti ini contohnya


curl -X POST http://localhost:3000/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Checkout dengan Multiple Payment Methods",
    "description": "Test proses checkout dengan berbagai metode pembayaran",
    "type": "positive",
    "priority": "high",
    "steps": [
      {
        "step": "Login dan tambah produk ke cart",
        "expectedResult": "Cart berisi produk"
      },
      {
        "step": "Proceed to checkout",
        "expectedResult": "Halaman checkout ditampilkan"
      },
      {
        "step": "Pilih payment method (Credit Card)",
        "expectedResult": "Payment form ditampilkan"
      },
      {
        "step": "Isi detail kartu kredit",
        "expectedResult": "Data berhasil diinput"
      },
      {
        "step": "Klik Place Order",
        "expectedResult": "Order berhasil dibuat"
      }
    ],
    "expectedResult": "Checkout berhasil dengan payment method yang dipilih",
    "tags": ["checkout", "payment", "ecommerce"],

    "aiGenerated": true,
    "originalPrompt": "Buat test case untuk checkout process di e-commerce dengan multiple payment methods",
    "aiGenerationMethod": "rag",
    "aiConfidence": 0.92,
    "tokenUsage": {
      "inputTokens": 140,
      "outputTokens": 380,
      "totalTokens": 520,
      "estimatedCost": 0.000260
    },
    "ragReferences": [
      {
        "testCaseId": "cmg0nd23b00038fg5l1ssnvwe",
        "similarity": 0.85
      },
      {
        "testCaseId": "cmg0ndtqd00048fg53pf5hkxf",
        "similarity": 0.78
      }
    ]

  }'

    # Step 1: Cari test case serupa
  curl -X GET "http://localhost:3000/testcases/search?query=login%20authentication&minSimilarity=0.7&limit=5"
  
  # Step 2: Pilih salah satu hasil (misal ID: abc-123-def) dan buat test case baru
  curl -X POST http://localhost:3000/testcases \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Login dengan Social Media",
      "description": "Test login menggunakan Google/Facebook OAuth",
      "type": "positive", 
      "priority": "medium",
      "steps": [
        {
          "step": "Buka halaman login",
          "expectedResult": "Halaman login dengan opsi social login ditampilkan"
        },
        {
          "step": "Klik Login dengan Google",
          "expectedResult": "Redirect ke Google OAuth"
        },
        {
          "step": "Authenticate berhasil",
          "expectedResult": "Redirect kembali dan login berhasil"
        }
      ],
      "expectedResult": "User berhasil login via social media",
      "tags": ["login", "social-auth", "oauth"],
      
      "referenceTo": "abc-123-def",
      "referenceType": "semantic_search"
    }'

        curl -X POST http://localhost:3000/testcases \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Checkout dengan Multiple Payment Methods",
        "description": "Test proses checkout dengan berbagai metode pembayaran",
        "type": "positive",
        "priority": "high",
        "steps": [
          {
            "step": "Login dan tambah produk ke cart",
            "expectedResult": "Cart berisi produk"
          },
          {
            "step": "Proceed to checkout",
            "expectedResult": "Halaman checkout ditampilkan"
          },
          {
            "step": "Pilih payment method (Credit Card)",
            "expectedResult": "Payment form ditampilkan"
          },
          {
            "step": "Isi detail kartu kredit",
            "expectedResult": "Data berhasil diinput"
          },
          {
            "step": "Klik Place Order",
            "expectedResult": "Order berhasil dibuat"
          }
        ],
        "expectedResult": "Checkout berhasil dengan payment method yang dipilih",
        "tags": ["checkout", "payment", "ecommerce"],
        
        "aiGenerated": true,
        "originalPrompt": "Buat test case untuk checkout process di e-commerce dengan multiple payment methods",
        "aiGenerationMethod": "rag",
        "aiConfidence": 0.92,
        "tokenUsage": {
          "inputTokens": 140,
          "outputTokens": 380,
          "totalTokens": 520,
          "estimatedCost": 0.000260
        },
        "ragReferences": [
          {
            "testCaseId": "xyz-789-abc",
            "similarity": 0.85
          },
          {
            "testCaseId": "def-456-ghi", 
            "similarity": 0.78
          }
        ]
      }'

            curl -X POST http://localhost:3000/testcases \
        -H "Content-Type: application/json" \
        -d '{
          "name": "Upload File Gambar dengan Validasi",
          "description": "Test upload file gambar dengan validasi format dan ukuran",
          "type": "positive",
          "priority": "high",
          "steps": [
            {
              "step": "Buka halaman upload file",
              "expectedResult": "Form upload ditampilkan"
            },
            {
              "step": "Pilih file gambar JPG valid (< 5MB)",
              "expectedResult": "File berhasil dipilih"
            },
            {
              "step": "Klik upload",
              "expectedResult": "File berhasil diupload dan ditampilkan"
            }
          ],
          "expectedResult": "File gambar berhasil diupload dengan validasi yang benar",
          "tags": ["upload", "file", "validation", "image"],
          
          "aiGenerated": true,
          "originalPrompt": "Buat test case untuk fitur upload file gambar dengan validasi format dan ukuran",
          "aiGenerationMethod": "pure_ai",
          "aiConfidence": 0.85,
          "tokenUsage": {
            "inputTokens": 120,
            "outputTokens": 350,
            "totalTokens": 470,
            "estimatedCost": 0.000235
          }
        }'

                # Step 1: Cari test case serupa
        curl -X GET "http://localhost:3000/testcases/search?query=login%20authentication&minSimilarity=0.7&limit=5"
        
        # Step 2: Pilih salah satu hasil (misal ID: abc-123-def) dan buat test case baru
        curl -X POST http://localhost:3000/testcases \
          -H "Content-Type: application/json" \
          -d '{
            "name": "Login dengan Social Media",
            "description": "Test login menggunakan Google/Facebook OAuth",
            "type": "positive", 
            "priority": "medium",
            "steps": [
              {
                "step": "Buka halaman login",
                "expectedResult": "Halaman login dengan opsi social login ditampilkan"
              },
              {
                "step": "Klik Login dengan Google",
                "expectedResult": "Redirect ke Google OAuth"
              },
              {
                "step": "Authenticate berhasil",
                "expectedResult": "Redirect kembali dan login berhasil"
              }
            ],
            "expectedResult": "User berhasil login via social media",
            "tags": ["login", "social-auth", "oauth"],
            
            "referenceTo": "abc-123-def",
            "referenceType": "semantic_search"
          }'

                    curl -X POST http://localhost:3000/testcases \
            -H "Content-Type: application/json" \
            -d '{
              "name": "Login dengan Email Valid",
              "description": "Memverifikasi proses login user dengan email dan password yang valid",
              "type": "positive",
              "priority": "high",
              "steps": [
                {
                  "step": "Buka halaman login aplikasi",
                  "expectedResult": "Halaman login ditampilkan dengan form email dan password"
                },
                {
                  "step": "Masukkan email yang valid: user@example.com",
                  "expectedResult": "Email berhasil diinput"
                },
                {
                  "step": "Masukkan password yang benar",
                  "expectedResult": "Password berhasil diinput"
                },
                {
                  "step": "Klik tombol Login",
                  "expectedResult": "User berhasil login dan diarahkan ke dashboard"
                }
              ],
              "expectedResult": "User berhasil login dan dapat mengakses fitur aplikasi",
              "tags": ["login", "authentication", "positive"]
            }'