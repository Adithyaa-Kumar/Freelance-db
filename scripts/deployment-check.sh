#!/bin/bash

# Deployment Verification Script for FreelanceFlow
# Checks all services are running correctly in production

set -e

echo "🚀 FreelanceFlow Deployment Verification"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="${FRONTEND_URL:-https://freelanceflow.com}"
BACKEND_URL="${BACKEND_URL:-https://api.freelanceflow.com}"
TEST_EMAIL="test@freelanceflow.com"
TEST_PASSWORD="TestPass123!"

# Helper functions
check_url() {
  local url=$1
  local expected_code=${2:-200}
  
  response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
  
  if [ "$response" = "$expected_code" ]; then
    echo -e "${GREEN}✓${NC} $url ($response)"
    return 0
  else
    echo -e "${RED}✗${NC} $url (expected $expected_code, got $response)"
    return 1
  fi
}

check_json_response() {
  local url=$1
  local field=$2
  
  response=$(curl -s "$url" 2>/dev/null || echo "{}")
  
  if echo "$response" | grep -q "\"$field\""; then
    echo -e "${GREEN}✓${NC} $url returns $field"
    return 0
  else
    echo -e "${RED}✗${NC} $url missing $field"
    echo "Response: $response"
    return 1
  fi
}

check_cors() {
  local url=$1
  local origin=$2
  
  response=$(curl -i -X OPTIONS "$url" \
    -H "Origin: $origin" \
    -H "Access-Control-Request-Method: POST" 2>/dev/null)
  
  if echo "$response" | grep -q "access-control-allow-origin"; then
    echo -e "${GREEN}✓${NC} CORS configured for $origin"
    return 0
  else
    echo -e "${RED}✗${NC} CORS not configured for $origin"
    return 1
  fi
}

# Start checks
echo "1️⃣  Checking Frontend (Cloudflare Pages)"
echo "----------------------------------------"

check_url "$FRONTEND_URL" 200
check_url "$FRONTEND_URL/index.html" 200

echo ""
echo "2️⃣  Checking Backend (Cloudflare Workers)"
echo "----------------------------------------"

check_url "$BACKEND_URL/api/health" 200
check_json_response "$BACKEND_URL/api/health" "status"

echo ""
echo "3️⃣  Checking CORS Configuration"
echo "-------------------------------"

check_cors "$BACKEND_URL/api/health" "$FRONTEND_URL"

echo ""
echo "4️⃣  Checking Database Connectivity"
echo "----------------------------------"

health_response=$(curl -s "$BACKEND_URL/api/health")

if echo "$health_response" | grep -q '"database":"connected"'; then
  echo -e "${GREEN}✓${NC} Database connected"
elif echo "$health_response" | grep -q "database"; then
  db_status=$(echo "$health_response" | grep -o '"database":"[^"]*"' | cut -d'"' -f4)
  echo -e "${YELLOW}⚠${NC} Database: $db_status"
fi

echo ""
echo "5️⃣  Checking API Endpoints"
echo "-------------------------"

# Test auth endpoint (should fail with 400 but not 404)
auth_response=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{}')

if [ "$auth_response" = "400" ] || [ "$auth_response" = "401" ]; then
  echo -e "${GREEN}✓${NC} Auth endpoint exists"
elif [ "$auth_response" = "404" ]; then
  echo -e "${RED}✗${NC} Auth endpoint not found (404)"
else
  echo -e "${YELLOW}⚠${NC} Auth endpoint returned $auth_response"
fi

echo ""
echo "6️⃣  Performance Checks"
echo "---------------------"

# Check frontend response time
start_time=$(date +%s%N)
frontend_response=$(curl -s -o /dev/null -w "%{time_total}" "$FRONTEND_URL")
echo -e "${GREEN}✓${NC} Frontend response: ${frontend_response}s"

# Check backend response time
start_time=$(date +%s%N)
backend_response=$(curl -s -o /dev/null -w "%{time_total}" "$BACKEND_URL/api/health")
echo -e "${GREEN}✓${NC} Backend response: ${backend_response}s"

echo ""
echo "7️⃣  Environment Check"
echo "-------------------"

# Check if environment variables are accessible
frontend_env=$(curl -s "$FRONTEND_URL" | grep -o 'VITE_[A-Z_]*' | head -1 || echo "")
if [ -n "$frontend_env" ]; then
  echo -e "${YELLOW}⚠${NC} Found environment variable in bundle (should be removed for production)"
else
  echo -e "${GREEN}✓${NC} No environment variables exposed in frontend"
fi

echo ""
echo "========================================"
echo "✨ Deployment Verification Complete"
echo ""
echo "📊 Summary:"
echo "  Frontend: $FRONTEND_URL"
echo "  Backend:  $BACKEND_URL"
echo ""
echo "Next steps:"
echo "1. Monitor error logs: wrangler tail --env production"
echo "2. Check DNS: dig $FRONTEND_URL"
echo "3. Test with real browser"
echo ""
