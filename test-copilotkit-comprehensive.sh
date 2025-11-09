#!/bin/bash

# Comprehensive ChatWidget Testing Suite with Error Resolution & Implementation
# Tests the custom ChatWidget streaming endpoint, captures responses, catches errors, uses DeepSeek for resolution

BASE_URL="http://localhost:3000"
ENDPOINT="/api/chat/stream"
DEEPSEEK_API_KEY="${DEEPSEEK_API_KEY:-sk-fba9622dfe0d4ef4b9459444fc4df127}"
DEEPSEEK_BASE_URL="${DEEPSEEK_BASE_URL:-https://api.deepseek.com/v1}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test results storage
TEST_RESULTS_FILE="/tmp/copilotkit_test_results.json"
ERRORS_FILE="/tmp/copilotkit_errors.json"
RESOLUTIONS_FILE="/tmp/copilotkit_resolutions.json"

# Initialize results files
echo "[]" > "$TEST_RESULTS_FILE"
echo "[]" > "$ERRORS_FILE"
echo "[]" > "$RESOLUTIONS_FILE"

echo "=========================================="
echo "Comprehensive ChatWidget Testing Suite"
echo "Testing through: ${BASE_URL}${ENDPOINT}"
echo "Features: Streaming response capture, error detection, DeepSeek resolution"
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

# Get available personas
echo "Fetching available personas..."
CUSTOMER_PERSONAS=$(curl -s "${BASE_URL}/api/customers" | jq -r '.[] | .customerNumber' 2>/dev/null | head -3)
ADVISOR_PERSONAS=$(curl -s "${BASE_URL}/api/advisors" | jq -r '.[] | .advisorNumber' 2>/dev/null | head -2)

# Default personas if API fails
CUSTOMER_PERSONAS=${CUSTOMER_PERSONAS:-$'CUST-001\nCUST-002\nCUST-003'}
ADVISOR_PERSONAS=${ADVISOR_PERSONAS:-$'ADV-001\nADV-002'}

echo "Customer Personas: $(echo "$CUSTOMER_PERSONAS" | tr '\n' ' ')"
echo "Advisor Personas: $(echo "$ADVISOR_PERSONAS" | tr '\n' ' ')"
echo ""

# Function to parse streaming response
parse_stream_response() {
    local stream_data="$1"
    local session_id=""
    local full_content=""
    local metadata_json=""
    local has_error=false
    local error_message=""
    
    # Parse stream lines
    while IFS= read -r line; do
        if [[ "$line" == data:* ]]; then
            local data="${line#data: }"
            
            if [[ "$data" == "[DONE]" ]]; then
                break
            fi
            
            # Try to parse as JSON
            if echo "$data" | jq -e . >/dev/null 2>&1; then
                local type=$(echo "$data" | jq -r '.type // empty' 2>/dev/null)
                
                case "$type" in
                    "session")
                        session_id=$(echo "$data" | jq -r '.sessionId // empty' 2>/dev/null)
                        ;;
                    "content")
                        local content=$(echo "$data" | jq -r '.content // empty' 2>/dev/null)
                        full_content+="$content"
                        ;;
                    "metadata")
                        metadata_json="$data"
                        ;;
                    "state")
                        # State updates - can be used for progress tracking
                        ;;
                    "error")
                        has_error=true
                        error_message=$(echo "$data" | jq -r '.error // .message // "Unknown error"' 2>/dev/null)
                        ;;
                esac
            fi
        fi
    done <<< "$stream_data"
    
    echo "SESSION_ID:$session_id"
    echo "CONTENT:$full_content"
    echo "METADATA:$metadata_json"
    echo "HAS_ERROR:$has_error"
    echo "ERROR:$error_message"
}

