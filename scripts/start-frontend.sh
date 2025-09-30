#!/bin/bash

# Enhanced Frontend Service Startup Script with Animations
# React + TypeScript + Vite Development Server

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
echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║                    🎨 REACT FRONTEND v3.0.0                              ║"
echo "║               TypeScript + Vite + Modern UI Components                    ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${CYAN}🌐 Starting React Frontend Development Server...${NC}"
echo

# Get the project root directory (parent of scripts folder)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Frontend directory not found!${NC}"
    echo -e "${YELLOW}📝 Please ensure the frontend directory exists${NC}"
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
echo -e "${YELLOW}⏳ Checking Node.js dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}📦 Installing frontend dependencies...${NC}"
    npm install > /dev/null 2>&1
    show_spinner "Dependencies installed" 25
else
    show_spinner "Dependencies found" 3
fi

echo
echo -e "${GREEN}✨ Frontend Service Configuration Complete!${NC}"
echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Service information
echo -e "${CYAN}📊 Service Information:${NC}"
echo -e "${WHITE}   • Port:${NC} 5173 (Vite default)"
echo -e "${WHITE}   • Local URL:${NC} http://localhost:5173"
echo -e "${WHITE}   • Network URL:${NC} Available on LAN"
echo -e "${WHITE}   • Framework:${NC} React 19.1.1 + TypeScript"
echo -e "${WHITE}   • Build Tool:${NC} Vite 6.2.0"
echo -e "${WHITE}   • Features:${NC} Hot Reload, Dark/Light Theme"
echo

# API connection info
echo -e "${CYAN}🔗 API Connection:${NC}"
echo -e "${WHITE}   • Backend API:${NC} http://localhost:3000"
echo -e "${WHITE}   • AI Service:${NC} http://localhost:8000"
echo -e "${WHITE}   • Auto-refresh:${NC} Enabled"
echo

# Prerequisites reminder
echo -e "${YELLOW}⚠️  Prerequisites Check:${NC}"
echo -e "${WHITE}   • Backend API running on localhost:3000${NC}"
echo -e "${WHITE}   • Modern browser with ES2015+ support${NC}"
echo -e "${WHITE}   • Internet connection for external resources${NC}"
echo

echo -e "${GREEN}🎨 Starting Vite development server...${NC}"
echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

# Start development server
npm run dev