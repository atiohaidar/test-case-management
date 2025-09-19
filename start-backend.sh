#!/bin/bash

# Script untuk menjalankan Backend NestJS dalam mode development

echo "🚀 Starting NestJS Backend Development Server..."

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ File backend/.env tidak ditemukan!"
    echo "📝 Copy backend/.env.example ke backend/.env dan edit sesuai konfigurasi Anda"
    echo "   cp backend/.env.example backend/.env"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Push database schema (development only)
echo "🗄️  Pushing database schema..."
npx prisma db push

echo "✅ Backend ready!"
echo "🌐 Starting development server on http://localhost:3000"
echo "📚 API Documentation will be available at http://localhost:3000/api"
echo ""
echo "⚠️  Make sure:"
echo "   - MySQL is running on localhost:3306"
echo "   - AI service is running on localhost:8000"
echo ""

# Start development server
npm run start:dev