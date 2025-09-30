# 🚀 Development Guide - Test Case Management System v3.0.0

<div align="center">

![Development Guide](https://img.shields.io/badge/📖-Development%20Guide-informational?style=for-the-badge)
![Full Stack](https://img.shields.io/badge/🏗️-Full%20Stack-success?style=for-the-badge)
![Animated Scripts](https://img.shields.io/badge/🎭-Animated%20Scripts-ff69b4?style=for-the-badge)

</div>

## 🎯 Overview

This guide provides comprehensive documentation for developers working with the Test Case Management System. Our enhanced v3.0.0 development environment includes animated scripts, modern tooling, and a seamless full-stack development experience.

---

## 🛠️ Development Environment Setup

### 📋 **Prerequisites**

Ensure you have the following installed:

| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| **Node.js** | 18.0+ | Frontend & Backend runtime | [nodejs.org](https://nodejs.org/) |
| **Python** | 3.8+ | AI Service runtime | [python.org](https://www.python.org/) |
| **Docker** | 20.0+ | Containerization | [docker.com](https://www.docker.com/) |
| **Docker Compose** | 2.0+ | Multi-container orchestration | [docs.docker.com](https://docs.docker.com/compose/) |
| **Git** | 2.30+ | Version control | [git-scm.com](https://git-scm.com/) |

### 🔧 **Quick Setup**

```bash
# Clone the repository
git clone https://github.com/atiohaidar/test-case-management.git
cd test-case-management

# Launch interactive development menu
./main-dev.sh

# Choose option 9 to setup environment files
# Then choose option 5 for full development stack
```

---

## 🎭 Enhanced Development Scripts v3.0.0

### 🎨 **Interactive Development Menu**

Our enhanced `./main-dev.sh` provides 11 different development options:

```bash
./main-dev.sh
```

#### **Available Options:**

| Option | Command | Description | Use Case |
|--------|---------|-------------|----------|
| **1** | AI Service Only | 🤖 Python FastAPI + ML Models | AI/ML development |
| **2** | Backend Only | 🚀 NestJS + Prisma + MySQL | Backend API development |
| **3** | Frontend Only | 🎨 React + Vite + TypeScript | Frontend UI development |
| **4** | Backend + AI | ⚡ Core API functionality | Full API development |
| **5** | Full Stack | 🌟 Complete development suite | End-to-end development |
| **6** | MySQL Only | 🗄️ Database container | Database management |
| **7** | Backend + AI + MySQL | 🔥 API services + Database | Backend-focused development |
| **8** | Complete Stack + MySQL | 🚀 Everything + Database | Complete development |
| **9** | Environment Setup | 🔧 Initialize configuration | First-time setup |
| **10** | System Information | 📊 Check system details | Diagnostics |
| **11** | Clean & Reset | 🧹 Clean environment | Fresh start |

### 🎯 **Individual Service Scripts**

Each service has its own enhanced startup script with animations:

```bash
# AI Service (Python FastAPI)
./scripts/start-ai.sh

# Backend Service (NestJS)
./scripts/start-backend.sh

# Frontend Service (React)
./scripts/start-frontend.sh

# Database Service (MySQL)
./scripts/start-mysql.sh
```

---

## 🏗️ Architecture & Development Workflow

### 📊 **Service Architecture**

```
Development Environment:
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Development Ecosystem                                 │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────────┤
│   🎨 Frontend   │   🚀 Backend    │  🤖 AI Service  │   🗄️ Database           │
│                 │                 │                 │                         │
│ React 19.1.1    │ NestJS 10.3.0   │ FastAPI 0.115.0 │ MySQL 8.0              │
│ TypeScript 5.8  │ TypeScript 5.3  │ Python 3.12     │ Docker Container       │
│ Vite 6.2.0      │ Prisma 5.6.0    │ Transformers    │ Automated Schema       │
│ Hot Reload      │ Auto-restart    │ Auto-reload     │ Health Monitoring      │
│                 │                 │                 │                         │
│ localhost:5173  │ localhost:3000  │ localhost:8000  │ localhost:3306         │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────────┘
```

### 🔄 **Development Workflow**

1. **Environment Setup** (One-time)
   ```bash
   ./main-dev.sh  # Option 9: Setup environment files
   ```

2. **Daily Development** (Choose based on focus)
   ```bash
   ./main-dev.sh  # Option 5: Full Stack for complete development
   ./main-dev.sh  # Option 4: Backend + AI for API work
   ./main-dev.sh  # Option 3: Frontend Only for UI work
   ```

3. **Testing & Debugging**
   ```bash
   ./main-dev.sh  # Option 10: System Information for diagnostics
   ```

4. **Clean Start** (When needed)
   ```bash
   ./main-dev.sh  # Option 11: Clean & Reset environment
   ```

---

## 🎨 Frontend Development

### 🌐 **React + TypeScript + Vite**

**Technology Stack:**
- **React 19.1.1** with modern hooks and concurrent features
- **TypeScript 5.8** for type safety
- **Vite 6.2.0** for fast development and building

**Key Features:**
- Hot module replacement (HMR)
- Dark/Light theme support
- Responsive design
- Modern component architecture

**Development Commands:**
```bash
# Start frontend only
./scripts/start-frontend.sh

# Or via main menu
./main-dev.sh  # Choose option 3
```

**Frontend Structure:**
```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── services/        # API service layers
│   ├── types.ts         # TypeScript type definitions
│   ├── App.tsx          # Main application component
│   └── index.tsx        # Application entry point
├── theme.css            # Theme styling
├── package.json         # Dependencies
└── vite.config.ts       # Vite configuration
```

### 🔧 **Frontend Development Tips**

1. **API Integration:**
   - Services are configured to connect to `localhost:3000`
   - All API calls are typed with TypeScript interfaces
   - Error handling is built into service layer

2. **Theme Development:**
   - Supports system preference detection
   - Theme state is persisted in localStorage
   - CSS custom properties for easy theming

3. **Component Development:**
   - Follow React functional component patterns
   - Use TypeScript for prop validation
   - Implement responsive design principles

---

## 🚀 Backend Development

### ⚡ **NestJS + Prisma + MySQL**

**Technology Stack:**
- **NestJS 10.3.0** - Scalable Node.js framework
- **Prisma 5.6.0** - Type-safe database ORM
- **MySQL 8.0** - Relational database
- **Swagger** - API documentation

**Development Commands:**
```bash
# Start backend only
./scripts/start-backend.sh

# Or via main menu
./main-dev.sh  # Choose option 2
```

**Backend Structure:**
```
backend/
├── src/
│   ├── modules/         # Feature modules
│   │   └── testcase/    # Test case management
│   ├── services/        # Business logic services
│   ├── dtos/           # Data transfer objects
│   └── main.ts         # Application bootstrap
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
├── .env                # Environment configuration
└── package.json        # Dependencies
```

### 🔧 **Backend Development Tips**

1. **Database Development:**
   ```bash
   # Generate Prisma client after schema changes
   npx prisma generate
   
   # Push schema changes to database
   npx prisma db push
   
   # Open Prisma Studio for GUI
   npx prisma studio
   ```

2. **API Development:**
   - All endpoints are automatically documented with Swagger
   - DTOs provide input validation and transformation
   - Services are modular and testable
   - Built-in error handling and logging

3. **Service Architecture:**
   - `TestCaseService` - Main orchestration service
   - `TestCaseCrudService` - Basic CRUD operations
   - `TestCaseAIService` - AI integration
   - `TestCaseEmbeddingService` - Vector operations

---

## 🤖 AI Service Development

### 🧠 **Python + FastAPI + ML Models**

**Technology Stack:**
- **FastAPI 0.115.0** - High-performance Python web framework
- **Sentence Transformers** - Text embedding models
- **Google Gemini API** - Language model integration
- **Scikit-learn** - ML utilities

**Development Commands:**
```bash
# Start AI service only
./scripts/start-ai.sh

# Or via main menu
./main-dev.sh  # Choose option 1
```

**AI Service Structure:**
```
ai/
├── services/
│   ├── ai_service.py       # Main AI orchestration
│   ├── gemini_service.py   # Gemini API integration
│   └── database.py         # Database connectivity
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── .env                    # Environment configuration
└── venv/                   # Virtual environment
```

### 🔧 **AI Development Tips**

1. **Model Configuration:**
   - Default model: `all-MiniLM-L6-v2`
   - Embedding dimension: 384
   - Configurable similarity thresholds

2. **RAG Implementation:**
   - Semantic search for context retrieval
   - Context formatting for prompts
   - Similarity scoring and ranking

3. **API Development:**
   - FastAPI automatic documentation
   - Async/await for performance
   - Comprehensive error handling

---

## 🗄️ Database Development

### 📊 **MySQL + Prisma + Docker**

**Setup:**
```bash
# Start MySQL container
./scripts/start-mysql.sh

# Or via main menu
./main-dev.sh  # Choose option 6
```

**Database Configuration:**
- **Host:** localhost
- **Port:** 3306
- **Database:** testcase_management
- **Username:** root
- **Password:** password

### 🔧 **Database Development Tips**

1. **Schema Management:**
   ```bash
   # Edit schema
   vim backend/prisma/schema.prisma
   
   # Apply changes
   cd backend && npx prisma db push
   ```

2. **Data Management:**
   ```bash
   # Open Prisma Studio
   cd backend && npx prisma studio
   
   # Reset database
   npx prisma migrate reset
   ```

3. **Backup & Restore:**
   ```bash
   # Create backup
   docker exec testcase_mysql mysqldump -u root -ppassword testcase_management > backup.sql
   
   # Restore backup
   docker exec -i testcase_mysql mysql -u root -ppassword testcase_management < backup.sql
   ```

---

## 🧪 Testing & Quality Assurance

### 📋 **Testing Strategy**

1. **Frontend Testing:**
   - Component testing with React Testing Library
   - E2E testing with Cypress (planned)

2. **Backend Testing:**
   - Unit tests with Jest
   - Integration tests for API endpoints
   - Database testing with test containers

3. **AI Service Testing:**
   - Model accuracy testing
   - Performance benchmarking
   - RAG quality metrics

### 🔍 **Development Tools**

```bash
# Backend testing
cd backend && npm test

# Frontend testing  
cd frontend && npm test

# AI service testing
cd ai && python -m pytest

# Linting
cd backend && npm run lint
cd frontend && npm run lint
```

---

## 🐛 Troubleshooting

### 🔧 **Common Issues**

| Issue | Solution | Prevention |
|-------|----------|------------|
| **Port conflicts** | Use `./main-dev.sh` option 10 to check ports | Check running services before starting |
| **Database connection** | Ensure MySQL is running with option 6 | Always start MySQL first |
| **Environment files missing** | Use option 9 to setup files | Run setup before first development |
| **Dependencies outdated** | Use option 11 to clean and reinstall | Regular dependency updates |

### 📊 **System Diagnostics**

```bash
# Check system information
./main-dev.sh  # Option 10

# Check service status
docker ps -a
netstat -tlnp | grep -E ':(3000|5173|8000|3306)'

# Clean development environment
./main-dev.sh  # Option 11
```

---

## 🚀 Deployment

### 🐳 **Docker Production**

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### ☁️ **Cloud Deployment**

- **Frontend:** Deploy to Vercel, Netlify, or Cloudflare Pages
- **Backend:** Deploy to Railway, Render, or AWS ECS
- **Database:** Use managed MySQL (AWS RDS, Google Cloud SQL)
- **AI Service:** Deploy to serverless functions or container services

---

## 📈 Performance Optimization

### ⚡ **Development Performance**

1. **Frontend:**
   - Vite's fast HMR for instant updates
   - Code splitting for lazy loading
   - Bundle optimization for production

2. **Backend:**
   - NestJS built-in caching
   - Database query optimization
   - Connection pooling

3. **AI Service:**
   - Model caching for embeddings
   - Async processing for RAG
   - Request batching for efficiency

---

## 🤝 Contributing

### 📋 **Contribution Guidelines**

1. **Fork** the repository
2. **Create** a feature branch
3. **Follow** coding standards
4. **Write** tests for new features
5. **Update** documentation
6. **Submit** pull request

### 🎯 **Development Standards**

- **TypeScript** for type safety
- **ESLint + Prettier** for code formatting
- **Conventional Commits** for commit messages
- **API-first** development approach
- **Comprehensive documentation**

---

<div align="center">

## 🎉 **Happy Developing!**

**Enhanced Development Experience v3.0.0**  
*Built with ❤️ by the development team*

[![GitHub stars](https://img.shields.io/github/stars/atiohaidar/test-case-management.svg?style=social&label=Star)](https://github.com/atiohaidar/test-case-management)

</div>