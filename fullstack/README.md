# 🧪 Fullstack Test Case Management System

A unified Python-based fullstack application for managing test cases with AI-powered features. This version uses Flask for the backend and vanilla HTML/CSS/JavaScript for the frontend, providing the same functionality as the main application.

**✨ No Docker required!** Uses SQLite for the database - just run and go!

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Flask Backend                         │
│                    (Port 5000)                           │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   REST API  │  │  AI Service │  │   Gemini    │     │
│  │   Routes    │  │  (Semantic  │  │   Service   │     │
│  │             │  │   Search)   │  │   (RAG)     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                          │                               │
│                    ┌─────────────┐                       │
│                    │   SQLite    │                       │
│                    │   Database  │                       │
│                    └─────────────┘                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│               HTML/CSS/JS Frontend                       │
│                                                          │
│  • Vanilla JavaScript SPA                                │
│  • Dark/Light Theme Support                              │
│  • Responsive Design                                     │
└─────────────────────────────────────────────────────────┘
```

## ✨ Features

All features from the main application are available:

- ✅ **CRUD Operations**: Create, read, update, delete test cases
- 🔍 **Semantic Search**: AI-powered search using sentence transformers
- 🤖 **AI Generation**: Generate test cases using Google Gemini AI
- 🔗 **RAG Support**: Retrieval-Augmented Generation for better context
- 🎨 **Dark/Light Theme**: Toggle between themes with system preference detection
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🏷️ **Tags & Categories**: Organize test cases with tags, types, and priorities
- 🔄 **References**: Track relationships between test cases

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- (Optional) Google Gemini API key for AI features

**No Docker or external database required!** The application uses SQLite which is included with Python.

### 1. Install Dependencies

```bash
cd fullstack/backend
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
# - Gemini API key (optional, for AI features)
```

### 3. Seed Initial Data (Optional)

To populate your database with sample test cases and AI embeddings:

```bash
cd fullstack/backend
python seed_data.py
```

*Note: This will download the AI model (~90MB) if it hasn't been downloaded yet.*

### 4. Run the Application

```bash
cd fullstack/backend
python app.py
```

The application will be available at: **http://localhost:5000**

The SQLite database (`testcase.db`) will be created automatically on first run.

## 📁 Project Structure

```
fullstack/
├── backend/
│   ├── app.py              # Flask application (main entry point)
│   ├── database.py         # SQLite database operations
│   ├── ai_service.py       # Semantic search & embeddings
│   ├── gemini_service.py   # Google Gemini AI integration
│   ├── requirements.txt    # Python dependencies
│   ├── testcase.db         # SQLite database (auto-created)
│   └── .env.example        # Environment variables template
│
└── frontend/
    ├── templates/
    │   └── index.html      # Main HTML page
    └── static/
        ├── css/
        │   └── style.css   # Styling with dark/light themes
        └── js/
            └── app.js      # JavaScript application logic
```

## 🔌 API Endpoints

### Test Case Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/testcases` | Get all test cases |
| `GET` | `/api/testcases/<id>` | Get a test case by ID |
| `GET` | `/api/testcases/<id>/full` | Get test case with references |
| `POST` | `/api/testcases` | Create a new test case |
| `PATCH` | `/api/testcases/<id>` | Update a test case |
| `DELETE` | `/api/testcases/<id>` | Delete a test case |

### Search & AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/testcases/search` | Semantic search |
| `POST` | `/api/testcases/generate-with-ai` | Generate test case (preview) |
| `POST` | `/api/testcases/generate-and-save-with-ai` | Generate and save |

### References

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/testcases/derive/<id>` | Create derived test case |
| `POST` | `/api/testcases/<id>/reference/<id>` | Add reference |
| `DELETE` | `/api/testcases/reference/<id>` | Remove reference |

## 🎨 Frontend Features

### Theme Toggle
- Click the sun/moon icon in the header to switch themes
- Theme preference is saved in localStorage
- Defaults to light mode on first visit (system preference ignored unless user explicitly selects a different theme)

### Create Test Cases
1. **Manual Creation**: Full control over all fields
2. **Semantic Search**: Find similar test cases as templates
3. **AI Generation**: Describe your test case and let AI create it

### Test Case Management
- View all test cases with search
- Edit and delete test cases
- View references and derived test cases

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_PATH` | SQLite database file path | `testcase.db` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `5000` |
| `GEMINI_API_KEY` | Google Gemini API key | (optional) |
| `MODEL_NAME` | Sentence transformer model | `all-MiniLM-L6-v2` |

## 🤝 Comparison with Main Application

| Feature | Main App (NestJS + React) | Fullstack (Flask + HTML) |
|---------|---------------------------|--------------------------|
| Backend | NestJS (TypeScript) | Flask (Python) |
| Frontend | React + TypeScript | Vanilla HTML/CSS/JS |
| Database | MySQL + Prisma ORM | SQLite (built-in) |
| AI Service | Separate FastAPI service | Integrated in Flask |
| Build Required | Yes (npm build) | No |
| Docker Required | Yes | **No** |
| Deployment | Multiple services | Single service |

## 📝 Notes

- This fullstack version uses its own SQLite database (separate from the main MySQL database)
- AI features require a valid Google Gemini API key
- The sentence transformer model downloads automatically on first run (~90MB)

## 🐛 Troubleshooting

### Database Issues
- The SQLite database is created automatically
- If you need to reset, just delete `testcase.db` and restart

### AI Features Not Working
- Check if `GEMINI_API_KEY` is set in `.env`
- Verify the API key is valid
- Check logs for error messages

### Slow First Load
- The sentence transformer model downloads on first run
- Subsequent loads will be faster
