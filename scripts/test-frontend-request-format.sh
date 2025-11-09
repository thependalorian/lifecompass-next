#!/bin/bash

# Test script to verify frontend request format matches test script
# This helps identify discrepancies between browser and curl requests

BASE_URL="http://localhost:3000"
ENDPOINT="/api/chat/stream"

echo "=========================================="
echo "Frontend Request Format Verification"
echo "=========================================="
echo ""

# Test: Simulate exact frontend request
echo "Test: Simulating Frontend Request Format"
echo "----------------------------------------"

# Frontend sends:
# - FormData with "message" field
# - FormData with "metadata" field (JSON string)
# - Content-Type: multipart/form-data (set by browser)

# Get a test session ID (simulating frontend sessionStorage)
TEST_SESSION_ID=""

# Frontend metadata structure (from ChatWidget.tsx line 327-332)
FRONTEND_METADATA=$(jq -n \
    --arg sessionId "$TEST_SESSION_ID" \
    --arg customerPersona "CUST-001" \
    --arg userType "customer" \
    '{
        sessionId: $sessionId,
        selectedCustomerPersona: $customerPersona,
        selectedAdvisorPersona: null,
        userType: $userType
    }')

echo "Frontend metadata structure:"
echo "$FRONTEND_METADATA" | jq .
echo ""

# Send request matching frontend format
echo "Sending request (frontend format)..."
RESPONSE=$(curl -s --max-time 15 -X POST "${BASE_URL}${ENDPOINT}" \
    -F "message=test query" \
    -F "metadata=${FRONTEND_METADATA}" \
    2>&1)

# Check response
if echo "$RESPONSE" | grep -q "data:"; then
    echo "✅ Request format accepted by API"
    
    # Extract session ID from response
    SESSION_ID=$(echo "$RESPONSE" | grep -o '"sessionId":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$SESSION_ID" ]; then
        echo "✅ Session ID received: $SESSION_ID"
        echo ""
        echo "Next request should include this sessionId in metadata (matching frontend behavior)"
    fi
else
    echo "❌ Request failed or invalid response"
    echo "Response preview:"
    echo "$RESPONSE" | head -10
fi

echo ""
echo "=========================================="
echo "Key Points:"
echo "=========================================="
echo "1. Frontend includes sessionId in metadata (even if empty string)"
echo "2. Frontend sends selectedCustomerPersona OR selectedAdvisorPersona (not both)"
echo "3. Frontend sets userType based on selected persona"
echo "4. Frontend reuses sessionId for same persona"
echo ""

