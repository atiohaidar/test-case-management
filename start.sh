#!/bin/bash

echo "🚀 Starting Test Case Management System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

echo "📦 Building and starting services..."
docker-compose up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "✅ Services are starting up!"
echo ""
echo "🌐 Access points:"
echo "  - Backend API: http://localhost:3000"
echo "  - API Documentation: http://localhost:3000/api"
echo "  - AI Service: http://localhost:8000"
echo "  - AI Documentation: http://localhost:8000/docs"
echo ""
echo "📊 Check health status:"
echo "  curl http://localhost:3000/health"
echo "  curl http://localhost:8000/health"
echo ""
echo "🔧 Useful commands:"
echo "  - View logs: docker-compose logs -f [service_name]"
echo "  - Stop services: docker-compose down"
echo "  - Restart: docker-compose restart"
echo ""