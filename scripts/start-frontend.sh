#!/bin/bash

# Script untuk menjalankan Frontend React dalam mode development

echo "🌐 Starting React Frontend Development Server..."

# Get the project root directory (parent of scripts folder)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "✅ Frontend ready!"
echo "🌐 Starting development server on http://localhost:5173"
echo "📱 Frontend will connect to backend at http://localhost:3000"
echo ""

# Start development server
npm run dev