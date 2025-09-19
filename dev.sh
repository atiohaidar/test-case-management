#!/bin/bash

# Script untuk menjalankan seluruh Test Case Management System dalam mode development

echo "🧪 Test Case Management System - Development Mode"
echo "================================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js tidak ditemukan! Install Node.js terlebih dahulu."
    exit 1
fi

if ! command_exists python3; then
    echo "❌ Python 3 tidak ditemukan! Install Python 3 terlebih dahulu."
    exit 1
fi

if ! command_exists mysql; then
    echo "⚠️  MySQL client tidak ditemukan. Pastikan MySQL server berjalan di localhost:3306"
fi

echo "✅ Prerequisites check completed!"
echo ""

# Check environment files
echo "📝 Checking environment files..."

if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env tidak ditemukan!"
    echo "   Run: cp backend/.env.example backend/.env"
    exit 1
fi

if [ ! -f "ai/.env" ]; then
    echo "❌ ai/.env tidak ditemukan!"
    echo "   Run: cp ai/.env.example ai/.env"
    exit 1
fi

echo "✅ Environment files check completed!"
echo ""

# Ask which service to start
echo "Pilih mode untuk menjalankan aplikasi:"
echo "1. Start AI Service saja"
echo "2. Start Backend saja"
echo "3. Start semua service (AI + Backend)"
echo "4. Setup environment files"
echo ""
read -p "Pilih opsi (1-4): " choice

case $choice in
    1)
        echo "🤖 Starting AI Service..."
        chmod +x start-ai.sh
        ./start-ai.sh
        ;;
    2)
        echo "🚀 Starting Backend..."
        chmod +x start-backend.sh
        ./start-backend.sh
        ;;
    3)
        echo "🌟 Starting all services..."
        echo "📝 Note: AI Service akan dimulai di terminal baru"
        echo "         Backend akan dimulai di terminal ini"
        echo ""
        
        # Start AI service in background (new terminal if possible)
        chmod +x start-ai.sh
        if command_exists gnome-terminal; then
            gnome-terminal -- bash -c "./start-ai.sh; exec bash"
        elif command_exists xterm; then
            xterm -e "./start-ai.sh" &
        else
            echo "⚠️  Starting AI service in background..."
            ./start-ai.sh &
            sleep 5
        fi
        
        # Start backend in current terminal
        chmod +x start-backend.sh
        ./start-backend.sh
        ;;
    4)
        echo "🔧 Setting up environment files..."
        if [ ! -f "backend/.env" ]; then
            cp backend/.env.example backend/.env
            echo "✅ Created backend/.env"
        fi
        if [ ! -f "ai/.env" ]; then
            cp ai/.env.example ai/.env
            echo "✅ Created ai/.env"
        fi
        echo ""
        echo "📝 Edit the following files to configure your environment:"
        echo "   - backend/.env (database connection)"
        echo "   - ai/.env (database connection + Gemini API key)"
        echo ""
        echo "🔑 Get your Gemini API key from: https://aistudio.google.com/app/apikey"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac