#!/bin/bash

# Script para testar os serviços do Cash Flow System
set -e

echo "🚀 Cash Flow System - Test Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Step 1: Start infrastructure
echo -e "${YELLOW}📦 Step 1: Starting infrastructure (PostgreSQL, Redis, RabbitMQ)...${NC}"
docker-compose up -d postgres redis rabbitmq

echo "⏳ Waiting for services to be ready (30 seconds)..."
sleep 30

# Check if PostgreSQL is ready
echo "🔍 Checking PostgreSQL..."
docker-compose exec -T postgres pg_isready -U cashflow_user || {
    echo -e "${RED}❌ PostgreSQL is not ready${NC}"
    exit 1
}
echo -e "${GREEN}✅ PostgreSQL is ready${NC}"

# Step 2: Install dependencies
echo ""
echo -e "${YELLOW}📦 Step 2: Installing dependencies...${NC}"

echo "Installing shared module dependencies..."
cd shared && npm install && cd ..

echo "Installing transactions service dependencies..."
cd services/transactions && npm install && cd ../..

echo "Installing consolidation service dependencies..."
cd services/consolidation && npm install && cd ../..

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 3: Generate Prisma clients
echo ""
echo -e "${YELLOW}🔧 Step 3: Generating Prisma clients...${NC}"

echo "Generating Prisma client for transactions service..."
cd services/transactions && npx prisma generate && cd ../..

echo "Generating Prisma client for consolidation service..."
cd services/consolidation && npx prisma generate && cd ../..

echo -e "${GREEN}✅ Prisma clients generated${NC}"

# Step 4: Run migrations
echo ""
echo -e "${YELLOW}🗄️  Step 4: Running database migrations...${NC}"

echo "Running migrations for transactions service..."
cd services/transactions && npx prisma migrate dev --name init && cd ../..

echo "Running migrations for consolidation service..."
cd services/consolidation && npx prisma migrate dev --name init && cd ../..

echo -e "${GREEN}✅ Migrations completed${NC}"

# Step 5: Start services
echo ""
echo -e "${YELLOW}🚀 Step 5: Starting services...${NC}"

echo "Starting Transactions Service on port 3001..."
cd services/transactions
npm run dev > ../../logs/transactions.log 2>&1 &
TRANSACTIONS_PID=$!
cd ../..

echo "Starting Consolidation Service on port 3002..."
cd services/consolidation
npm run dev > ../../logs/consolidation.log 2>&1 &
CONSOLIDATION_PID=$!
cd ../..

echo "⏳ Waiting for services to start (10 seconds)..."
sleep 10

# Step 6: Test services
echo ""
echo -e "${YELLOW}🧪 Step 6: Testing services...${NC}"

# Test Transactions Service
echo ""
echo "Testing Transactions Service Health..."
TRANSACTIONS_HEALTH=$(curl -s http://localhost:3001/api/v1/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Transactions Service is healthy${NC}"
    echo "Response: $TRANSACTIONS_HEALTH"
else
    echo -e "${RED}❌ Transactions Service health check failed${NC}"
fi

# Test Consolidation Service
echo ""
echo "Testing Consolidation Service Health..."
CONSOLIDATION_HEALTH=$(curl -s http://localhost:3002/api/v1/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Consolidation Service is healthy${NC}"
    echo "Response: $CONSOLIDATION_HEALTH"
else
    echo -e "${RED}❌ Consolidation Service health check failed${NC}"
fi

# Summary
echo ""
echo "=================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📊 Services Status:"
echo "  - Transactions Service: http://localhost:3001"
echo "  - Consolidation Service: http://localhost:3002"
echo ""
echo "📚 API Documentation:"
echo "  - Transactions API: http://localhost:3001/api/docs"
echo "  - Consolidation API: http://localhost:3002/api/docs"
echo ""
echo "🔍 Logs:"
echo "  - Transactions: logs/transactions.log"
echo "  - Consolidation: logs/consolidation.log"
echo ""
echo "🛑 To stop services:"
echo "  kill $TRANSACTIONS_PID $CONSOLIDATION_PID"
echo "  docker-compose down"
echo ""

# Save PIDs to file
echo "$TRANSACTIONS_PID" > .pids
echo "$CONSOLIDATION_PID" >> .pids

echo "PIDs saved to .pids file"