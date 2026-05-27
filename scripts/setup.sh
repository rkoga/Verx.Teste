#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Cash Flow System - Setup Script                     ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo ""

# Check if Node.js is installed
echo -e "${YELLOW}[1/8] Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 20+ first.${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"
echo ""

# Check if Docker is installed
echo -e "${YELLOW}[2/8] Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi
DOCKER_VERSION=$(docker --version)
echo -e "${GREEN}✓ ${DOCKER_VERSION} found${NC}"
echo ""

# Check if Docker Compose is installed
echo -e "${YELLOW}[3/8] Checking Docker Compose installation...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi
COMPOSE_VERSION=$(docker-compose --version)
echo -e "${GREEN}✓ ${COMPOSE_VERSION} found${NC}"
echo ""

# Copy .env.example to .env if not exists
echo -e "${YELLOW}[4/8] Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file from .env.example${NC}"
else
    echo -e "${BLUE}ℹ .env file already exists, skipping...${NC}"
fi
echo ""

# Install root dependencies
echo -e "${YELLOW}[5/8] Installing root dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Root dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install root dependencies${NC}"
    exit 1
fi
echo ""

# Install shared module dependencies
echo -e "${YELLOW}[6/8] Installing shared module dependencies...${NC}"
cd shared
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Shared module dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install shared module dependencies${NC}"
    exit 1
fi
cd ..
echo ""

# Install transactions service dependencies
echo -e "${YELLOW}[7/8] Installing transactions service dependencies...${NC}"
cd services/transactions
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Transactions service dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install transactions service dependencies${NC}"
    exit 1
fi
cd ../..
echo ""

# Start infrastructure services
echo -e "${YELLOW}[8/8] Starting infrastructure services (PostgreSQL, Redis, RabbitMQ)...${NC}"
docker-compose up -d postgres redis rabbitmq
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Infrastructure services started${NC}"
else
    echo -e "${RED}❌ Failed to start infrastructure services${NC}"
    exit 1
fi
echo ""

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready (30 seconds)...${NC}"
sleep 30
echo -e "${GREEN}✓ Services should be ready now${NC}"
echo ""

# Generate Prisma Client
echo -e "${YELLOW}Generating Prisma Client...${NC}"
cd services/transactions
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Prisma Client generated${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi
cd ../..
echo ""

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
cd services/transactions
npx prisma migrate dev --name init
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database migrations completed${NC}"
else
    echo -e "${RED}❌ Failed to run migrations${NC}"
    exit 1
fi
cd ../..
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ Setup completed successfully!                     ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Start the transactions service:"
echo -e "     ${YELLOW}cd services/transactions && npm run dev${NC}"
echo ""
echo -e "  2. Access the services:"
echo -e "     - Transactions API: ${YELLOW}http://localhost:3001${NC}"
echo -e "     - API Docs: ${YELLOW}http://localhost:3001/api/docs${NC}"
echo -e "     - Health Check: ${YELLOW}http://localhost:3001/health${NC}"
echo -e "     - PostgreSQL: ${YELLOW}localhost:5432${NC}"
echo -e "     - Redis: ${YELLOW}localhost:6379${NC}"
echo -e "     - RabbitMQ Management: ${YELLOW}http://localhost:15672${NC} (guest/guest)"
echo -e "     - Prometheus: ${YELLOW}http://localhost:9090${NC}"
echo -e "     - Grafana: ${YELLOW}http://localhost:3000${NC} (admin/admin)"
echo ""
echo -e "${BLUE}To stop services:${NC}"
echo -e "  ${YELLOW}docker-compose down${NC}"
echo ""
