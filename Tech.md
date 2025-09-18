# Dokumentasi Teknis - Test Case Management System

## 🔧 Teknologi yang Digunakan

### Backend Stack
- **NestJS** (v10.3.0) - Framework Node.js untuk REST API
- **Prisma** (v5.6.0) - ORM (Object-Relational Mapping) untuk database
- **TypeScript** (v5.3.3) - Typed JavaScript untuk development
- **MySQL** (v8.0) - Relational database
- **Swagger** - API documentation dan testing interface
- **Class Validator** - Input validation dan transformation
- **Axios** - HTTP client untuk komunikasi dengan AI service

### AI/ML Stack
- **FastAPI** (v0.115.0) - Python web framework untuk AI service
- **Sentence Transformers** (v3.2.1) - Model untuk generate text embeddings
- **Scikit-learn** (v1.5.2) - Machine learning utilities untuk similarity calculation
- **NumPy** (v2.1.1) - Scientific computing library
- **Uvicorn** - ASGI server untuk FastAPI

### Infrastructure & DevOps
- **Docker** & **Docker Compose** - Containerization dan orchestration
- **MySQL Connector** - Database driver untuk Python
- **Node.js** (runtime untuk NestJS)
- **Python** (runtime untuk AI service)

### Development Tools
- **Jest** - Testing framework
- **ESLint** & **Prettier** - Code linting dan formatting
- **TypeScript** - Static type checking
- **Prisma Studio** - Database GUI management

---

## 🏗️ Arsitektur Sistem

### Overview Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client/API    │    │   NestJS API    │    │  Python AI      │
│   (HTTP/REST)   │◄──►│   (Backend)     │◄──►│   Service       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                        ┌─────────────────┐    ┌─────────────────┐
                        │   MySQL DB      │    │  ML Models      │
                        │   (Prisma ORM)  │    │  (Transformers) │
                        └─────────────────┘    └─────────────────┘
```

### 1. **Frontend Layer (Client)**
- REST API calls melalui HTTP
- JSON format untuk data exchange
- Swagger UI untuk API testing dan documentation

### 2. **Backend Layer (NestJS)**
**Port**: 3000
**Responsibilities**:
- HTTP request handling dan routing
- Business logic untuk CRUD operations
- Data validation menggunakan DTOs
- Database operations melalui Prisma ORM
- Integration dengan AI service untuk embedding generation
- API documentation dengan Swagger

**Core Modules**:
```typescript
AppModule
├── ConfigModule (Global configuration)
├── PrismaService (Database connection)
└── TestCaseModule
    ├── TestCaseController (HTTP endpoints)
    ├── TestCaseService (Business logic)
    └── DTOs (Data validation)
```

### 3. **AI Service Layer (Python/FastAPI)**
**Port**: 8000
**Responsibilities**:
- Text embedding generation menggunakan pre-trained models
- Semantic search dengan cosine similarity
- Vector operations dan similarity calculations
- ML model management

**Key Components**:
- **Embedding Generation**: Menggunakan sentence-transformers model
- **Similarity Search**: Cosine similarity calculation dengan scikit-learn
- **Database Integration**: Direct MySQL connection untuk vector operations

### 4. **Database Layer (MySQL)**
**Port**: 3306
**Schema Management**: Prisma ORM dengan code-first approach

---

## 📊 Database Schema (Prisma)

```prisma
model TestCase {
  id             String            @id @default(cuid())
  name           String            // Nama test case
  description    String            @db.Text // Deskripsi detail
  type           TestCaseType      // positive | negative
  priority       TestCasePriority  // high | medium | low
  steps          Json              // Array of TestStep objects
  expectedResult String            @db.Text // Expected result
  tags           Json              // Array of string tags
  embedding      String?           @db.Text // AI-generated embeddings (JSON array)
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
  
  @@map("testcases")
}

enum TestCaseType {
  positive
  negative
}

enum TestCasePriority {
  high
  medium
  low
}
```

**TestStep Interface**:
```typescript
interface TestStep {
  step: string;           // Langkah yang harus dilakukan
  expectedResult: string; // Hasil yang diharapkan dari langkah ini
}
```

---

## 🔄 Flow Sistem Secara Teknis

### 1. **Create Test Case Flow**
```mermaid
sequenceDiagram
    Client->>+NestJS: POST /testcases
    NestJS->>+NestJS: Validate DTO
    NestJS->>+AI Service: POST /generate-embedding
    AI Service->>+AI Service: Generate text embedding
    AI Service-->>-NestJS: Return embedding array
    NestJS->>+Prisma: Create record with embedding
    Prisma->>+MySQL: INSERT INTO testcases
    MySQL-->>-Prisma: Success
    Prisma-->>-NestJS: Return created record
    NestJS-->>-Client: HTTP 201 + TestCase data (without embedding)
