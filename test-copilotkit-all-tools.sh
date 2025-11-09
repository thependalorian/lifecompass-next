#!/bin/bash

# Comprehensive CopilotKit Tool Testing Suite
# Tests all tools through /api/copilotkit endpoint
# Usage: ./test-copilotkit-all-tools.sh

BASE_URL="http://localhost:3000"
ENDPOINT="/api/copilotkit"

echo "=========================================="
echo "CopilotKit Tool Testing Suite"
echo "Testing through: ${BASE_URL}${ENDPOINT}"
echo "=========================================="
echo ""

# Check if server is running
echo "Checking server status..."
if ! curl -s --max-time 2 "${BASE_URL}" > /dev/null 2>&1; then
    echo "ERROR: Server not running at ${BASE_URL}"
    echo "Please start the server with: npm run dev"
    exit 1
fi
echo "Server is running!"
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
    "messages": [
      {
        "role": "user",
        "content": "What are my policies?"
      }
    ],
    "properties": {
      "selectedCustomerPersona": "CUST-001",
      "userType": "customer"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response (first 500 chars):"
echo "$BODY" | head -c 500
echo ""
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
    "messages": [
      {
        "role": "user",
        "content": "Show me my claims"
      }
    ],
    "properties": {
      "selectedCustomerPersona": "CUST-001",
      "userType": "customer"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response (first 500 chars):"
echo "$BODY" | head -c 500
echo ""
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
    "messages": [
      {
        "role": "user",
        "content": "What is my profile information?"
      }
    ],
    "properties": {
      "selectedCustomerPersona": "CUST-001",
      "userType": "customer"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response (first 500 chars):"
echo "$BODY" | head -c 500
echo ""
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
    "messages": [
      {
        "role": "user",
        "content": "Find documents about insurance forms"
      }
    ],
    "properties": {
      "selectedCustomerPersona": "CUST-001",
      "userType": "customer"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response (first 500 chars):"
echo "$BODY" | head -c 500
echo ""
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
    "messages": [
      {
        "role": "user",
        "content": "Show me my interaction history"
      }
    ],
    "properties": {
      "selectedCustomerPersona": "CUST-001",
      "userType": "customer"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response (first 500 chars):"
echo "$BODY" | head -c 500
echo ""
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
    "messages": [
      {
        "role": "user",
        "content": "Calculate 25 * 4 + 100"
      }
    ],
    "properties": {
      "selectedCustomerPersona": "CUST-001",
      "userType": "customer"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response (first 500 chars):"
echo "$BODY" | head -c 500
echo ""
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
    "messages": [
      {
        "role": "user",
        "content": "What are my tasks?"
      }
    ],
    "properties": {
      "selectedAdvisorPersona": "ADV-001",
      "userType": "advisor"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response (first 500 chars):"
echo "$BODY" | head -c 500
echo ""
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
    "messages": [
      {
        "role": "user",
        "content": "Show me my advisor profile"
      }
    ],
    "properties": {
      "selectedAdvisorPersona": "ADV-001",
      "userType": "advisor"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response (first 500 chars):"
echo "$BODY" | head -c 500
echo ""
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
    "messages": [
      {
        "role": "user",
        "content": "What is life insurance?"
      }
    ],
    "properties": {}
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response (first 500 chars):"
echo "$BODY" | head -c 500
echo ""
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
    "messages": [
      {
        "role": "user",
        "content": "Tell me about my policies and find information about claims process"
      }
    ],
    "properties": {
      "selectedCustomerPersona": "CUST-001",
      "userType": "customer"
    }
  }' -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response (first 500 chars):"
echo "$BODY" | head -c 500
echo ""
echo ""
echo "=========================================="
echo "Testing Complete"
echo "=========================================="
echo ""
echo "Note: CopilotKit uses GraphQL/streaming responses."
echo "Check server logs for detailed tool execution logs."
echo ""
