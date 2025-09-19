# Dokumentasi Teknis - Test Case Management System with RAG

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
- **Google Gemini API** - Large Language Model untuk test case generation
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

## 🏗️ Arsitektur Sistem dengan RAG

### Overview Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   NestJS API    │    │  Python AI      │
│   (Client UI)   │◄──►│   (Backend)     │◄──►│   Service       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                        ┌─────────────────┐    ┌─────────────────┐
                        │   MySQL DB      │    │  ML Models      │
                        │   (Prisma ORM)  │    │  + Gemini AI    │
                        └─────────────────┘    └─────────────────┘

```

### RAG (Retrieval-Augmented Generation) Flow
```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│  User Input │───►│ Semantic     │───►│ Retrieved   │───►│ Enhanced    │
│  (Prompt)   │    │ Search       │    │ Test Cases  │    │ Prompt      │
└─────────────┘    └──────────────┘    └─────────────┘    └─────────────┘
                            │                                     │
                            ▼                                     ▼
                   ┌─────────────────┐                  ┌─────────────────┐
                   │ Embedding Store │                  │ Gemini AI Model │
                   │ (MySQL + Vector)│                  │ (Generation)    │
                   └─────────────────┘                  └─────────────────┘
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
    ├── TestCaseService (Main orchestrator)
    ├── services/
    │   ├── TestCaseCrudService (CRUD operations)
    │   ├── TestCaseAIService (AI integration)
    │   ├── TestCaseSearchService (Semantic search)
    │   ├── TestCaseReferenceService (Reference management)
    │   ├── TestCaseEmbeddingService (Embedding generation)
    │   └── interfaces.ts (Service contracts)
    └── DTOs (Data validation)
```

**Service Architecture Benefits**:
- **Separation of Concerns**: Each service handles specific domain logic
- **Interface-based DI**: Better testability and maintainability
- **Modular Design**: Easier to extend and modify individual components
- **Focused Responsibilities**: Smaller, more manageable code units

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

## 📊 Database Schema dengan RAG Support

### Enhanced Prisma Schema
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
  referenceId    String?           // Backward compatibility - single reference
  
  // AI Generation Metadata
  aiGenerated    Boolean           @default(false)  // Apakah dibuat dengan bantuan AI
  originalPrompt String?           @db.Text         // Prompt asli yang digunakan untuk AI generation
  aiConfidence   Float?                             // Confidence score dari AI (0-1)
  aiSuggestions  String?           @db.Text         // Saran dari AI untuk improvement
  aiGenerationMethod String?                        // "pure_ai" | "rag" | null
  
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  // Relations for multiple references
  references     TestCaseReference[] @relation("SourceTestCase")
  referencedBy   TestCaseReference[] @relation("TargetTestCase")

  @@map("testcases")
}

// NEW: Junction table untuk multiple references
model TestCaseReference {
  id               String    @id @default(cuid())
  sourceId         String    // Test case yang dibuat
  targetId         String    // Test case yang dijadikan referensi
  similarityScore  Float?    // Similarity score dari RAG (0-1)
  referenceType    String    // "manual" | "rag_retrieval"
  createdAt        DateTime  @default(now())

  source           TestCase  @relation("SourceTestCase", fields: [sourceId], references: [id], onDelete: Cascade)
  target           TestCase  @relation("TargetTestCase", fields: [targetId], references: [id], onDelete: Cascade)

  @@unique([sourceId, targetId])
  @@map("testcase_references")
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

**Enhanced TestStep Interface**:
```typescript
interface TestStep {
  step: string;           // Langkah yang harus dilakukan
  expectedResult: string; // Hasil yang diharapkan dari langkah ini
}
```

### RAG Data Structures
```typescript
interface RAGReference {
  testCaseId: string;    // ID test case yang direferensikan
  similarity: number;    // Similarity score (0-1)
  testCase: TestCase;    // Full test case data
}

