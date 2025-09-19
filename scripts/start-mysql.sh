#!/bin/bash

# Script untuk menjalankan MySQL Database menggunakan Docker

echo "🗄️  Starting MySQL Database..."
echo "📝 Starting MySQL container from Docker..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Docker is available
if ! command_exists docker; then
    echo "❌ Docker tidak ditemukan! Install Docker terlebih dahulu."
    exit 1
fi

# Check if docker-compose is available
if ! command_exists docker-compose; then
    echo "❌ Docker Compose tidak ditemukan! Install Docker Compose terlebih dahulu."
    exit 1
fi

# Get the project root directory (parent of scripts folder)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if MySQL container already exists
if docker ps -a --format "table {{.Names}}" | grep -q "testcase_mysql"; then
    echo "📦 MySQL container already exists, starting it..."
    docker start testcase_mysql
else
    echo "📦 Creating and starting MySQL container..."
    docker-compose up -d mysql
fi

echo "⏳ Waiting for MySQL to be ready..."
sleep 10

# Setup database schema
echo "🔧 Setting up database schema..."
if [ -d "backend" ]; then
    cd backend && npx prisma db push && cd ..
else
    echo "❌ Backend directory not found! Make sure you're running this from the project root."
    exit 1
fi

echo "✅ MySQL Database ready!"
echo "🌐 MySQL available at localhost:3306"
echo "📊 Database: testcase_management"
echo "👤 Username: root"
echo "🔑 Password: password"
echo ""
echo "💡 Tip: Use 'docker logs testcase_mysql' to see MySQL logs"
echo "💡 Tip: Use 'docker stop testcase_mysql' to stop MySQL"