#!/bin/bash

# Enhanced Backend Service Startup Script with Animations
# NestJS + TypeScript + Prisma ORM + MySQL

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
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║                    🚀 NESTJS BACKEND v3.0.0                              ║"
echo "║              TypeScript + Prisma ORM + MySQL Database                     ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${CYAN}🚀 Starting NestJS Backend Development Server...${NC}"
echo

# Get the project root directory (parent of scripts folder)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if .env file exists
echo -e "${YELLOW}⏳ Checking configuration...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ File backend/.env not found!${NC}"
    echo -e "${YELLOW}📝 Copy backend/.env.example to backend/.env and configure it${NC}"
    echo -e "${WHITE}   cp backend/.env.example backend/.env${NC}"
    exit 1
fi
show_spinner "Configuration verified" 5

# Navigate to backend directory
cd backend

# Check if node_modules exists
echo -e "${YELLOW}⏳ Checking Node.js dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}📦 Installing backend dependencies...${NC}"
    npm install > /dev/null 2>&1
    show_spinner "Dependencies installed" 25
else
    show_spinner "Dependencies found" 3
fi

# Generate Prisma client
echo -e "${CYAN}⚙️  Generating Prisma client...${NC}"
npx prisma generate > /dev/null 2>&1
show_spinner "Prisma client generated" 8

# Push database schema (development only)
echo -e "${CYAN}🗄️  Syncing database schema...${NC}"
npx prisma db push > /dev/null 2>&1
show_spinner "Database schema synced" 10

echo
echo -e "${GREEN}✨ Backend Service Configuration Complete!${NC}"
echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Service information
echo -e "${CYAN}📊 Service Information:${NC}"
echo -e "${WHITE}   • Port:${NC} 3000"
echo -e "${WHITE}   • API Docs:${NC} http://localhost:3000/api"
echo -e "${WHITE}   • Health Check:${NC} http://localhost:3000/testcases"
echo -e "${WHITE}   • Framework:${NC} NestJS v10.3.0"
echo -e "${WHITE}   • Database:${NC} MySQL with Prisma ORM"
echo -e "${WHITE}   • Language:${NC} TypeScript"
echo

# Prerequisites reminder
echo -e "${YELLOW}⚠️  Prerequisites Check:${NC}"
echo -e "${WHITE}   • MySQL running on localhost:3306${NC}"
echo -e "${WHITE}   • AI service running on localhost:8000${NC}"
echo -e "${WHITE}   • Database configured in backend/.env${NC}"
echo

echo -e "${GREEN}🌐 Starting NestJS development server...${NC}"
echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

# Start development server
npm run start:dev