interface AIGenerationMetadata {
  aiGenerated: boolean;
  originalPrompt?: string;
  aiConfidence?: number;
  aiSuggestions?: string;
  aiGenerationMethod: 'pure_ai' | 'rag';
  ragReferences: RAGReference[];
}
```

### **Test Case Reference Feature**:
- **referenceId**: Menyimpan ID test case yang dijadikan referensi saat membuat test case baru
- **Derivation Flow**: User bisa create test case baru berdasarkan test case existing
- **Traceability**: Bisa track test case mana yang menjadi "parent" dan melihat derived test cases
- **Frontend Integration**: Support untuk search → select → edit → save as new workflow

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

# Get Test Case with Reference Info
GET /testcases/:id/with-reference

# Get Test Case with Complete Reference & Derived Info
GET /testcases/:id/full

# Get Derived Test Cases
GET /testcases/:id/derived

# Update Test Case
PATCH /testcases/:id

# Delete Test Case
DELETE /testcases/:id

# Semantic Search
GET /testcases/search?query=login&minSimilarity=0.7&limit=10

# Create Test Case from Reference
POST /testcases/derive/:referenceId
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
---

## 🤖 RAG (Retrieval-Augmented Generation) Implementation

### RAG Architecture
RAG menggabungkan pencarian semantik (retrieval) dengan AI generation untuk menghasilkan test case yang lebih konsisten dan berkualitas.

#### Flow Process:
1. **User Input**: User memberikan prompt untuk generate test case
2. **Semantic Search**: Sistem mencari test case yang relevan menggunakan embedding similarity
3. **Context Building**: Test case relevan dijadikan konteks untuk AI
4. **Enhanced Generation**: AI menggunakan konteks untuk generate test case yang lebih baik
5. **Reference Tracking**: Sistem menyimpan referensi test case yang digunakan

### Enhanced API Endpoints untuk RAG

#### Generate Test Case with RAG
```bash
# Pure AI Generation (tanpa RAG)
curl -X POST http://localhost:3000/testcases/generate-with-ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Buat test case untuk login dengan password salah",
    "useRAG": false,
    "preferredType": "negative",
    "preferredPriority": "high"
  }'

# RAG-Enhanced Generation
curl -X POST http://localhost:3000/testcases/generate-with-ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Buat test case untuk logout user dari sistem",
    "useRAG": true,
    "ragSimilarityThreshold": 0.7,
    "maxRAGReferences": 3,
    "preferredType": "positive",
    "preferredPriority": "medium"
  }'
```

#### Generate and Save with RAG
```bash
curl -X POST http://localhost:3000/testcases/generate-and-save-with-ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Buat test case untuk reset password user",
    "useRAG": true,
    "ragSimilarityThreshold": 0.6,
    "maxRAGReferences": 3,
    "context": "Aplikasi web e-commerce dengan sistem user management",
    "preferredType": "positive",
    "preferredPriority": "medium"
  }'
