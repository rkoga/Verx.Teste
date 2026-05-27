#!/bin/bash

# Reporting Service - Database Setup Script
# Este script configura o banco de dados do Reporting Service

set -e  # Exit on error

echo "🚀 Reporting Service - Database Setup"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Erro: Arquivo .env não encontrado!${NC}"
    echo "Criando arquivo .env com configurações padrão..."
    cat > .env << EOF
# Server Configuration
PORT=3003
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://cashflow:cashflow123@localhost:5432/reporting_db

# Redis Configuration
REDIS_URL=redis://localhost:6379

# CORS Configuration
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
EOF
    echo -e "${GREEN}✅ Arquivo .env criado!${NC}"
fi

# Load environment variables
source .env 2>/dev/null || export $(cat .env | xargs)

echo "📋 Configurações:"
echo "  - Database: reporting_db"
echo "  - Host: localhost:5432"
echo "  - User: cashflow"
echo ""

# Step 1: Check if PostgreSQL is running
echo "1️⃣  Verificando PostgreSQL..."
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  PostgreSQL não está rodando!${NC}"
    echo "   Iniciando com Docker Compose..."
    cd ../../
    docker-compose up -d postgres
    cd services/reporting
    echo "   Aguardando PostgreSQL iniciar..."
    sleep 5
fi
echo -e "${GREEN}✅ PostgreSQL está rodando${NC}"
echo ""

# Step 2: Create database if not exists
echo "2️⃣  Criando banco de dados 'reporting_db'..."
PGPASSWORD=cashflow123 psql -h localhost -U cashflow -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'reporting_db'" | grep -q 1 || \
PGPASSWORD=cashflow123 psql -h localhost -U cashflow -d postgres -c "CREATE DATABASE reporting_db;"
echo -e "${GREEN}✅ Banco de dados criado/verificado${NC}"
echo ""

# Step 3: Generate Prisma Client
echo "3️⃣  Gerando Prisma Client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma Client gerado${NC}"
echo ""

# Step 4: Run migrations
echo "4️⃣  Executando migrations..."
npx prisma migrate dev --name init
echo -e "${GREEN}✅ Migrations executadas${NC}"
echo ""

# Step 5: Verify tables
echo "5️⃣  Verificando tabelas criadas..."
PGPASSWORD=cashflow123 psql -h localhost -U cashflow -d reporting_db -c "\dt"
echo ""

echo -e "${GREEN}🎉 Setup concluído com sucesso!${NC}"
echo ""
echo "📊 Próximos passos:"
echo "  1. Iniciar o serviço: npm run dev"
echo "  2. Testar health check: curl http://localhost:3003/api/v1/health"
echo "  3. Abrir Prisma Studio: npx prisma studio"
echo ""

# Made with Bob
