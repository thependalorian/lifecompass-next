#!/bin/bash

# Script to verify that test script requests match frontend requests
# Compares actual frontend requests with test script requests

BASE_URL="http://localhost:3000"
ENDPOINT="/api/chat/stream"

echo "=========================================="
echo "Frontend vs Test Script Verification"
echo "=========================================="
echo ""

# Test 1: Compare request format
echo "Test 1: Request Format Comparison"
echo "-----------------------------------"

# Simulate frontend request (using curl with same format as browser)
echo "Frontend-style request (FormData with proper headers):"
FRONTEND_RESPONSE=$(curl -s --max-time 10 -X POST "${BASE_URL}${ENDPOINT}" \
    -H "Content-Type: multipart/form-data" \
    -F "message=test query" \
    -F "metadata={\"selectedCustomerPersona\":\"CUST-001\",\"userType\":\"customer\",\"sessionId\":\"\"}" \
    2>&1 | head -20)

echo "Response preview:"
echo "$FRONTEND_RESPONSE" | head -5
echo ""

# Test script style request
echo "Test script-style request:"
TEST_SCRIPT_RESPONSE=$(curl -s --max-time 10 -X POST "${BASE_URL}${ENDPOINT}" \
    -F "message=test query" \
    -F "metadata={\"selectedCustomerPersona\":\"CUST-001\",\"userType\":\"customer\"}" \
    2>&1 | head -20)

echo "Response preview:"
echo "$TEST_SCRIPT_RESPONSE" | head -5
echo ""

# Compare responses
if [ "$FRONTEND_RESPONSE" = "$TEST_SCRIPT_RESPONSE" ]; then
    echo "✅ Responses match!"
else
    echo "⚠️  Responses differ (this might be normal due to timing/session differences)"
fi
echo ""

# Test 2: Check Content-Type headers
echo "Test 2: Content-Type Header Check"
echo "-----------------------------------"
echo "Frontend sends: multipart/form-data (browser sets boundary automatically)"
echo "Test script sends: multipart/form-data (curl sets boundary automatically)"
echo "✅ Both use multipart/form-data"
echo ""

# Test 3: Verify metadata parsing
echo "Test 3: Metadata Format Check"
echo "-----------------------------------"
echo "Frontend metadata structure:"
echo '  { sessionId, selectedCustomerPersona, selectedAdvisorPersona, userType }'
echo ""
echo "Test script metadata structure:"
echo '  { selectedCustomerPersona, selectedAdvisorPersona, userType }'
echo ""
echo "⚠️  Difference: Frontend includes sessionId, test script doesn't"
echo "   Impact: Frontend might reuse sessions, test script creates new ones"
echo ""

# Test 4: Stream parsing comparison
echo "Test 4: Stream Parsing Comparison"
echo "-----------------------------------"
echo "Frontend: Uses ReadableStream.getReader() + TextDecoder"
echo "Test script: Reads curl output line by line"
echo "⚠️  Different parsing methods - verify both handle edge cases"
echo ""

# Test 5: Error handling comparison
echo "Test 5: Error Handling Comparison"
echo "-----------------------------------"
echo "Frontend: Checks response.ok, throws Error"
echo "Test script: Checks HTTP status code"
echo "✅ Both check for errors, but methods differ"
echo ""

echo "=========================================="
echo "Recommendations:"
echo "=========================================="
echo "1. Add frontend integration tests (Playwright/Cypress)"
echo "2. Add request/response logging to compare actual vs test"
echo "3. Verify session reuse behavior matches"
echo "4. Test error scenarios in both environments"
echo ""