```

### RAG Parameters Explained

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `useRAG` | boolean | true | Enable/disable RAG functionality |
| `ragSimilarityThreshold` | number (0-1) | 0.7 | Minimum similarity score untuk referensi |
| `maxRAGReferences` | number (1-10) | 3 | Maksimal jumlah test case referensi |

### RAG Response Format
```json
{
  "name": "Test Logout User",
  "description": "Memverifikasi proses logout user dari sistem",
  "type": "positive",
  "priority": "medium",
  "steps": [...],
  "expectedResult": "User berhasil logout dan diarahkan ke halaman login",
  "tags": ["logout", "authentication"],
  "originalPrompt": "Buat test case untuk logout user dari sistem",
  "aiGenerated": true,
  "confidence": 0.85,
  "aiGenerationMethod": "rag",
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

## 📋 CURL Examples

### 1. **Create Test Case**
```bash
curl -X POST http://localhost:3000/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Login Test - Valid User",
    "description": "Test login functionality with valid user credentials",
    "type": "positive",
    "priority": "high",
    "steps": [
      {
        "step": "Navigate to login page",
        "expectedResult": "Login form is displayed"
      },
      {
        "step": "Enter valid username and password",
        "expectedResult": "Credentials are accepted"
      },
      {
        "step": "Click login button",
        "expectedResult": "User is redirected to dashboard"
      }
    ],
    "expectedResult": "User successfully logs in and accesses dashboard",
    "tags": ["login", "authentication", "positive"]
  }'
```

### 2. **Get All Test Cases**
```bash
curl -X GET http://localhost:3000/testcases
```

### 3. **Get Test Case by ID**
```bash
curl -X GET http://localhost:3000/testcases/{test-case-id}
```

### 4. **Get Test Case with Reference Info**
```bash
curl -X GET http://localhost:3000/testcases/{test-case-id}/with-reference
```

### 5. **Get Test Case with Complete Reference & Derived Info**
```bash
curl -X GET http://localhost:3000/testcases/{test-case-id}/full
```

**Response Structure:**
```json
{
  "id": "uuid",
  "name": "Test Case Name",
  "description": "Test description",
  "type": "positive",
  "priority": "high",
  "steps": [...],
  "expectedResult": "Expected result",
  "tags": ["tag1", "tag2"],
  "aiGenerated": true,
  "originalPrompt": "Original AI prompt",
  "aiConfidence": 0.95,
  "createdAt": "2025-09-19T10:00:00Z",
  "updatedAt": "2025-09-19T10:00:00Z",
  
  // Outgoing References (test cases this one refers to)
  "references": [
    {
      "id": "ref-uuid",
      "targetId": "target-uuid",
      "referenceType": "rag_retrieval",
      "similarityScore": 0.85,
      "createdAt": "2025-09-19T10:00:00Z",
      "target": {
        "id": "target-uuid",
        "name": "Referenced Test Case",
        "type": "positive",
        "priority": "high",
        "createdAt": "2025-09-19T09:00:00Z"
      }
    }
  ],
  
  // Incoming References (test cases that refer to this one)
  "derivedTestCases": [
    {
      "id": "derived-uuid",
      "name": "Derived Test Case",
      "type": "negative",
      "priority": "medium",
      "createdAt": "2025-09-19T11:00:00Z",
      "aiGenerated": true,
      "referenceInfo": {
        "id": "ref-uuid",
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

**Use Cases:**
- **UI Detail View**: Menampilkan test case lengkap dengan network references
- **Dependency Analysis**: Melihat test case mana yang mempengaruhi atau dipengaruhi
- **Quality Review**: Menganalisis kualitas AI generation berdasarkan references
- **Reference Tracking**: Memahami relationship antara test cases

### 6. **Search Test Cases (Semantic)**
```bash
curl -X GET "http://localhost:3000/testcases/search?query=login%20authentication&minSimilarity=0.7&limit=5"
```

### 7. **Create Test Case from Reference (Derive)**
```bash
curl -X POST http://localhost:3000/testcases/derive/{reference-test-case-id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Login Test - Invalid Password",
    "description": "Test login functionality with invalid password",
    "type": "negative",
    "priority": "medium",
    "steps": [
      {
        "step": "Navigate to login page",
        "expectedResult": "Login form is displayed"
      },
      {
        "step": "Enter valid username and invalid password",
        "expectedResult": "Invalid credentials message appears"
      },
      {
        "step": "Click login button",
        "expectedResult": "Login is rejected"
      }
    ],
    "expectedResult": "User receives error message and remains on login page",
    "tags": ["login", "authentication", "negative", "invalid-password"]
  }'
```

### 7. **Update Test Case**
```bash
curl -X PATCH http://localhost:3000/testcases/{test-case-id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Login Test - Valid User (Updated)",
    "priority": "medium",
    "tags": ["login", "authentication", "positive", "updated"]
  }'
