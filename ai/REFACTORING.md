# AI Service Refactoring

## Overview
Refactored the monolithic `main.py` (457 lines) into a modular, clean architecture following separation of concerns principles.

## New Architecture

### Directory Structure
```
ai/
├── main_new.py              # New clean entry point
├── main.py                  # Original monolithic file (preserved)
├── requirements.txt         # Dependencies (unchanged)
├── Dockerfile              # Container config (unchanged)
└── app/                     # New modular application
    ├── __init__.py
    ├── main.py              # Application factory
    ├── config/              # Configuration management
    │   ├── __init__.py
    │   └── settings.py      # Environment and AI config
    ├── models/              # Pydantic models
    │   ├── __init__.py
    │   ├── search_models.py # Search-related models
    │   └── ai_models.py     # AI generation models
    ├── services/            # Business logic services
    │   ├── __init__.py
    │   ├── database_service.py      # Database operations
    │   ├── embedding_service.py     # Text embedding logic
    │   ├── search_service.py        # Semantic search logic
    │   └── ai_generation_service.py # AI generation logic
    └── routers/             # API endpoints
        ├── __init__.py
        ├── embedding_router.py      # /generate-embedding
        ├── search_router.py         # /search
        ├── ai_router.py            # /generate-test-case
        └── stats_router.py         # /stats
```

## Key Improvements

### 1. Separation of Concerns
- **Models**: All Pydantic models isolated in `app/models/`
- **Services**: Business logic separated by domain responsibility
- **Routers**: API endpoints organized by functionality
- **Config**: Environment and settings management centralized

### 2. Clean Code Principles
- **Single Responsibility**: Each service handles one domain
- **Dependency Injection**: Services are loosely coupled
- **Configuration Management**: Environment variables centralized
- **Error Handling**: Consistent across all services
- **Logging**: Structured logging throughout

### 3. Modular Services

#### DatabaseService
- MySQL connection management
- Test case retrieval operations
- Statistics generation
- Connection pooling and error handling

#### EmbeddingService
- SentenceTransformer model management
- Text embedding generation
- Model information and metadata

#### SearchService
- Semantic search operations
- Cosine similarity calculations
- Result filtering and sorting
- Test case data formatting

#### AIGenerationService
- Gemini AI integration
- RAG (Retrieval-Augmented Generation) logic
- Prompt engineering and formatting
- Response parsing and validation

### 4. API Organization
- **Health Check**: `/health`
- **Embedding**: `/generate-embedding`
- **Search**: `/search`
- **AI Generation**: `/generate-test-case`
- **Statistics**: `/stats`

## Benefits

### Maintainability
- Smaller, focused files (each service ~100-200 lines)
- Clear module boundaries
- Easy to locate and modify specific functionality

### Testability
- Each service can be unit tested independently
- Mock dependencies easily
- Isolated business logic

### Scalability
- Services can be optimized independently
- Easy to add new features without affecting existing code
- Clear extension points

### Developer Experience
- Better code navigation
- Clear responsibility boundaries
- Easier onboarding for new developers

## Backward Compatibility
All existing API endpoints remain unchanged:
- `/generate-embedding` → EmbeddingService
- `/search` → SearchService  
- `/generate-test-case` → AIGenerationService
- `/stats` → DatabaseService + config

## Migration Path

### Option 1: Immediate Switch
Replace `main.py` with `main_new.py`:
```bash
mv main.py main_old.py
mv main_new.py main.py
```

### Option 2: Gradual Migration
Keep both versions and test the new one:
```bash
# Test new version on different port
python main_new.py
```

## Configuration
Environment variables remain the same:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `GEMINI_API_KEY`
- `SERVICE_HOST`, `SERVICE_PORT`

## Dependencies
No new dependencies required. All existing packages are used efficiently:
- `fastapi` - Web framework
- `sentence-transformers` - Embeddings
- `mysql-connector` - Database
- `google-generativeai` - Gemini AI
- `scikit-learn` - Similarity calculations
- `pydantic` - Data validation

## Performance Considerations
- Services are initialized once at startup
- Database connections are managed per request
- Model loading happens at service initialization
- Memory usage is optimized through proper service lifecycle

## Future Enhancements
1. **Caching Service**: Add Redis for embedding caching
2. **Queue Service**: Add background processing for large operations
3. **Monitoring Service**: Add metrics and health monitoring
4. **Rate Limiting**: Add request rate limiting per service
5. **Service Discovery**: Add service registry for microservices architecture