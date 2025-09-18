# Test Case Management System

Sistem manajemen test case dengan fitur semantic search menggunakan NestJS (backend) dan Python (AI service).

## Fitur

- ✅ **CRUD Test Case**: Create, Read, Update, Delete test cases
- 🔍 **Semantic Search**: Pencarian test case menggunakan AI dengan similarity score
- 🎯 **Embedding Generation**: Otomatis generate embeddings untuk setiap test case
- 📊 **Similarity Scoring**: Menampilkan akurasi/similarity dalam hasil pencarian
- 📚 **API Documentation**: Swagger UI untuk dokumentasi API
- 🐳 **Docker Support**: Containerization untuk deployment yang mudah

## Struktur Project

```
test-case-management/
├── backend/                 # NestJS API Server
│   ├── src/
│   │   ├── testcase/       # Test case module
│   │   │   ├── entities/   # Database entities
│   │   │   ├── dto/        # Data transfer objects
│   │   │   ├── testcase.controller.ts
│   │   │   ├── testcase.service.ts
│   │   │   └── testcase.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── Dockerfile
│   └── .env
├── ai/                      # Python AI Service
│   ├── main.py             # FastAPI server
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── mysql/
│   └── init.sql            # Database initialization
├── docker-compose.yml
└── README.md
```

## Data Model TestCase

```typescript
interface TestCase {
  id: string;                          // UUID
  name: string;                        // Nama test case
  description: string;                 // Deskripsi detail
  type: 'positive' | 'negative';       // Jenis test case
  priority: 'high' | 'medium' | 'low'; // Prioritas
  steps: TestStep[];                   // Langkah-langkah test
  expectedResult: string;              // Hasil yang diharapkan
  tags: string[];                      // Tag untuk kategorisasi
  embedding?: string;                  // AI embedding (auto-generated)
  createdAt: Date;                     // Tanggal dibuat
  updatedAt: Date;                     // Tanggal diupdate
}

interface TestStep {
  step: string;                        // Langkah test
  expectedResult: string;              // Hasil yang diharapkan per step
}
```

## Quick Start

### 1. Menggunakan Docker (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd test-case-management

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 2. Manual Setup

#### Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```

#### AI Service (Python)
```bash
cd ai
pip install -r requirements.txt
python main.py
```

#### Database (MySQL)
```bash
# Setup MySQL dan buat database 'testcase_management'
```

## Endpoints API

### Test Case CRUD
- `POST /testcases` - Create test case
- `GET /testcases` - Get all test cases
- `GET /testcases/:id` - Get test case by ID
- `PATCH /testcases/:id` - Update test case
- `DELETE /testcases/:id` - Delete test case

### Semantic Search
- `GET /testcases/search?query=<search_term>&minSimilarity=0.7&limit=10`

### AI Service
- `POST /generate-embedding` - Generate embedding untuk text
- `POST /search` - Semantic search
- `GET /stats` - AI service statistics
- `GET /health` - Health check

## Contoh Penggunaan

### 1. Create Test Case
```bash
curl -X POST http://localhost:3000/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Login dengan email valid",
    "description": "Test case untuk memverifikasi login dengan email dan password yang valid",
    "type": "positive",
    "priority": "high",
    "steps": [
      {
        "step": "Buka halaman login",
        "expectedResult": "Halaman login ditampilkan"
      },
      {
        "step": "Input email valid",
        "expectedResult": "Email berhasil diinput"
      },
      {
        "step": "Input password valid",
        "expectedResult": "Password berhasil diinput"
      },
      {
        "step": "Klik tombol login",
        "expectedResult": "User berhasil login dan diarahkan ke dashboard"
      }
    ],
    "expectedResult": "User berhasil login dan dapat mengakses dashboard",
    "tags": ["login", "authentication", "positive-test"]
  }'
```

### 2. Semantic Search
```bash
curl "http://localhost:3000/testcases/search?query=login%20authentication&minSimilarity=0.7&limit=5"
```

Response akan menampilkan similarity score:
```json
[
  {
    "testCase": {
      "id": "...",
      "name": "Login dengan email valid",
      "description": "...",
      // ... other fields
    },
    "similarity": 0.8547  // Similarity score (0-1)
  }
]
```

## AI/Semantic Search

Sistem menggunakan:
- **Model**: `all-MiniLM-L6-v2` dari SentenceTransformers
- **Similarity**: Cosine similarity
- **Embedding**: 384 dimensi
- **Automatic**: Embedding di-generate otomatis saat create/update test case

### Cara Kerja:
1. Saat create/update test case → generate embedding dari gabungan semua text fields
2. Saat search → generate embedding dari query
3. Calculate cosine similarity antara query embedding dengan semua test case embeddings
4. Return results yang similarity-nya >= minSimilarity, diurutkan dari yang tertinggi

## Development

### Backend Development
```bash
cd backend
npm run start:dev  # Development mode dengan hot reload
npm run build      # Build untuk production
npm run test       # Run tests
```

### AI Service Development
```bash
cd ai
uvicorn main:app --reload  # Development mode dengan hot reload
```

### Database Migration
Backend menggunakan TypeORM dengan `synchronize: true` untuk development. Untuk production, disarankan menggunakan migration.

## Monitoring

- **Backend**: http://localhost:3000
- **API Docs**: http://localhost:3000/api (Swagger UI)
- **AI Service**: http://localhost:8000
- **AI Docs**: http://localhost:8000/docs (FastAPI docs)
- **Database**: localhost:3306

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=testcase_management
AI_SERVICE_URL=http://localhost:8000
NODE_ENV=development
PORT=3000
```

### AI Service (.env)
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=testcase_management
MODEL_NAME=all-MiniLM-L6-v2
HOST=0.0.0.0
PORT=8000
```

## Production Deployment

1. Set environment variables sesuai production
2. Disable TypeORM synchronize
3. Setup proper database migration
4. Use production-ready database (tidak menggunakan Docker MySQL untuk production besar)
5. Setup monitoring dan logging
6. Configure reverse proxy (Nginx)
7. Setup SSL/TLS

## Troubleshooting

### Common Issues

1. **AI Service tidak bisa connect ke database**
   - Check database connection
   - Pastikan MySQL sudah running
   - Verify credentials

2. **Embedding generation gagal**
   - Check AI service logs
   - Verify model download berhasil
   - Check memory usage

3. **Search tidak mengembalikan hasil**
   - Check apakah test case memiliki embedding
   - Coba turunkan minSimilarity
   - Check AI service health

### Logs
```bash
# Check Docker logs
docker-compose logs backend
docker-compose logs ai
docker-compose logs mysql

# Check service health
curl http://localhost:3000/health
curl http://localhost:8000/health
```

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Create pull request

## License

[Specify your license here]