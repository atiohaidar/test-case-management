#!/bin/bash

# Enhanced Development Script with Animations for Test Case Management System
# Version 3.0.0 - Modern Full-Stack Edition

# Colors and animation
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
SPINNER_FRAMES=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
PROGRESS_CHARS=("▁" "▂" "▃" "▄" "▅" "▆" "▇" "█")

# Spinner animation function
show_spinner() {
    local message="$1"
    local duration="$2"
    local frame=0
    
    for ((i=0; i<duration; i++)); do
        printf "\r${CYAN}${SPINNER_FRAMES[$frame]} ${WHITE}%s${NC}" "$message"
        frame=$(( (frame + 1) % ${#SPINNER_FRAMES[@]} ))
        sleep 0.1
    done
    printf "\r${GREEN}✅ %s${NC}\n" "$message"
}

# Progress bar animation
show_progress() {
    local message="$1"
    local steps=20
    
    printf "${WHITE}%s${NC}\n" "$message"
    printf "${GRAY}["
    for ((i=0; i<steps; i++)); do
        printf "${GREEN}${PROGRESS_CHARS[7]}"
        sleep 0.05
    done
    printf "${GRAY}] ${GREEN}Complete!${NC}\n\n"
}

# Header with animation
show_header() {
    clear
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                                  ║"
    echo "║               🧪 TEST CASE MANAGEMENT SYSTEM v3.0.0                            ║"
    echo "║                  🚀 Modern Full-Stack Development Suite                         ║"
    echo "║                                                                                  ║"
    echo "╠══════════════════════════════════════════════════════════════════════════════════╣"
    echo "║  🎨 React Frontend (Vite + TypeScript)  │  🚀 NestJS Backend (Prisma + MySQL) ║"
    echo "║  🤖 Python AI Service (FastAPI + RAG)   │  🐳 Docker Development Support      ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo
}

# Animated typing effect
type_text() {
    local text="$1"
    local color="$2"
    for ((i=0; i<${#text}; i++)); do
        printf "${color}%c${NC}" "${text:$i:1}"
        sleep 0.02
    done
    echo
}

# Service status check with animation
check_service_status() {
    local service="$1"
    local port="$2"
    
    printf "${YELLOW}🔍 Checking ${service}...${NC}"
    sleep 0.5
    
    if nc -z localhost "$port" 2>/dev/null; then
        printf "\r${GREEN}✅ ${service} is running on port ${port}${NC}\n"
        return 0
    else
        printf "\r${GRAY}⭕ ${service} is not running${NC}\n"
        return 1
    fi
}

# Get the project root directory (parent of scripts folder)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

show_header

# Enhanced prerequisites check with progress
echo -e "${CYAN}🔍 System Prerequisites Check${NC}"
echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

prerequisites=(
    "node:Node.js:❌ Node.js not found! Please install Node.js first."
    "python3:Python 3:❌ Python 3 not found! Please install Python 3 first."
    "mysql:MySQL Client:⚠️  MySQL client not found. Make sure MySQL server is running on localhost:3306"
    "docker:Docker:⚠️  Docker not found. Docker features will be limited."
    "docker-compose:Docker Compose:⚠️  Docker Compose not found. Docker features will be limited."
)

all_good=true
for prerequisite in "${prerequisites[@]}"; do
    IFS=":" read -r cmd name error_msg <<< "$prerequisite"
    
    printf "${YELLOW}⏳ Checking ${name}...${NC}"
    sleep 0.3
    
    if command_exists "$cmd"; then
        printf "\r${GREEN}✅ ${name} found${NC}\n"
    else
        printf "\r${RED}${error_msg}${NC}\n"
        if [[ "$cmd" == "node" || "$cmd" == "python3" ]]; then
            all_good=false
        fi
    fi
done

if [ "$all_good" = false ]; then
    echo -e "\n${RED}💀 Critical prerequisites missing! Please install required software.${NC}"
    exit 1
fi

echo
show_progress "Prerequisites check completed"

# Enhanced environment check
echo -e "${CYAN}📝 Environment Configuration Check${NC}"
echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$PROJECT_ROOT"

env_files=(
    "backend/.env:Backend Configuration"
    "ai/.env:AI Service Configuration"
)

env_ok=true
for env_file in "${env_files[@]}"; do
    IFS=":" read -r file description <<< "$env_file"
    
    printf "${YELLOW}⏳ Checking ${description}...${NC}"
    sleep 0.2
    
    if [ -f "$file" ]; then
        printf "\r${GREEN}✅ ${description} found${NC}\n"
    else
        printf "\r${RED}❌ ${file} not found!${NC}\n"
        echo -e "${YELLOW}   💡 Run: cp ${file}.example ${file}${NC}"
        env_ok=false
    fi
done

if [ "$env_ok" = false ]; then
    echo -e "\n${RED}💀 Environment files missing! Please create .env files.${NC}"
    exit 1
fi

echo
show_progress "Environment configuration verified"

# Check for frontend directory
if [ ! -d "frontend" ]; then
    echo -e "${YELLOW}⚠️  Frontend directory not found. Frontend features will be skipped.${NC}"
    sleep 1
fi

# Enhanced service status check
echo -e "${CYAN}🔍 Current Service Status${NC}"
echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

services=(
    "MySQL Database:3306"
    "NestJS Backend:3000"
    "Python AI Service:8000"
    "React Frontend:5173"
)

for service in "${services[@]}"; do
    IFS=":" read -r name port <<< "$service"
    check_service_status "$name" "$port"
done

echo

# Enhanced menu with better styling
echo -e "${CYAN}🚀 Development Mode Selection${NC}"
echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo
echo -e "${WHITE}Select an option to start your development environment:${NC}"
echo
echo -e "${GREEN} 1.${NC} ${YELLOW}🤖 Start AI Service only${NC}          ${GRAY}(Python FastAPI + ML Models)${NC}"
echo -e "${GREEN} 2.${NC} ${YELLOW}🚀 Start Backend only${NC}              ${GRAY}(NestJS + Prisma + MySQL)${NC}"
echo -e "${GREEN} 3.${NC} ${YELLOW}🎨 Start Frontend only${NC}             ${GRAY}(React + Vite + TypeScript)${NC}"
echo -e "${GREEN} 4.${NC} ${YELLOW}⚡ Backend + AI Service${NC}            ${GRAY}(Core API functionality)${NC}"
echo -e "${GREEN} 5.${NC} ${YELLOW}🌟 Backend, AI, Database Services${NC}      ${GRAY}(Complete development suite)${NC}"
echo -e "${GREEN} 6.${NC} ${YELLOW}🗄️  MySQL Database only${NC}            ${GRAY}(Docker container)${NC}"
echo -e "${GREEN} 7.${NC} ${YELLOW}🔥 Backend + AI + MySQL${NC}            ${GRAY}(API services + Database)${NC}"
echo -e "${GREEN} 8.${NC} ${YELLOW}🚀 Complete Stack + MySQL${NC}          ${GRAY}(Everything + Database)${NC}"
echo -e "${GREEN} 9.${NC} ${YELLOW}🔧 Setup Environment Files${NC}        ${GRAY}(Initialize configuration)${NC}"
echo -e "${GREEN}10.${NC} ${YELLOW}📊 System Information${NC}             ${GRAY}(Check system details)${NC}"
echo -e "${GREEN}11.${NC} ${YELLOW}🧹 Clean & Reset${NC}                  ${GRAY}(Clean containers & dependencies)${NC}"
echo
echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
printf "${WHITE}Enter your choice (1-11): ${NC}"
read choice

# Process choice with enhanced feedback
case $choice in
    1)
        echo -e "\n${PURPLE}🤖 Starting AI Service...${NC}"
        type_text "Initializing Python FastAPI server with ML models..." "$CYAN"
        chmod +x "$SCRIPTS_DIR/start-ai.sh"
        "$SCRIPTS_DIR/start-ai.sh"
        ;;
    2)
        echo -e "\n${PURPLE}🚀 Starting NestJS Backend...${NC}"
        type_text "Initializing NestJS server with Prisma ORM..." "$CYAN"
        chmod +x "$SCRIPTS_DIR/start-backend.sh"
        "$SCRIPTS_DIR/start-backend.sh"
        ;;
    3)
        echo -e "\n${PURPLE}🎨 Starting React Frontend...${NC}"
        type_text "Initializing Vite development server..." "$CYAN"
        chmod +x "$SCRIPTS_DIR/start-frontend.sh"
        "$SCRIPTS_DIR/start-frontend.sh"
        ;;
    4)
        echo -e "\n${PURPLE}⚡ Starting Backend + AI Service...${NC}"
        type_text "Setting up core API functionality..." "$CYAN"
        echo -e "${YELLOW}📝 Note: AI Service will start in new terminal${NC}"
        echo -e "${YELLOW}         Backend will start in current terminal${NC}"
        echo
        
        # Start AI service in background
        chmod +x "$SCRIPTS_DIR/start-ai.sh"
        show_spinner "Starting AI Service" 10
        if command_exists gnome-terminal; then
            gnome-terminal -- bash -c "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-ai.sh'; exec bash"
        elif command_exists xterm; then
            xterm -e "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-ai.sh'" &
        else
            echo -e "${YELLOW}⚠️  Starting AI service in background...${NC}"
            cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-ai.sh" &
            sleep 5
        fi
        
        # Start backend
        chmod +x "$SCRIPTS_DIR/start-backend.sh"
        show_spinner "Starting Backend Service" 8
        cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-backend.sh"
        ;;
    5)
        echo -e "\n${PURPLE}🌟 Starting Complete Full-Stack Suite...${NC}"
        type_text "Initializing all services for complete development experience..." "$CYAN"
        echo -e "${YELLOW}📝 Services will be distributed across multiple terminals${NC}"
        echo -e "${YELLOW}   • AI Service → New terminal${NC}"
        echo -e "${YELLOW}   • Frontend → New terminal${NC}"
        echo -e "${YELLOW}   • Backend → Current terminal${NC}"
        echo
        
        # Start AI service
        chmod +x "$SCRIPTS_DIR/start-ai.sh"
        show_spinner "Launching AI Service" 10
        if command_exists gnome-terminal; then
            gnome-terminal -- bash -c "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-ai.sh'; exec bash"
        else
            cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-ai.sh" &
            sleep 3
        fi
        
        # Start frontend
        chmod +x "$SCRIPTS_DIR/start-frontend.sh"
        show_spinner "Launching Frontend" 8
        if command_exists gnome-terminal; then
            gnome-terminal -- bash -c "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-frontend.sh'; exec bash"
        else
            cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-frontend.sh" &
            sleep 3
        fi
        
        # Start backend
        chmod +x "$SCRIPTS_DIR/start-backend.sh"
        show_spinner "Launching Backend" 10
        cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-backend.sh"
        ;;
    6)
        echo -e "\n${PURPLE}🗄️  Starting MySQL Database...${NC}"
        type_text "Initializing MySQL container with Docker..." "$CYAN"
        chmod +x "$SCRIPTS_DIR/start-mysql.sh"
        "$SCRIPTS_DIR/start-mysql.sh"
        ;;
    7)
        echo -e "\n${PURPLE}🔥 Starting Backend + AI + MySQL...${NC}"
        type_text "Setting up complete API infrastructure..." "$CYAN"
        
        # Start MySQL first
        echo -e "${CYAN}🗄️  Initializing MySQL Database...${NC}"
        chmod +x "$SCRIPTS_DIR/start-mysql.sh"
        "$SCRIPTS_DIR/start-mysql.sh"
        
        # Start AI service
        chmod +x "$SCRIPTS_DIR/start-ai.sh"
        show_spinner "Starting AI Service" 12
        if command_exists gnome-terminal; then
            gnome-terminal -- bash -c "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-ai.sh'; exec bash"
        else
            cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-ai.sh" &
            sleep 5
        fi
        
        # Start backend
        chmod +x "$SCRIPTS_DIR/start-backend.sh"
        show_spinner "Starting Backend Service" 10
        cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-backend.sh"
        ;;
    8)
        echo -e "\n${PURPLE}🚀 Starting Complete Stack with Database...${NC}"
        type_text "Deploying full development environment..." "$CYAN"
        
        # Start MySQL first
        echo -e "${CYAN}🗄️  Initializing MySQL Database...${NC}"
        chmod +x "$SCRIPTS_DIR/start-mysql.sh"
        "$SCRIPTS_DIR/start-mysql.sh"
        
        # Start AI service
        chmod +x "$SCRIPTS_DIR/start-ai.sh"
        show_spinner "Launching AI Service" 12
        if command_exists gnome-terminal; then
            gnome-terminal -- bash -c "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-ai.sh'; exec bash"
        else
            cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-ai.sh" &
            sleep 5
        fi
        
        # Start frontend
        chmod +x "$SCRIPTS_DIR/start-frontend.sh"
        show_spinner "Launching Frontend" 10
        if command_exists gnome-terminal; then
            gnome-terminal -- bash -c "cd '$PROJECT_ROOT' && '$SCRIPTS_DIR/start-frontend.sh'; exec bash"
        else
            cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-frontend.sh" &
            sleep 3
        fi
        
        # Start backend
        chmod +x "$SCRIPTS_DIR/start-backend.sh"
        show_spinner "Launching Backend" 12
        cd "$PROJECT_ROOT" && "$SCRIPTS_DIR/start-backend.sh"
        ;;
    9)
        echo -e "\n${PURPLE}🔧 Setting up Environment Files...${NC}"
        type_text "Initializing configuration templates..." "$CYAN"
        cd "$PROJECT_ROOT"
        
        env_files_to_setup=(
            "backend/.env:backend/.env.example:Backend Environment"
            "ai/.env:ai/.env.example:AI Service Environment"
        )
        
        for env_setup in "${env_files_to_setup[@]}"; do
            IFS=":" read -r target source description <<< "$env_setup"
            
            printf "${YELLOW}⏳ Setting up ${description}...${NC}"
            sleep 0.5
            
            if [ ! -f "$target" ]; then
                cp "$source" "$target"
                printf "\r${GREEN}✅ Created ${target}${NC}\n"
            else
                printf "\r${GRAY}ℹ️  ${target} already exists${NC}\n"
            fi
        done
        
        echo
        echo -e "${CYAN}📝 Configuration Setup Complete!${NC}"
        echo -e "${YELLOW}Please edit the following files to configure your environment:${NC}"
        echo -e "${WHITE}   • backend/.env${NC} ${GRAY}(database connection)${NC}"
        echo -e "${WHITE}   • ai/.env${NC} ${GRAY}(database + Gemini API key)${NC}"
        echo
        echo -e "${GREEN}🔑 Get your Gemini API key from: ${CYAN}https://aistudio.google.com/app/apikey${NC}"
        ;;
    10)
        echo -e "\n${PURPLE}📊 System Information${NC}"
        type_text "Gathering system details..." "$CYAN"
        echo
        
        echo -e "${CYAN}🖥️  System Details${NC}"
        echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        if command_exists lsb_release; then
            echo -e "${WHITE}OS:${NC} $(lsb_release -d | cut -f2)"
        elif [ -f /etc/os-release ]; then
            echo -e "${WHITE}OS:${NC} $(grep PRETTY_NAME /etc/os-release | cut -d'"' -f2)"
        fi
        
        if command_exists node; then
            echo -e "${WHITE}Node.js:${NC} $(node --version)"
        fi
        
        if command_exists python3; then
            echo -e "${WHITE}Python:${NC} $(python3 --version)"
        fi
        
        if command_exists docker; then
            echo -e "${WHITE}Docker:${NC} $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
        fi
        
        echo
        echo -e "${CYAN}📁 Project Structure${NC}"
        echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${WHITE}Project Root:${NC} $PROJECT_ROOT"
        echo -e "${WHITE}Backend:${NC} NestJS + TypeScript + Prisma"
        echo -e "${WHITE}Frontend:${NC} React + TypeScript + Vite"
        echo -e "${WHITE}AI Service:${NC} Python + FastAPI + ML"
        echo -e "${WHITE}Database:${NC} MySQL 8.0"
        ;;
    11)
        echo -e "\n${PURPLE}🧹 Clean & Reset Development Environment${NC}"
        type_text "Preparing to clean development environment..." "$CYAN"
        echo
        
        echo -e "${YELLOW}⚠️  This will clean Docker containers and node_modules${NC}"
        printf "${WHITE}Are you sure? (y/N): ${NC}"
        read confirm
        
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            echo
            show_spinner "Stopping Docker containers" 15
            docker-compose down 2>/dev/null || true
            
            show_spinner "Removing Docker containers" 10
            docker container prune -f 2>/dev/null || true
            
            show_spinner "Cleaning node_modules" 20
            [ -d "backend/node_modules" ] && rm -rf "backend/node_modules"
            [ -d "frontend/node_modules" ] && rm -rf "frontend/node_modules"
            
            show_spinner "Cleaning Python cache" 10
            [ -d "ai/__pycache__" ] && rm -rf "ai/__pycache__"
            [ -d "ai/venv" ] && rm -rf "ai/venv"
            
            echo -e "${GREEN}✨ Environment cleaned successfully!${NC}"
        else
            echo -e "${GRAY}Operation cancelled.${NC}"
        fi
        ;;
    *)
        echo -e "\n${RED}❌ Invalid option selected${NC}"
        echo -e "${YELLOW}Please choose a number between 1-11${NC}"
        exit 1
        ;;
esac

echo
echo -e "${GREEN}🎉 Development script execution completed!${NC}"
echo -e "${GRAY}Thank you for using Test Case Management System${NC}"