#!/bin/bash

# Enhanced MySQL Database Startup Script with Animations
# Docker Container with Automated Schema Setup

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
echo -e "${YELLOW}"
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║                    🗄️  MYSQL DATABASE v3.0.0                             ║"
echo "║                Docker Container + Automated Schema Setup                   ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${CYAN}🗄️  Starting MySQL Database Service...${NC}"
echo

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Docker prerequisites
echo -e "${YELLOW}⏳ Checking Docker prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker not found! Please install Docker first.${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose not found! Please install Docker Compose first.${NC}"
    exit 1
fi

show_spinner "Docker prerequisites verified" 5

# Get the project root directory (parent of scripts folder)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if MySQL container already exists
echo -e "${YELLOW}⏳ Checking existing MySQL container...${NC}"
if docker ps -a --format "table {{.Names}}" | grep -q "testcase_mysql"; then
    echo -e "${CYAN}📦 MySQL container exists, starting it...${NC}"
    docker start testcase_mysql > /dev/null 2>&1
    show_spinner "Container started" 8
else
    echo -e "${CYAN}📦 Creating new MySQL container...${NC}"
    docker-compose up -d mysql > /dev/null 2>&1
    show_spinner "Container created and started" 15
fi

# Wait for MySQL to be ready
echo -e "${CYAN}⏳ Waiting for MySQL to initialize...${NC}"
show_spinner "MySQL server starting up" 30

# Setup database schema
echo -e "${CYAN}🔧 Setting up database schema...${NC}"
if [ -d "backend" ]; then
    cd backend
    npx prisma db push > /dev/null 2>&1
    cd ..
    show_spinner "Database schema synchronized" 10
else
    echo -e "${RED}❌ Backend directory not found!${NC}"
    echo -e "${YELLOW}Make sure you're running this from the project root.${NC}"
    exit 1
fi

echo
echo -e "${GREEN}✨ MySQL Database Configuration Complete!${NC}"
echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Database information
echo -e "${CYAN}📊 Database Information:${NC}"
echo -e "${WHITE}   • Host:${NC} localhost"
echo -e "${WHITE}   • Port:${NC} 3306"
echo -e "${WHITE}   • Database:${NC} testcase_management"
echo -e "${WHITE}   • Username:${NC} root"
echo -e "${WHITE}   • Password:${NC} password"
echo -e "${WHITE}   • Container:${NC} testcase_mysql"
echo

# Management commands
echo -e "${CYAN}💡 Management Commands:${NC}"
echo -e "${WHITE}   • View logs:${NC} docker logs testcase_mysql"
echo -e "${WHITE}   • Stop database:${NC} docker stop testcase_mysql"
echo -e "${WHITE}   • Remove container:${NC} docker rm testcase_mysql"
echo -e "${WHITE}   • Database GUI:${NC} npx prisma studio (from backend folder)"
echo

# Connection test
echo -e "${CYAN}🔍 Testing database connection...${NC}"
if docker exec testcase_mysql mysqladmin ping -h localhost -u root -ppassword > /dev/null 2>&1; then
    show_spinner "Database connection verified" 5
    echo -e "${GREEN}🎉 MySQL Database is ready for connections!${NC}"
else
    echo -e "${RED}⚠️  Database connection test failed${NC}"
    echo -e "${YELLOW}Please wait a few more seconds for MySQL to fully initialize${NC}"
fi

echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"