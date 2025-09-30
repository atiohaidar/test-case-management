#!/bin/bash

# Enhanced AI Service Startup Script with Animations
# Python FastAPI + ML Models + Gemini AI Integration

# Colors and animations
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Animation frames
SPINNER=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")

# Spinner function
show_spinner() {
    local message="$1"
    local duration="$2"
    local frame=0
    
    for ((i=0; i<duration; i++)); do
        printf "\r${CYAN}${SPINNER[$frame]} ${WHITE}%s${NC}" "$message"
        frame=$(( (frame + 1) % ${#SPINNER[@]} ))
        sleep 0.1
    done
    printf "\r${GREEN}✅ %s${NC}\n" "$message"
}

# Header
clear
echo -e "${PURPLE}"
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║                   🤖 PYTHON AI SERVICE v3.0.0                            ║"
echo "║               FastAPI + ML Models + Gemini Integration                     ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${CYAN}🚀 Starting Python AI Service Development Server...${NC}"
echo

# Get the project root directory (parent of scripts folder)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if .env file exists
echo -e "${YELLOW}⏳ Checking configuration...${NC}"
if [ ! -f "ai/.env" ]; then
    echo -e "${RED}❌ File ai/.env not found!${NC}"
    echo -e "${YELLOW}📝 Copy ai/.env.example to ai/.env and configure it${NC}"
    echo -e "${WHITE}   cp ai/.env.example ai/.env${NC}"
    exit 1
fi
show_spinner "Configuration verified" 5

# Navigate to ai directory
cd ai

# Check if virtual environment exists
echo -e "${YELLOW}⏳ Checking Python virtual environment...${NC}"
if [ ! -d "venv" ]; then
    echo -e "${CYAN}🐍 Creating Python virtual environment...${NC}"
    python3 -m venv venv
    show_spinner "Virtual environment created" 15
else
    show_spinner "Virtual environment found" 3
fi

# Activate virtual environment
echo -e "${CYAN}🔄 Activating virtual environment...${NC}"
source venv/bin/activate
show_spinner "Virtual environment activated" 3

# Install dependencies
echo -e "${CYAN}📦 Installing Python dependencies...${NC}"
pip install -r requirements.txt > /dev/null 2>&1
show_spinner "Dependencies installed" 20

echo
echo -e "${GREEN}✨ AI Service Configuration Complete!${NC}"
echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Service information
echo -e "${CYAN}📊 Service Information:${NC}"
echo -e "${WHITE}   • Port:${NC} 8000"
echo -e "${WHITE}   • API Docs:${NC} http://localhost:8000/docs"
echo -e "${WHITE}   • Health Check:${NC} http://localhost:8000/health"
echo -e "${WHITE}   • ML Model:${NC} all-MiniLM-L6-v2 (Sentence Transformers)"
echo -e "${WHITE}   • AI Provider:${NC} Google Gemini"
echo

# Prerequisites reminder
echo -e "${YELLOW}⚠️  Prerequisites Check:${NC}"
echo -e "${WHITE}   • MySQL running on localhost:3306${NC}"
echo -e "${WHITE}   • GEMINI_API_KEY configured in ai/.env${NC}"
echo -e "${WHITE}   • Internet connection for AI models${NC}"
echo

echo -e "${GREEN}🌐 Starting FastAPI development server...${NC}"
echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

# Start development server
python main.py