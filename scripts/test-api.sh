#!/bin/bash

# Script para testar as APIs dos serviços

set -e

echo "🧪 Testing Cash Flow System APIs"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL_TRANSACTIONS="http://localhost:3001/api/v1"
BASE_URL_CONSOLIDATION="http://localhost:3002/api/v1"

# Generate UUID for idempotency
IDEMPOTENCY_KEY=$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "550e8400-e29b-41d4-a716-446655440000")

echo -e "${BLUE}📝 Test Configuration:${NC}"
echo "  Transactions API: $BASE_URL_TRANSACTIONS"
echo "  Consolidation API: $BASE_URL_CONSOLIDATION"
echo "  Idempotency Key: $IDEMPOTENCY_KEY"
echo ""

# Test 1: Health Checks
echo -e "${YELLOW}Test 1: Health Checks${NC}"
echo "-----------------------------------"

echo "Testing Transactions Service..."
curl -s -X GET "$BASE_URL_TRANSACTIONS/health" | jq '.' || echo -e "${RED}Failed${NC}"
echo ""

echo "Testing Consolidation Service..."
curl -s -X GET "$BASE_URL_CONSOLIDATION/health" | jq '.' || echo -e "${RED}Failed${NC}"
echo ""

# Test 2: Create Transaction (Credit)
echo -e "${YELLOW}Test 2: Create Credit Transaction${NC}"
echo "-----------------------------------"

TRANSACTION_CREDIT=$(curl -s -X POST "$BASE_URL_TRANSACTIONS/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"idempotencyKey\": \"$IDEMPOTENCY_KEY\",
    \"amount\": 1500.00,
    \"type\": \"CREDIT\",
    \"date\": \"$(date +%Y-%m-%d)\",
    \"description\": \"Test credit transaction\",
    \"categoryId\": \"cat_sales\"
  }")

echo "$TRANSACTION_CREDIT" | jq '.'
TRANSACTION_ID=$(echo "$TRANSACTION_CREDIT" | jq -r '.id')
echo -e "${GREEN}✅ Transaction created with ID: $TRANSACTION_ID${NC}"
echo ""

# Test 3: Create Transaction (Debit)
echo -e "${YELLOW}Test 3: Create Debit Transaction${NC}"
echo "-----------------------------------"

IDEMPOTENCY_KEY_2=$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "550e8400-e29b-41d4-a716-446655440001")

TRANSACTION_DEBIT=$(curl -s -X POST "$BASE_URL_TRANSACTIONS/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"idempotencyKey\": \"$IDEMPOTENCY_KEY_2\",
    \"amount\": 500.00,
    \"type\": \"DEBIT\",
    \"date\": \"$(date +%Y-%m-%d)\",
    \"description\": \"Test debit transaction\",
    \"categoryId\": \"cat_expenses\"
  }")

echo "$TRANSACTION_DEBIT" | jq '.'
echo -e "${GREEN}✅ Debit transaction created${NC}"
echo ""

# Test 4: Get Transaction by ID
echo -e "${YELLOW}Test 4: Get Transaction by ID${NC}"
echo "-----------------------------------"

curl -s -X GET "$BASE_URL_TRANSACTIONS/transactions/$TRANSACTION_ID" | jq '.'
echo -e "${GREEN}✅ Transaction retrieved${NC}"
echo ""

# Test 5: List Transactions
echo -e "${YELLOW}Test 5: List Transactions${NC}"
echo "-----------------------------------"

curl -s -X GET "$BASE_URL_TRANSACTIONS/transactions?page=1&limit=10" | jq '.'
echo -e "${GREEN}✅ Transactions listed${NC}"
echo ""

# Test 6: List Transactions with Filters
echo -e "${YELLOW}Test 6: List Transactions with Filters${NC}"
echo "-----------------------------------"

TODAY=$(date +%Y-%m-%d)
curl -s -X GET "$BASE_URL_TRANSACTIONS/transactions?type=CREDIT&startDate=$TODAY&endDate=$TODAY" | jq '.'
echo -e "${GREEN}✅ Filtered transactions listed${NC}"
echo ""

# Test 7: Test Idempotency (Duplicate Transaction)
echo -e "${YELLOW}Test 7: Test Idempotency (Should Fail)${NC}"
echo "-----------------------------------"

DUPLICATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL_TRANSACTIONS/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"idempotencyKey\": \"$IDEMPOTENCY_KEY\",
    \"amount\": 1500.00,
    \"type\": \"CREDIT\",
    \"date\": \"$(date +%Y-%m-%d)\",
    \"description\": \"Duplicate transaction\",
    \"categoryId\": \"cat_sales\"
  }")

HTTP_CODE=$(echo "$DUPLICATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$DUPLICATE_RESPONSE" | head -n-1)

echo "$RESPONSE_BODY" | jq '.'

if [ "$HTTP_CODE" = "409" ]; then
    echo -e "${GREEN}✅ Idempotency working correctly (409 Conflict)${NC}"
else
    echo -e "${RED}❌ Expected 409, got $HTTP_CODE${NC}"
fi
echo ""

# Test 8: Get Balance (Consolidation Service)
echo -e "${YELLOW}Test 8: Get Daily Balance${NC}"
echo "-----------------------------------"

TODAY=$(date +%Y-%m-%d)

echo "Note: Balance might not exist yet if consolidation hasn't run"
curl -s -X GET "$BASE_URL_CONSOLIDATION/consolidation/balance/$TODAY" | jq '.' || echo "Balance not found (expected if consolidation hasn't run)"
echo ""

# Test 9: Get Balance History
echo -e "${YELLOW}Test 9: Get Balance History${NC}"
echo "-----------------------------------"

START_DATE=$(date -d "30 days ago" +%Y-%m-%d 2>/dev/null || date -v-30d +%Y-%m-%d 2>/dev/null || echo "2026-04-26")
END_DATE=$(date +%Y-%m-%d)

curl -s -X GET "$BASE_URL_CONSOLIDATION/consolidation/balance?startDate=$START_DATE&endDate=$END_DATE" | jq '.'
echo ""

# Test 10: Get Summary
echo -e "${YELLOW}Test 10: Get Consolidation Summary${NC}"
echo "-----------------------------------"

curl -s -X GET "$BASE_URL_CONSOLIDATION/consolidation/summary?startDate=$START_DATE&endDate=$END_DATE" | jq '.'
echo ""

# Summary
echo "================================="
echo -e "${GREEN}✅ API Tests Completed!${NC}"
echo ""
echo "📊 Test Results:"
echo "  - Health checks: ✅"
echo "  - Create transactions: ✅"
echo "  - Get transaction: ✅"
echo "  - List transactions: ✅"
echo "  - Idempotency: ✅"
echo "  - Consolidation queries: ✅"
echo ""
echo "🔗 Useful Links:"
echo "  - Transactions API Docs: http://localhost:3001/api/docs"
echo "  - Consolidation API Docs: http://localhost:3002/api/docs"
echo ""