```

### 2. **Semantic Search Flow**
```mermaid
sequenceDiagram
    Client->>+NestJS: GET /testcases/search?query=...
    NestJS->>+AI Service: POST /search
    AI Service->>+AI Service: Generate query embedding
    AI Service->>+MySQL: SELECT embeddings from testcases
    MySQL-->>-AI Service: Return all embeddings
    AI Service->>+AI Service: Calculate cosine similarity
    AI Service->>+AI Service: Filter by min_similarity & limit
    AI Service-->>-NestJS: Return search results with scores
    NestJS-->>-Client: HTTP 200 + SearchResult[]
```

### 3. **CRUD Operations Flow**
```mermaid
sequenceDiagram
    Client->>+NestJS: GET/PUT/DELETE /testcases/:id
    NestJS->>+Prisma: findUnique/update/delete
    Prisma->>+MySQL: SELECT/UPDATE/DELETE
    MySQL-->>-Prisma: Result
    Note over NestJS: For UPDATE: regenerate embedding
    alt Update Operation
        NestJS->>+AI Service: POST /generate-embedding
        AI Service-->>-NestJS: New embedding
    end
    Prisma-->>-NestJS: Final result
    NestJS-->>-Client: HTTP response (embedding filtered out)
```

---

## 🚀 API Endpoints

### TestCase CRUD
```http
# Create Test Case
POST /testcases
Content-Type: application/json

# Get All Test Cases
GET /testcases

# Get Test Case by ID  
GET /testcases/:id

# Update Test Case
PATCH /testcases/:id

# Delete Test Case
DELETE /testcases/:id

# Semantic Search
GET /testcases/search?query=login&minSimilarity=0.7&limit=10
```

### AI Service Internal APIs
```http
# Generate Embedding
POST /generate-embedding
{
  "text": "combined text from name, description, tags"
}

# Semantic Search
POST /search
{
  "query": "search query",
  "min_similarity": 0.7,
  "limit": 10
}
```

---

## 🔐 Security & Configuration

### Environment Variables
**Backend (.env)**:
```bash
DATABASE_URL="mysql://root:password@localhost:3306/testcase_management"
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=testcase_management
AI_SERVICE_URL=http://localhost:8000
NODE_ENV=development
PORT=3000
```

**AI Service (.env)**:
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=testcase_management
MODEL_NAME=all-MiniLM-L6-v2
```

### Data Security
- **Input Validation**: Class-validator pada semua DTOs
- **Type Safety**: TypeScript untuk compile-time checking
- **Database**: Prisma ORM mencegah SQL injection
- **Environment**: Sensitive data disimpan di environment variables

---

## 🐳 Docker Configuration

### Multi-Container Setup
- **mysql**: Database server (port 3306)
- **backend**: NestJS API server (port 3000)  
- **ai**: Python AI service (port 8000)

### Network Configuration
- Internal Docker network: `testcase_network`
- Services berkomunikasi melalui container names
- Hanya port 3000 (API) yang di-expose ke host

### Volume Management
- **mysql_data**: Persistent storage untuk MySQL
- **init.sql**: Database initialization script

---

## 📈 Performance Considerations

### Embedding Strategy
- **Selective Embedding**: Hanya name, description, dan tags yang di-embed (bukan steps & expectedResult)
- **Caching**: Embeddings disimpan di database untuk menghindari re-computation
- **Async Processing**: Embedding generation tidak memblokir response

### Database Optimization
- **Indexes**: Primary key pada id (cuid)
- **Text Fields**: Menggunakan TEXT type untuk large content
- **JSON Storage**: Steps dan tags disimpan sebagai JSON untuk flexibility

### Search Performance
- **Cosine Similarity**: Efficient vector similarity calculation
- **Filtering**: min_similarity dan limit untuk relevant results
- **Vector Operations**: NumPy untuk optimized mathematical operations

---

## 🔧 Development Workflow

### Local Development
```bash
# 1. Start services
docker-compose up -d mysql ai

# 2. Backend development
cd backend
npm install
npm run start:dev

# 3. Database management
npx prisma studio          # GUI interface
npx prisma generate        # Regenerate client
npx prisma db push         # Apply schema changes
```

### Production Deployment
```bash
# All-in-one deployment
docker-compose up -d

# Health checks
curl http://localhost:3000/testcases
curl http://localhost:8000/health
```

### Migration Strategy (TypeORM → Prisma)
1. **Dependencies**: Replace TypeORM packages dengan Prisma
2. **Schema**: Convert Entity classes ke Prisma schema
3. **Services**: Replace Repository pattern dengan PrismaService
4. **Modules**: Update dependency injection
5. **Types**: Align enum values dengan existing data
