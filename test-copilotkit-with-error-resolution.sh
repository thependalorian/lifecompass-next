#!/bin/bash

# Enhanced CopilotKit Testing Suite with Error Resolution
# Tests all tools, captures responses, catches errors, and uses DeepSeek for resolution

BASE_URL="http://localhost:3000"
ENDPOINT="/api/chat"
DEEPSEEK_API_KEY="${DEEPSEEK_API_KEY:-sk-fba9622dfe0d4ef4b9459444fc4df127}"
DEEPSEEK_BASE_URL="${DEEPSEEK_BASE_URL:-https://api.deepseek.com/v1}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "CopilotKit Testing Suite with Error Resolution"
echo "Testing through: ${BASE_URL}${ENDPOINT}"
echo "=========================================="
echo ""

# Check if server is running
echo "Checking server status..."
if ! curl -s --max-time 2 "${BASE_URL}" > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Server not running at ${BASE_URL}${NC}"
    echo "Please start the server with: npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running!${NC}"
echo ""

# Function to call DeepSeek for error resolution
resolve_error_with_deepseek() {
    local error_message="$1"
    local test_name="$2"
    local context="$3"
    
    echo -e "${YELLOW}🤖 Consulting DeepSeek for error resolution...${NC}"
    
    local prompt="You are a senior software engineer debugging a CopilotKit integration. 

Error Details:
- Test: ${test_name}
- Error: ${error_message}
- Context: ${context}

Please provide:
1. A brief analysis of what might be causing this error
2. Specific steps to resolve it
3. Code examples if applicable

Keep the response concise and actionable."

    local response=$(curl -s --max-time 30 -X POST "${DEEPSEEK_BASE_URL}/chat/completions" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" \
        -d "{
            \"model\": \"deepseek-chat\",
            \"messages\": [
                {\"role\": \"system\", \"content\": \"You are a helpful software engineering assistant specializing in debugging and error resolution.\"},
                {\"role\": \"user\", \"content\": \"${prompt}\"}
            ],
            \"temperature\": 0.7,
            \"max_tokens\": 500
        }")
    
    echo "$response" | jq -r '.choices[0].message.content // "Failed to get resolution"' 2>/dev/null
}

# Function to run a test and capture results
run_test() {
    local test_num=$1
    local test_name="$2"
    local query="$3"
    local metadata="$4"
    
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}Test ${test_num}: ${test_name}${NC}"
    echo -e "${BLUE}Query: '${query}'${NC}"
    echo -e "${BLUE}==========================================${NC}"
    
    # Run the test
    local response=$(curl -s --max-time 30 -X POST "${BASE_URL}${ENDPOINT}" \
        -H "Content-Type: application/json" \
        -d "{
            \"message\": \"${query}\",
            \"metadata\": ${metadata}
        }" -w "\nHTTP_STATUS:%{http_code}")
    
    local http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
    local body=$(echo "$response" | sed '/HTTP_STATUS/d')
    
    echo "HTTP Status: $http_status"
    
    # Check for errors (only treat as error if HTTP status is not 200 or if there's an explicit error field)
    local error=$(echo "$body" | jq -r '.error // empty' 2>/dev/null)
    local has_error_field=$(echo "$body" | jq -r 'has("error")' 2>/dev/null)
    
    if [ "$http_status" != "200" ] || ([ "$has_error_field" = "true" ] && [ -n "$error" ]); then
        echo -e "${RED}❌ Error detected!${NC}"
        echo "Error details:"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        echo ""
        
        # Get error resolution from DeepSeek
        local full_error="$error"
        if [ -z "$full_error" ]; then
            full_error="HTTP Status: $http_status - Response: $(echo "$body" | head -c 200)"
        fi
        
        local resolution=$(resolve_error_with_deepseek "$full_error" "$test_name" "CopilotKit API endpoint test")
        echo -e "${YELLOW}📋 DeepSeek Resolution Suggestion:${NC}"
        echo "$resolution"
        echo ""
    else
        echo -e "${GREEN}✅ Test passed!${NC}"
        echo ""
        echo "Tools Used:"
        echo "$body" | jq -r '.toolsUsed[]?.toolName // "No tools found"' 2>/dev/null | head -10
        echo ""
        echo "Response Preview (first 300 chars):"
        echo "$body" | jq -r '.response // .message // .content // "No response content"' 2>/dev/null | head -c 300
        echo ""
        echo ""
        echo "Full Response (JSON):"
        echo "$body" | jq '.' 2>/dev/null | head -50
        echo ""
    fi
    
    echo "---"
    echo ""
}

# Run all tests
run_test 1 "Policy Query (Customer)" "What are my policies?" '{"selectedCustomerPersona":"CUST-001","userType":"customer"}'

run_test 2 "Claim Query (Customer)" "Show me my claims" '{"selectedCustomerPersona":"CUST-001","userType":"customer"}'

run_test 3 "Profile Query (Customer)" "What is my profile information?" '{"selectedCustomerPersona":"CUST-001","userType":"customer"}'

run_test 4 "Document Query" "Find documents about insurance forms" '{"selectedCustomerPersona":"CUST-001","userType":"customer"}'

run_test 5 "Interaction Query" "Show me my interaction history" '{"selectedCustomerPersona":"CUST-001","userType":"customer"}'

run_test 6 "Calculation Query" "Calculate 25 * 4 + 100" '{"selectedCustomerPersona":"CUST-001","userType":"customer"}'

run_test 7 "Task Query (Advisor)" "What are my tasks?" '{"selectedAdvisorPersona":"ADV-001","userType":"advisor"}'

run_test 8 "Advisor Profile Query" "Show me my advisor profile" '{"selectedAdvisorPersona":"ADV-001","userType":"advisor"}'

run_test 9 "Knowledge Base Query" "What is life insurance?" '{}'

run_test 10 "Hybrid Query" "Tell me about my policies and find information about claims process" '{"selectedCustomerPersona":"CUST-001","userType":"customer"}'

# Test error scenarios
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}Testing Error Scenarios${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

run_test 11 "Invalid Persona" "What are my policies?" '{"selectedCustomerPersona":"INVALID-999","userType":"customer"}'

run_test 12 "Malformed Request" "Test query" '{"invalid":"metadata"}'

run_test 13 "Empty Query" "" '{"selectedCustomerPersona":"CUST-001","userType":"customer"}'

echo "=========================================="
echo "Testing Complete"
echo "=========================================="
echo ""
echo "Summary:"
echo "- All tests executed"
echo "- Errors captured and analyzed"
echo "- DeepSeek resolutions provided for any errors"
echo ""

