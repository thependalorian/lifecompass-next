#!/bin/bash

# Test all API routes
BASE_URL="https://lifecompass-betitpyp0-buffr.vercel.app"
BYPASS_TOKEN="${1:-vwX7raJGhNfIcFe5m8KZGOjMqWqjuTuj}"

echo "🧪 Testing LifeCompass API Routes"
echo "=================================="
echo ""

# Test 1: GET /api/graph
echo "1️⃣  Testing GET /api/graph"
curl -s "${BASE_URL}/api/graph?_vercel_share=${BYPASS_TOKEN}" | jq -r '.status // "✅ OK"' 2>/dev/null || echo "❌ Failed"
echo ""

# Test 2: GET /api/advisors
echo "2️⃣  Testing GET /api/advisors"
curl -s "${BASE_URL}/api/advisors?_vercel_share=${BYPASS_TOKEN}" | jq -r 'if type=="array" then "✅ OK (" + (length|tostring) + " advisors)" else .error // "✅ OK" end' 2>/dev/null || echo "❌ Failed"
echo ""

# Test 3: GET /api/customers
echo "3️⃣  Testing GET /api/customers"
curl -s "${BASE_URL}/api/customers?_vercel_share=${BYPASS_TOKEN}" | jq -r 'if type=="array" then "✅ OK (" + (length|tostring) + " customers)" else .error // "✅ OK" end' 2>/dev/null || echo "❌ Failed"
echo ""

# Test 4: GET /api/documents
echo "4️⃣  Testing GET /api/documents"
curl -s "${BASE_URL}/api/documents?_vercel_share=${BYPASS_TOKEN}" | jq -r 'if type=="array" then "✅ OK (" + (length|tostring) + " documents)" else .error // "✅ OK" end' 2>/dev/null || echo "❌ Failed"
echo ""

# Test 5: GET /api/tasks
echo "5️⃣  Testing GET /api/tasks"
curl -s "${BASE_URL}/api/tasks?_vercel_share=${BYPASS_TOKEN}" | jq -r '.error // if type=="array" then "✅ OK (" + (length|tostring) + " tasks)" else "✅ OK" end' 2>/dev/null || echo "❌ Failed"
echo ""

# Test 6: GET /api/policies
echo "6️⃣  Testing GET /api/policies"
curl -s "${BASE_URL}/api/policies?_vercel_share=${BYPASS_TOKEN}" | jq -r 'if type=="array" then "✅ OK (" + (length|tostring) + " policies)" else .error // "✅ OK" end' 2>/dev/null || echo "❌ Failed"
echo ""

# Test 7: GET /api/claims
echo "7️⃣  Testing GET /api/claims"
curl -s "${BASE_URL}/api/claims?_vercel_share=${BYPASS_TOKEN}" | jq -r 'if type=="array" then "✅ OK (" + (length|tostring) + " claims)" else .error // "✅ OK" end' 2>/dev/null || echo "❌ Failed"
echo ""

# Test 8: GET /api/interactions
echo "8️⃣  Testing GET /api/interactions"
curl -s "${BASE_URL}/api/interactions?_vercel_share=${BYPASS_TOKEN}" | jq -r '.error // if type=="array" then "✅ OK (" + (length|tostring) + " interactions)" else "✅ OK" end' 2>/dev/null || echo "❌ Failed"
echo ""

# Test 9: POST /api/chat
echo "9️⃣  Testing POST /api/chat"
curl -s -X POST "${BASE_URL}/api/chat?_vercel_share=${BYPASS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is LifeCompass?", "sessionId": "test-'$(date +%s)'", "userId": "test-user"}' \
  | jq -r '.message // .error // "✅ OK"' 2>/dev/null | head -100 || echo "❌ Failed"
echo ""

# Test 10: GET /api/advisors/[id]/clients (using first advisor)
echo "🔟 Testing GET /api/advisors/ADV-001/clients"
curl -s "${BASE_URL}/api/advisors/ADV-001/clients?_vercel_share=${BYPASS_TOKEN}" | jq -r 'if type=="array" then "✅ OK (" + (length|tostring) + " clients)" else .error // "✅ OK" end' 2>/dev/null || echo "❌ Failed"
echo ""

# Test 11: GET /api/advisors/[id]/dashboard
echo "1️⃣1️⃣ Testing GET /api/advisors/ADV-001/dashboard"
curl -s "${BASE_URL}/api/advisors/ADV-001/dashboard?_vercel_share=${BYPASS_TOKEN}" | jq -r '.totalClients // .error // "✅ OK"' 2>/dev/null || echo "❌ Failed"
echo ""

echo "✅ API Route Testing Complete!"
