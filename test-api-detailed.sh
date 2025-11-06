#!/bin/bash

BASE_URL="https://lifecompass-betitpyp0-buffr.vercel.app"
SHARE="O2uuivTuFTVw4jU5zQdca8vTRPtifry8"

echo "🧪 Detailed API Route Testing"
echo "=============================="
echo ""

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local name=$4
    
    echo "Testing: $name"
    echo "URL: ${BASE_URL}${endpoint}?_vercel_share=${SHARE}"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "${BASE_URL}${endpoint}?_vercel_share=${SHARE}" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${BASE_URL}${endpoint}?_vercel_share=${SHARE}")
    fi
    
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    echo "HTTP Status: $http_code"
    echo "$body" | head -5
    echo "---"
    echo ""
}

# Test all endpoints
test_endpoint "GET" "/api/graph" "" "GET /api/graph"
test_endpoint "GET" "/api/advisors" "" "GET /api/advisors"
test_endpoint "GET" "/api/customers" "" "GET /api/customers"
test_endpoint "GET" "/api/documents" "" "GET /api/documents"
test_endpoint "GET" "/api/tasks" "" "GET /api/tasks"
test_endpoint "GET" "/api/policies" "" "GET /api/policies"
test_endpoint "GET" "/api/claims" "" "GET /api/claims"
test_endpoint "GET" "/api/interactions" "" "GET /api/interactions"
test_endpoint "GET" "/api/advisors/ADV-001/clients" "" "GET /api/advisors/ADV-001/clients"
test_endpoint "GET" "/api/advisors/ADV-001/dashboard" "" "GET /api/advisors/ADV-001/dashboard"
test_endpoint "POST" "/api/chat" '{"message": "Hello", "sessionId": "test-123", "userId": "test-user"}' "POST /api/chat"
test_endpoint "GET" "/api/knowledge?query=insurance" "" "GET /api/knowledge"

echo "✅ Testing Complete!"
