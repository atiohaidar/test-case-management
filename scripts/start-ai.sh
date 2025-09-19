#!/bin/bash

# Script untuk menjalankan Python AI Service dalam mode development

echo "🤖 Starting Python AI Service Development Server..."

# Get the project root directory (parent of scripts folder)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if .env file exists
if [ ! -f "ai/.env" ]; then
    echo "❌ File ai/.env tidak ditemukan!"
    echo "📝 Copy ai/.env.example ke ai/.env dan edit sesuai konfigurasi Anda"
    echo "   cp ai/.env.example ai/.env"
    exit 1
fi

# Navigate to ai directory
cd ai

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ AI Service ready!"
echo "🌐 Starting development server on http://localhost:8000"
echo "📚 API Documentation will be available at http://localhost:8000/docs"
echo ""
echo "⚠️  Make sure:"
echo "   - MySQL is running on localhost:3306"
echo "   - GEMINI_API_KEY is set in ai/.env"
echo ""

# Start development server
python main.py