#!/bin/bash

# Comprehensive Tool Testing Suite
# Tests all tools through /api/chat endpoint (uses same tools as CopilotKit)
# This endpoint uses the same intelligent tool selection as CopilotKit

BASE_URL="http://localhost:3000"
ENDPOINT="/api/chat"

echo "=========================================="
echo "CopilotKit Tools Testing Suite"
echo "Testing through: ${BASE_URL}${ENDPOINT}"
echo "Note: Uses same tools and intelligence as CopilotKit"
echo "=========================================="
echo ""

# Check if server is running
echo "Checking server status..."
if ! curl -s --max-time 2 "${BASE_URL}" > /dev/null 2>&1; then
    echo "ERROR: Server not running at ${BASE_URL}"
    echo "Please start the server with: npm run dev"
    exit 1
fi
echo "✅ Server is running!"
echo ""

# Test 1: Policy Query (Customer)
echo "=========================================="
echo "Test 1: Policy Query (Customer Persona)"
echo "Query: 'What are my policies?'"
echo "Expected Tools: get_customer_policies, hybrid_search, graph_search"
echo "=========================================="
RESPONSE=$(curl -s --max-time 30 -X POST "${BASE_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are my policies?",
    "metadata": {
      "selectedCustomerPersona": "CUST-001",
      "userType": "customer"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Tools Used:"
echo "$BODY" | jq -r '.toolsUsed[]?.toolName // "No tools found"' 2>/dev/null | head -10
echo ""
echo "---"
echo ""

# Test 2: Claim Query (Customer)
echo "=========================================="
echo "Test 2: Claim Query (Customer Persona)"
echo "Query: 'Show me my claims'"
echo "Expected Tools: get_customer_claims, hybrid_search, graph_search"
echo "=========================================="
RESPONSE=$(curl -s --max-time 30 -X POST "${BASE_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me my claims",
    "metadata": {
      "selectedCustomerPersona": "CUST-001",
      "userType": "customer"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Tools Used:"
echo "$BODY" | jq -r '.toolsUsed[]?.toolName // "No tools found"' 2>/dev/null | head -10
echo ""
echo "---"
echo ""

# Test 3: Profile Query (Customer)
echo "=========================================="
echo "Test 3: Profile Query (Customer Persona)"
echo "Query: 'What is my profile information?'"
echo "Expected Tools: get_customer_profile, hybrid_search, graph_search"
echo "=========================================="
RESPONSE=$(curl -s --max-time 30 -X POST "${BASE_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is my profile information?",
    "metadata": {
      "selectedCustomerPersona": "CUST-001",
      "userType": "customer"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Tools Used:"
echo "$BODY" | jq -r '.toolsUsed[]?.toolName // "No tools found"' 2>/dev/null | head -10
echo ""
echo "---"
echo ""

# Test 4: Document Query (Customer)
echo "=========================================="
echo "Test 4: Document Query (Customer Persona)"
echo "Query: 'Find documents about insurance forms'"
echo "Expected Tools: search_documents, hybrid_search, graph_search"
echo "=========================================="
RESPONSE=$(curl -s --max-time 30 -X POST "${BASE_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Find documents about insurance forms",
    "metadata": {
      "selectedCustomerPersona": "CUST-001",
      "userType": "customer"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Tools Used:"
echo "$BODY" | jq -r '.toolsUsed[]?.toolName // "No tools found"' 2>/dev/null | head -10
echo ""
echo "---"
echo ""

# Test 5: Interaction Query (Customer)
echo "=========================================="
echo "Test 5: Interaction Query (Customer Persona)"
echo "Query: 'Show me my interaction history'"
echo "Expected Tools: get_customer_interactions, hybrid_search, graph_search"
echo "=========================================="
RESPONSE=$(curl -s --max-time 30 -X POST "${BASE_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me my interaction history",
    "metadata": {
      "selectedCustomerPersona": "CUST-001",
      "userType": "customer"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Tools Used:"
echo "$BODY" | jq -r '.toolsUsed[]?.toolName // "No tools found"' 2>/dev/null | head -10
echo ""
echo "---"
echo ""

# Test 6: Calculation Query (Customer)
echo "=========================================="
echo "Test 6: Calculation Query (Customer Persona)"
echo "Query: 'Calculate 25 * 4 + 100'"
echo "Expected Tools: calculator"
echo "=========================================="
RESPONSE=$(curl -s --max-time 30 -X POST "${BASE_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Calculate 25 * 4 + 100",
    "metadata": {
      "selectedCustomerPersona": "CUST-001",
      "userType": "customer"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Tools Used:"
echo "$BODY" | jq -r '.toolsUsed[]?.toolName // "No tools found"' 2>/dev/null | head -10
echo ""
echo "---"
echo ""

# Test 7: Task Query (Advisor)
echo "=========================================="
echo "Test 7: Task Query (Advisor Persona)"
echo "Query: 'What are my tasks?'"
echo "Expected Tools: get_advisor_tasks, hybrid_search, graph_search"
echo "=========================================="
RESPONSE=$(curl -s --max-time 30 -X POST "${BASE_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are my tasks?",
    "metadata": {
      "selectedAdvisorPersona": "ADV-001",
      "userType": "advisor"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Tools Used:"
echo "$BODY" | jq -r '.toolsUsed[]?.toolName // "No tools found"' 2>/dev/null | head -10
echo ""
echo "---"
echo ""

# Test 8: Profile Query (Advisor)
echo "=========================================="
echo "Test 8: Profile Query (Advisor Persona)"
echo "Query: 'Show me my advisor profile'"
echo "Expected Tools: get_advisor_profile, hybrid_search, graph_search"
echo "=========================================="
RESPONSE=$(curl -s --max-time 30 -X POST "${BASE_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me my advisor profile",
    "metadata": {
      "selectedAdvisorPersona": "ADV-001",
      "userType": "advisor"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Tools Used:"
echo "$BODY" | jq -r '.toolsUsed[]?.toolName // "No tools found"' 2>/dev/null | head -10
echo ""
echo "---"
echo ""

# Test 9: Knowledge Base Query (No Persona)
echo "=========================================="
echo "Test 9: Knowledge Base Query (No Persona)"
echo "Query: 'What is life insurance?'"
echo "Expected Tools: hybrid_search, graph_search"
echo "=========================================="
RESPONSE=$(curl -s --max-time 30 -X POST "${BASE_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is life insurance?"
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Tools Used:"
echo "$BODY" | jq -r '.toolsUsed[]?.toolName // "No tools found"' 2>/dev/null | head -10
echo ""
echo "---"
echo ""

# Test 10: Hybrid Query (Customer)
echo "=========================================="
echo "Test 10: Hybrid Query (Customer Persona)"
echo "Query: 'Tell me about my policies and find information about claims process'"
echo "Expected Tools: get_customer_policies, hybrid_search, graph_search"
echo "=========================================="
RESPONSE=$(curl -s --max-time 30 -X POST "${BASE_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about my policies and find information about claims process",
    "metadata": {
      "selectedCustomerPersona": "CUST-001",
      "userType": "customer"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Tools Used:"
echo "$BODY" | jq -r '.toolsUsed[]?.toolName // "No tools found"' 2>/dev/null | head -10
echo ""
echo "=========================================="
echo "Testing Complete"
echo "=========================================="
echo ""
echo "Summary: All tests completed through /api/chat endpoint"
echo "This endpoint uses the same tools and intelligence as CopilotKit"
echo ""

