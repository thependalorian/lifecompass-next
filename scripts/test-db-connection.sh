#!/bin/bash

# Quick database connectivity test script
# Tests if the database is properly configured and accessible

BASE_URL="${BASE_URL:-http://localhost:3000}"
ENDPOINT="/api/chat/stream"

echo "Testing database connectivity..."
echo ""

# Test 1: Check if server is running
echo "1. Checking server status..."
if ! curl -s --max-time 2 "${BASE_URL}" > /dev/null 2>&1; then
    echo "   ❌ Server not running at ${BASE_URL}"
    echo "   Please start the server with: npm run dev"
    exit 1
fi
echo "   ✅ Server is running"

# Test 2: Check database connectivity via API
echo "2. Testing database connection via API..."
TEST_RESPONSE=$(curl -s --max-time 10 -X POST "${BASE_URL}${ENDPOINT}" \
    -F "message=test" \
    -F "metadata={\"selectedCustomerPersona\":\"CUST-001\",\"userType\":\"customer\"}" \
    2>&1 | head -30)

# Check for demo mode indicators
if echo "$TEST_RESPONSE" | grep -q "Demo streaming response\|DATABASE_URL environment variable\|demo-session"; then
    echo "   ❌ Database NOT configured - API is in demo mode"
    echo ""
    echo "   The API returned a demo response, which means:"
    echo "   - DATABASE_URL is not set in .env"
    echo "   - OR database is not accessible"
    echo ""
    echo "   To fix:"
    echo "   1. Check .env file has: DATABASE_URL=postgresql://..."
    echo "   2. Verify database is running and accessible"
    echo "   3. Run migrations if needed"
    echo "   4. Restart server: npm run dev"
    echo ""
    exit 1
fi

# Check for valid streaming response
if echo "$TEST_RESPONSE" | grep -q "data:"; then
    echo "   ✅ Database connectivity confirmed!"
    echo "   Response format: Valid streaming response detected"
    
    # Check for session ID (indicates real database)
    if echo "$TEST_RESPONSE" | grep -q "sessionId"; then
        echo "   ✅ Session management working (database-backed)"
    fi
    
    echo ""
    echo "✅ All database checks passed!"
    echo "   Ready to run comprehensive tests"
    exit 0
else
    echo "   ⚠️  Warning: Could not verify database response format"
    echo "   Response preview:"
    echo "$TEST_RESPONSE" | head -10
    echo ""
    exit 1
fi