# Function to call DeepSeek for error resolution with implementation guidance
resolve_error_with_deepseek() {
    local error_message="$1"
    local test_name="$2"
    local context="$3"
    local response_body="$4"
    
    echo -e "${YELLOW}🤖 Consulting DeepSeek for error resolution...${NC}"
    
    local prompt="You are a senior software engineer debugging a Next.js chat streaming API integration.

Error Details:
- Test: ${test_name}
- Error: ${error_message}
- Context: ${context}
- Response Body (first 500 chars): $(echo "$response_body" | head -c 500)

Please provide:
1. Root cause analysis (what is causing this error?)
2. Specific implementation steps to fix it
3. Code changes needed (if any)
4. Testing steps to verify the fix

Format your response as:
ANALYSIS: [brief analysis]
STEPS: [numbered steps]
CODE: [code changes if needed]
TEST: [how to verify]

Keep it concise and actionable."

    local response=$(curl -s --max-time 30 -X POST "${DEEPSEEK_BASE_URL}/chat/completions" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" \
        -d "{
            \"model\": \"deepseek-chat\",
            \"messages\": [
                {\"role\": \"system\", \"content\": \"You are a helpful software engineering assistant specializing in debugging CopilotKit, Next.js, and API integrations. Provide actionable, implementable solutions.\"},
                {\"role\": \"user\", \"content\": \"${prompt}\"}
            ],
            \"temperature\": 0.7,
            \"max_tokens\": 800
        }")
    
    local resolution=$(echo "$response" | jq -r '.choices[0].message.content // "Failed to get resolution"' 2>/dev/null)
    
    # Store resolution for later implementation
    echo "$resolution" | jq -n --arg test "$test_name" --arg error "$error_message" --arg resolution "$resolution" \
        '{test: $test, error: $error, resolution: $resolution, timestamp: now}' >> "$RESOLUTIONS_FILE"
    
    echo "$resolution"
}

# Function to run a test and capture results
run_test() {
    local test_num=$1
    local test_name="$2"
    local query="$3"
    local metadata="$4"
    local persona_id="${5:-}"
    
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}Test ${test_num}: ${test_name}${NC}"
    if [ -n "$persona_id" ]; then
        echo -e "${CYAN}Persona: ${persona_id}${NC}"
    fi
    echo -e "${BLUE}Query: '${query}'${NC}"
    echo -e "${BLUE}==========================================${NC}"
    
    # Create temporary file for FormData
    local temp_file=$(mktemp)
    
    # Build FormData using curl's -F option (simulates FormData)
    # Note: We need to send as multipart/form-data
    local form_data=""
    form_data+="message=${query}"
    form_data+="&metadata=$(echo "$metadata" | jq -c . 2>/dev/null || echo "$metadata")"
    
    # Run the test with streaming endpoint
    local response=$(curl -s --max-time 60 -X POST "${BASE_URL}${ENDPOINT}" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "$form_data" \
        -w "\nHTTP_STATUS:%{http_code}")
    
    local http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
    local stream_body=$(echo "$response" | sed '/HTTP_STATUS/d')
    
    echo "HTTP Status: $http_status"
    
    # Parse streaming response
    local parsed=$(parse_stream_response "$stream_body")
    local session_id=$(echo "$parsed" | grep "SESSION_ID:" | cut -d: -f2-)
    local content=$(echo "$parsed" | grep "CONTENT:" | cut -d: -f2-)
    local metadata_json=$(echo "$parsed" | grep "METADATA:" | cut -d: -f2-)
    local has_error=$(echo "$parsed" | grep "HAS_ERROR:" | cut -d: -f2-)
    local error_message=$(echo "$parsed" | grep "ERROR:" | cut -d: -f2-)
    
    # Extract sources and tools from metadata if available
    local sources="[]"
    local tools_used="[]"
    if [ -n "$metadata_json" ] && [ "$metadata_json" != "null" ]; then
        sources=$(echo "$metadata_json" | jq -r '.sources // []' 2>/dev/null || echo "[]")
        tools_used=$(echo "$metadata_json" | jq -r '.toolsUsed // []' 2>/dev/null || echo "[]")
    fi
    
    # Determine success
    local success=false
    if [ "$http_status" = "200" ] && [ "$has_error" = "false" ] && [ -n "$content" ]; then
        success=true
    fi
    
    # Store test result
    local result_json=$(jq -n \
        --arg test "$test_name" \
        --arg status "$http_status" \
        --arg query "$query" \
        --arg persona "$persona_id" \
        --arg session "$session_id" \
        --arg content "$content" \
        --argjson sources "$sources" \
        --argjson tools "$tools_used" \
        --argjson success "$success" \
        '{
            test: $test,
            query: $query,
            persona: $persona,
            httpStatus: $status,
            success: ($success == "true"),
            sessionId: $session,
            content: $content,
            sources: $sources,
            toolsUsed: $tools,
            timestamp: now
        }' 2>/dev/null)
    
    echo "$result_json" | jq '.' >> "$TEST_RESULTS_FILE" 2>/dev/null
    
    if [ "$success" = "false" ] || [ "$http_status" != "200" ]; then
        echo -e "${RED}❌ Error detected!${NC}"
        echo "Error details:"
        if [ -n "$error_message" ]; then
            echo "Error: $error_message"
        else
            echo "HTTP Status: $http_status"
            echo "Stream preview (first 500 chars):"
            echo "$stream_body" | head -c 500
        fi
        echo ""
        
        # Store error
        jq -n \
            --arg test "$test_name" \
            --arg status "$http_status" \
            --arg error "$error_message" \
            --arg stream "$(echo "$stream_body" | head -c 1000)" \
            '{test: $test, httpStatus: $status, error: $error, streamPreview: $stream, timestamp: now}' \
            >> "$ERRORS_FILE" 2>/dev/null
        
        # Get error resolution from DeepSeek
        local full_error="$error_message"
        if [ -z "$full_error" ]; then
            full_error="HTTP Status: $http_status"
        fi
        
        local resolution=$(resolve_error_with_deepseek "$full_error" "$test_name" "ChatWidget streaming API endpoint test with persona: ${persona_id}" "$stream_body")
        echo -e "${YELLOW}📋 DeepSeek Resolution:${NC}"
        echo "$resolution"
        echo ""
        echo -e "${CYAN}💡 Resolution stored in: ${RESOLUTIONS_FILE}${NC}"
        echo ""
    else
        echo -e "${GREEN}✅ Test passed!${NC}"
        echo ""
        echo "Session ID: $session_id"
        echo ""
        echo "Tools Used:"
        echo "$tools_used" | jq -r '.[] | if type == "string" then . else (.toolName // .name // .tool // "Unknown") end' 2>/dev/null | head -10 || echo "No tools found"
        echo ""
        echo "Sources:"
        echo "$sources" | jq -r '.[] | if type == "string" then . else (.documentTitle // .documentSource // "Unknown") end' 2>/dev/null | head -5 || echo "No sources found"
        echo ""
        echo "Response Preview (first 300 chars):"
        echo "$content" | head -c 300
        echo ""
        echo ""
        echo "Response Summary:"
        echo "  Content length: $(echo "$content" | wc -c | tr -d ' ') chars"
        echo "  Sources count: $(echo "$sources" | jq 'length' 2>/dev/null || echo "0")"
        echo "  Tools count: $(echo "$tools_used" | jq 'length' 2>/dev/null || echo "0")"
        echo ""
    fi
    
    # Cleanup
    rm -f "$temp_file"
    
    echo "---"
    echo ""
}

# Test with multiple customer personas
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}Testing Customer Personas${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

CUST_COUNT=0
while IFS= read -r persona; do
    [ -z "$persona" ] && continue
    CUST_COUNT=$((CUST_COUNT + 1))
    
    run_test "${CUST_COUNT}" "Policy Query (Customer ${persona})" "What are my policies?" "{\"selectedCustomerPersona\":\"${persona}\",\"userType\":\"customer\"}" "$persona"
    
    CUST_COUNT=$((CUST_COUNT + 1))
    run_test "${CUST_COUNT}" "Claim Query (Customer ${persona})" "Show me my claims" "{\"selectedCustomerPersona\":\"${persona}\",\"userType\":\"customer\"}" "$persona"
    
    CUST_COUNT=$((CUST_COUNT + 1))
    run_test "${CUST_COUNT}" "Profile Query (Customer ${persona})" "What is my profile information?" "{\"selectedCustomerPersona\":\"${persona}\",\"userType\":\"customer\"}" "$persona"
    
    CUST_COUNT=$((CUST_COUNT + 1))
    run_test "${CUST_COUNT}" "Interaction Query (Customer ${persona})" "Show me my interaction history" "{\"selectedCustomerPersona\":\"${persona}\",\"userType\":\"customer\"}" "$persona"
    
    # Add a small delay between tests to avoid overwhelming the server
    sleep 1
done <<< "$CUSTOMER_PERSONAS"

# Test with multiple advisor personas
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}Testing Advisor Personas${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

ADV_COUNT=$((CUST_COUNT + 1))
while IFS= read -r persona; do
    [ -z "$persona" ] && continue
    ADV_COUNT=$((ADV_COUNT + 1))
    
    run_test "${ADV_COUNT}" "Task Query (Advisor ${persona})" "What are my tasks?" "{\"selectedAdvisorPersona\":\"${persona}\",\"userType\":\"advisor\"}" "$persona"
    
    ADV_COUNT=$((ADV_COUNT + 1))
    run_test "${ADV_COUNT}" "Profile Query (Advisor ${persona})" "Show me my advisor profile" "{\"selectedAdvisorPersona\":\"${persona}\",\"userType\":\"advisor\"}" "$persona"
    
    # Add a small delay between tests
    sleep 1
done <<< "$ADVISOR_PERSONAS"

# Test knowledge base queries (no persona)
ADV_COUNT=$((ADV_COUNT + 1))
run_test "${ADV_COUNT}" "Knowledge Base Query (No Persona)" "What is life insurance?" '{}' ""

ADV_COUNT=$((ADV_COUNT + 1))
run_test "${ADV_COUNT}" "Document Query (No Persona)" "Find documents about insurance forms" '{}' ""

ADV_COUNT=$((ADV_COUNT + 1))
run_test "${ADV_COUNT}" "Calculation Query (No Persona)" "Calculate 25 * 4 + 100" '{}' ""

# Test error scenarios
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}Testing Error Scenarios${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

ADV_COUNT=$((ADV_COUNT + 1))
run_test "${ADV_COUNT}" "Invalid Customer Persona" "What are my policies?" '{"selectedCustomerPersona":"INVALID-999","userType":"customer"}' "INVALID-999"

ADV_COUNT=$((ADV_COUNT + 1))
run_test "${ADV_COUNT}" "Invalid Advisor Persona" "What are my tasks?" '{"selectedAdvisorPersona":"INVALID-999","userType":"advisor"}' "INVALID-999"

ADV_COUNT=$((ADV_COUNT + 1))
run_test "${ADV_COUNT}" "Malformed Metadata" "Test query" '{"invalid":"metadata"}' ""

ADV_COUNT=$((ADV_COUNT + 1))
run_test "${ADV_COUNT}" "Empty Query" "" '{"selectedCustomerPersona":"CUST-001","userType":"customer"}' "CUST-001"

# Add delay before summary
sleep 1

# Generate summary report
echo "=========================================="
echo "Testing Complete - Generating Summary"
echo "=========================================="
echo ""

TOTAL_TESTS=$(jq -r 'length' "$TEST_RESULTS_FILE" 2>/dev/null | head -1 || echo "0")
PASSED_TESTS=$(jq -r '[.[] | select(.success == true)] | length' "$TEST_RESULTS_FILE" 2>/dev/null | head -1 || echo "0")
FAILED_TESTS=$(jq -r '[.[] | select(.success == false)] | length' "$TEST_RESULTS_FILE" 2>/dev/null | head -1 || echo "0")
ERROR_COUNT=$(jq -r 'length' "$ERRORS_FILE" 2>/dev/null | head -1 || echo "0")
RESOLUTION_COUNT=$(jq -r 'length' "$RESOLUTIONS_FILE" 2>/dev/null | head -1 || echo "0")

echo -e "${GREEN}Total Tests: ${TOTAL_TESTS}${NC}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
echo -e "${YELLOW}Errors Captured: ${ERROR_COUNT}${NC}"
echo -e "${CYAN}Resolutions Generated: ${RESOLUTION_COUNT}${NC}"
echo ""

if [ "$RESOLUTION_COUNT" -gt 0 ]; then
    echo -e "${CYAN}==========================================${NC}"
    echo -e "${CYAN}DeepSeek Resolutions Summary${NC}"
    echo -e "${CYAN}==========================================${NC}"
    echo ""
    jq -r '.[] | "Test: \(.test)\nError: \(.error)\nResolution:\n\(.resolution)\n---\n"' "$RESOLUTIONS_FILE" 2>/dev/null
    echo ""
    echo -e "${YELLOW}💡 All resolutions stored in: ${RESOLUTIONS_FILE}${NC}"
    echo -e "${YELLOW}💡 Review resolutions and implement fixes as needed${NC}"
    echo ""
fi

echo "=========================================="
echo "Test Results:"
echo "  - Full results: ${TEST_RESULTS_FILE}"
echo "  - Errors: ${ERRORS_FILE}"
echo "  - Resolutions: ${RESOLUTIONS_FILE}"
echo "=========================================="
echo ""