```

### 8. **Get Derived Test Cases**
```bash
curl -X GET http://localhost:3000/testcases/{reference-test-case-id}/derived
```

### 9. **Delete Test Case**
```bash
curl -X DELETE http://localhost:3000/testcases/{test-case-id}
```

### 10. **Complete Example Workflow**
```bash
# Step 1: Create original test case
ORIGINAL_ID=$(curl -X POST http://localhost:3000/testcases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User Registration - Valid Data",
    "description": "Test user registration with valid data",
    "type": "positive",
    "priority": "high",
    "steps": [
      {
        "step": "Fill registration form with valid data",
        "expectedResult": "Form accepts all inputs"
      },
      {
        "step": "Submit form",
        "expectedResult": "Registration successful"
      }
    ],
    "expectedResult": "User account created successfully",
    "tags": ["registration", "user", "positive"]
  }' | jq -r '.id')

echo "Original Test Case ID: $ORIGINAL_ID"

# Step 2: Create derived test case (negative scenario)
DERIVED_ID=$(curl -X POST http://localhost:3000/testcases/derive/$ORIGINAL_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User Registration - Invalid Email",
    "description": "Test user registration with invalid email format",
    "type": "negative",
    "priority": "medium",
    "expectedResult": "Registration fails with email validation error",
    "tags": ["registration", "user", "negative", "email-validation"]
  }' | jq -r '.id')

echo "Derived Test Case ID: $DERIVED_ID"

# Step 3: Get derived test case with reference info
curl -X GET http://localhost:3000/testcases/$DERIVED_ID/with-reference | jq '.'

# Step 4: Get all test cases derived from original
curl -X GET http://localhost:3000/testcases/$ORIGINAL_ID/derived | jq '.'

# Step 5: Search for registration related test cases
curl -X GET "http://localhost:3000/testcases/search?query=registration%20user&minSimilarity=0.5&limit=10" | jq '.'
```

### 11. **Health Check & Documentation**
```bash
# Check if backend is running
curl -X GET http://localhost:3000/testcases

# Access Swagger Documentation
open http://localhost:3000/api

# Check AI service (if accessible)
curl -X GET http://localhost:8000/health
```

### 12. **Response Examples**

**Create Test Case Response:**
```json
{
  "id": "cm1abc123def456ghi789",
  "name": "Login Test - Valid User",
  "description": "Test login functionality with valid user credentials",
  "type": "positive",
  "priority": "high",
  "steps": [...],
  "expectedResult": "User successfully logs in and accesses dashboard",
  "tags": ["login", "authentication", "positive"],
  "referenceId": null,
  "createdAt": "2025-09-18T12:30:00.000Z",
  "updatedAt": "2025-09-18T12:30:00.000Z"
}
```

**Get with Reference Response:**
```json
{
  "id": "cm1xyz789abc123def456",
  "name": "Login Test - Invalid Password",
  "description": "Test login functionality with invalid password",
  "type": "negative",
  "priority": "medium",
  "referenceId": "cm1abc123def456ghi789",
  "reference": {
    "id": "cm1abc123def456ghi789",
    "name": "Login Test - Valid User",
    "createdAt": "2025-09-18T12:30:00.000Z"
  },
  "derivedCount": 0,
  "createdAt": "2025-09-18T12:35:00.000Z",
  "updatedAt": "2025-09-18T12:35:00.000Z"
}
```

**Search Response:**
```json
[
  {
    "id": "cm1abc123def456ghi789",
    "name": "Login Test - Valid User",
    "description": "Test login functionality with valid user credentials",
    "similarity": 0.89,
    "created_at": "2025-09-18T12:30:00.000Z"
  },
  {
    "id": "cm1xyz789abc123def456",
    "name": "Login Test - Invalid Password", 
    "description": "Test login functionality with invalid password",
    "similarity": 0.75,
    "created_at": "2025-09-18T12:35:00.000Z"
  }
]
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
