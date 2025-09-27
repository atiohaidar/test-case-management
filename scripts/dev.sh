#!/bin/bash

# Script untuk menjalankan seluruh Test Case Management System dalam mode development

echo "🧪 Test Case Management System - Development Mode"
echo "================================================="

# Get the project root directory (parent of scripts folder)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

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

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "⚠️  Frontend directory tidak ditemukan. Frontend features akan di-skip."
fi

echo "✅ Prerequisites check completed!"
echo ""

# Check environment files
echo "📝 Checking environment files..."

# Change to project root for environment file checks
cd "$PROJECT_ROOT"

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
echo "3. Start Frontend saja"
echo "4. Start semua service (AI + Backend)"
echo "5. Start semua service + Frontend (AI + Backend + Frontend)"
echo "6. Start MySQL Database (Docker)"
echo "7. Start semua service + MySQL (AI + Backend + MySQL)"
echo "8. Start semua service + MySQL + Frontend (AI + Backend + MySQL + Frontend)"
echo "9. Setup environment files"
echo ""
read -p "Pilih opsi (1-9): " choice

case $choice in
    1)
        echo "🤖 Starting AI Service..."
        chmod +x "$SCRIPTS_DIR/start-ai.sh"
        "$SCRIPTS_DIR/start-ai.sh"
        ;;
    2)
        echo "🚀 Starting Backend..."
        chmod +x "$SCRIPTS_DIR/start-backend.sh"
        "$SCRIPTS_DIR/start-backend.sh"
        ;;
    3)
        echo "� Starting Frontend..."
        chmod +x "$SCRIPTS_DIR/start-frontend.sh"
        "$SCRIPTS_DIR/start-frontend.sh"
        ;;
    4)
        echo "�🌟 Starting all services (AI + Backend)..."
        echo "📝 Note: AI Service akan dimulai di terminal baru"
        echo "         Backend akan dimulai di terminal ini"
        echo ""
        
        # Start AI service in background (new terminal if possible)
        chmod +x "$SCRIPTS_DIR/start-ai.sh"
        if command_exists gnome-terminal; then
            gnome-terminal -- bash -c "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-ai.sh'; exec bash"
        elif command_exists xterm; then
            xterm -e "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-ai.sh'" &
        else
            echo "⚠️  Starting AI service in background..."
            cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-ai.sh" &
            sleep 5
        fi
        
        # Start backend in current terminal
        chmod +x "$SCRIPTS_DIR/start-backend.sh"
        cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-backend.sh"
        ;;
    5)
        echo "🌟 Starting all services + Frontend (AI + Backend + Frontend)..."
        echo "📝 Note: AI Service dan Frontend akan dimulai di terminal baru"
        echo "         Backend akan dimulai di terminal ini"
        echo ""
        
        # Start AI service in background (new terminal if possible)
        chmod +x "$SCRIPTS_DIR/start-ai.sh"
        if command_exists gnome-terminal; then
            gnome-terminal -- bash -c "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-ai.sh'; exec bash"
        elif command_exists xterm; then
            xterm -e "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-ai.sh'" &
        else
            echo "⚠️  Starting AI service in background..."
            cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-ai.sh" &
            sleep 5
        fi
        
        # Start frontend in background (new terminal if possible)
        chmod +x "$SCRIPTS_DIR/start-frontend.sh"
        if command_exists gnome-terminal; then
            gnome-terminal -- bash -c "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-frontend.sh'; exec bash"
        elif command_exists xterm; then
            xterm -e "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-frontend.sh'" &
        else
            echo "⚠️  Starting Frontend service in background..."
            cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-frontend.sh" &
            sleep 5
        fi
        
        # Start backend in current terminal
        chmod +x "$SCRIPTS_DIR/start-backend.sh"
        cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-backend.sh"
        ;;
    6)
        echo "🗄️  Starting MySQL Database..."
        chmod +x "$SCRIPTS_DIR/start-mysql.sh"
        "$SCRIPTS_DIR/start-mysql.sh"
        ;;
    7)
        echo "🌟 Starting all services with MySQL (AI + Backend + MySQL)..."
        echo "📝 Note: Starting MySQL first, then AI Service di terminal baru"
        echo "         Backend akan dimulai di terminal ini"
        echo ""
        
        # Start MySQL first using dedicated script
        echo "🗄️  Starting MySQL Database..."
        chmod +x "$SCRIPTS_DIR/start-mysql.sh"
        "$SCRIPTS_DIR/start-mysql.sh"
        
        # Start AI service in background (new terminal if possible)
        chmod +x "$SCRIPTS_DIR/start-ai.sh"
        if command_exists gnome-terminal; then
            gnome-terminal -- bash -c "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-ai.sh'; exec bash"
        elif command_exists xterm; then
            xterm -e "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-ai.sh'" &
        else
            echo "⚠️  Starting AI service in background..."
            cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-ai.sh" &
            sleep 5
        fi
        
        # Start backend in current terminal
        chmod +x "$SCRIPTS_DIR/start-backend.sh"
        cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-backend.sh"
        ;;
    8)
        echo "🌟 Starting all services with MySQL + Frontend (AI + Backend + MySQL + Frontend)..."
        echo "📝 Note: Starting MySQL first, then AI Service dan Frontend di terminal baru"
        echo "         Backend akan dimulai di terminal ini"
        echo ""
        
        # Start MySQL first using dedicated script
        echo "🗄️  Starting MySQL Database..."
        chmod +x "$SCRIPTS_DIR/start-mysql.sh"
        "$SCRIPTS_DIR/start-mysql.sh"
        
        # Start AI service in background (new terminal if possible)
        chmod +x "$SCRIPTS_DIR/start-ai.sh"
        if command_exists gnome-terminal; then
            gnome-terminal -- bash -c "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-ai.sh'; exec bash"
        elif command_exists xterm; then
            xterm -e "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-ai.sh'" &
        else
            echo "⚠️  Starting AI service in background..."
            cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-ai.sh" &
            sleep 5
        fi
        
        # Start frontend in background (new terminal if possible)
        chmod +x "$SCRIPTS_DIR/start-frontend.sh"
        if command_exists gnome-terminal; then
            gnome-terminal -- bash -c "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-frontend.sh'; exec bash"
        elif command_exists xterm; then
            xterm -e "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-frontend.sh'" &
        else
            echo "⚠️  Starting Frontend service in background..."
            cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-frontend.sh" &
            sleep 5
        fi
        
        # Start backend in current terminal
        chmod +x "$SCRIPTS_DIR/start-backend.sh"
        cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-backend.sh"
        ;;
    9)
        echo "🔧 Setting up environment files..."
        cd "$PROJECT_ROOT"
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