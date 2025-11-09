#!/bin/bash

# Comprehensive ChatWidget Testing Suite with Error Resolution & Implementation
# Tests the custom ChatWidget streaming endpoint, captures responses, catches errors, uses DeepSeek for resolution
# REQUIRES: Database connection (DATABASE_URL must be configured)

BASE_URL="http://localhost:3000"
ENDPOINT="/api/chat/stream"
DEEPSEEK_API_KEY="${DEEPSEEK_API_KEY:-sk-fba9622dfe0d4ef4b9459444fc4df127}"
DEEPSEEK_BASE_URL="${DEEPSEEK_BASE_URL:-https://api.deepseek.com/v1}"

# Database check flag
REQUIRE_DATABASE=true

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
echo "Database Required: ${REQUIRE_DATABASE}"
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

# Check database connectivity by testing a simple API call
if [ "$REQUIRE_DATABASE" = "true" ]; then
    echo "Checking database connectivity..."
    echo -e "${CYAN}This test requires a real database connection (not demo mode)${NC}"
    echo ""
    
    DB_TEST_RESPONSE=$(curl -s --max-time 10 -X POST "${BASE_URL}${ENDPOINT}" \
        -F "message=test" \
        -F "metadata={\"selectedCustomerPersona\":\"CUST-001\",\"userType\":\"customer\"}" \
        2>&1 | head -30)
    
    # Check if response contains demo mode indicator
    if echo "$DB_TEST_RESPONSE" | grep -qi "Demo streaming response\|DATABASE_URL environment variable\|demo-session"; then
        echo -e "${RED}❌ ERROR: Database not configured!${NC}"
        echo ""
        echo "The API is running in demo mode. Tests require a real database connection."
        echo ""
        echo "Please ensure:"
        echo "  1. DATABASE_URL is set in your .env file"
        echo "     Example: DATABASE_URL=postgresql://user:pass@host:5432/dbname"
        echo ""
        echo "  2. Database is accessible and migrations are run"
        echo "     Check connection: psql \$DATABASE_URL"
        echo ""
        echo "  3. Server is restarted after setting DATABASE_URL"
        echo "     Restart: npm run dev"
        echo ""
        echo "Quick test: Run './scripts/test-db-connection.sh' to verify database setup"
        echo ""
        exit 1
    fi
    
    # Check if we got a valid streaming response with session ID (indicates real DB)
    if echo "$DB_TEST_RESPONSE" | grep -q "data:"; then
        # Check for sessionId in the stream (might be in session event or metadata event)
        if echo "$DB_TEST_RESPONSE" | grep -q "sessionId\|session"; then
            echo -e "${GREEN}✅ Database connectivity confirmed!${NC}"
            echo -e "${GREEN}✅ Session management working (database-backed)${NC}"
            echo ""
        else
            echo -e "${YELLOW}⚠️  Warning: Got streaming response but no sessionId detected${NC}"
            echo "This might indicate database issues. Proceeding with caution..."
            echo ""
        fi
    else
        echo -e "${RED}❌ ERROR: Invalid response format${NC}"
        echo "Response preview:"
        echo "$DB_TEST_RESPONSE" | head -20
        echo ""
        echo "Checking if this is a demo mode response..."
        if echo "$DB_TEST_RESPONSE" | grep -qi "Demo\|demo-session"; then
            echo -e "${RED}❌ Database not configured - API is in demo mode${NC}"
            exit 1
        fi
        echo "Response might be valid but in unexpected format. Proceeding with caution..."
        echo ""
    fi
fi

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

# Test counters (using file-based approach for compatibility across subshells)
TEST_COUNT_FILE="/tmp/chatwidget_test_count.txt"
PASSED_COUNT_FILE="/tmp/chatwidget_passed_count.txt"
FAILED_COUNT_FILE="/tmp/chatwidget_failed_count.txt"

# Initialize counters
echo "0" > "$TEST_COUNT_FILE"
echo "0" > "$PASSED_COUNT_FILE"
echo "0" > "$FAILED_COUNT_FILE"

# Helper functions for counter management
increment_test_count() {
    local current=$(cat "$TEST_COUNT_FILE" 2>/dev/null || echo "0")
    echo $((current + 1)) > "$TEST_COUNT_FILE"
}

increment_passed_count() {
    local current=$(cat "$PASSED_COUNT_FILE" 2>/dev/null || echo "0")
    echo $((current + 1)) > "$PASSED_COUNT_FILE"
}

increment_failed_count() {
    local current=$(cat "$FAILED_COUNT_FILE" 2>/dev/null || echo "0")
    echo $((current + 1)) > "$FAILED_COUNT_FILE"
}

get_test_count() {
    cat "$TEST_COUNT_FILE" 2>/dev/null || echo "0"
}

get_passed_count() {
    cat "$PASSED_COUNT_FILE" 2>/dev/null || echo "0"
}

get_failed_count() {
    cat "$FAILED_COUNT_FILE" 2>/dev/null || echo "0"
}

# Session ID storage (simulating frontend sessionStorage)
# Using a simple file-based approach for compatibility
SESSION_STORAGE_DIR="/tmp/chatwidget_test_sessions"
mkdir -p "$SESSION_STORAGE_DIR"

# Function to get or create session ID for persona (matching frontend behavior)
get_session_id_for_persona() {
    local persona_id="$1"
    if [ -z "$persona_id" ]; then
        echo ""
        return
    fi
    
    # Check if we have a stored session ID for this persona
    local session_file="${SESSION_STORAGE_DIR}/${persona_id}.session"
    if [ -f "$session_file" ]; then
        cat "$session_file" 2>/dev/null || echo ""
    else
        echo ""
    fi
}

# Function to store session ID for persona (matching frontend behavior)
store_session_id_for_persona() {
    local persona_id="$1"
    local session_id="$2"
    if [ -n "$persona_id" ] && [ -n "$session_id" ]; then
        local session_file="${SESSION_STORAGE_DIR}/${persona_id}.session"
        echo "$session_id" > "$session_file"
    fi
}

# Function to clear session for persona (matching frontend behavior)
clear_session_for_persona() {
    local persona_id="$1"
    if [ -n "$persona_id" ]; then
        local session_file="${SESSION_STORAGE_DIR}/${persona_id}.session"
        rm -f "$session_file"
    fi
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
    
    # Get existing session ID for this persona (matching frontend behavior)
    local existing_session_id=$(get_session_id_for_persona "$persona_id")
    
    # Prepare metadata JSON string (matching frontend ChatWidget.tsx format)
    # Frontend includes: sessionId, selectedCustomerPersona, selectedAdvisorPersona, userType
    local metadata_obj=$(echo "$metadata" | jq -c . 2>/dev/null || echo "$metadata")
    
    # Add sessionId to metadata if we have one (matching frontend behavior)
    if [ -n "$existing_session_id" ]; then
        metadata_obj=$(echo "$metadata_obj" | jq -c --arg sid "$existing_session_id" '. + {sessionId: $sid}' 2>/dev/null || echo "$metadata_obj")
    else
        # Frontend sends empty string if no sessionId yet
        metadata_obj=$(echo "$metadata_obj" | jq -c '. + {sessionId: ""}' 2>/dev/null || echo "$metadata_obj")
    fi
    
    local request_metadata="$metadata_obj"
    
    # Run the test with streaming endpoint using multipart/form-data (as ChatWidget does)
    # Use curl's -F option to send multipart/form-data
    # Metadata is sent as a string, not a file (matching ChatWidget.tsx behavior)
    local response=$(curl -s --max-time 60 -X POST "${BASE_URL}${ENDPOINT}" \
        -F "message=${query}" \
        -F "metadata=${request_metadata}" \
        -w "\nHTTP_STATUS:%{http_code}")
    
    local http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
    local stream_body=$(echo "$response" | sed '/HTTP_STATUS/d')
    
    echo "HTTP Status: $http_status"
    
    # Parse streaming response
    local parsed=$(parse_stream_response "$stream_body")
    local session_id=$(echo "$parsed" | grep "SESSION_ID:" | cut -d: -f2-)
    local content=$(echo "$parsed" | grep "CONTENT:" | cut -d: -f2-)
    local response_metadata=$(echo "$parsed" | grep "METADATA:" | cut -d: -f2-)
    local has_error=$(echo "$parsed" | grep "HAS_ERROR:" | cut -d: -f2-)
    local error_message=$(echo "$parsed" | grep "ERROR:" | cut -d: -f2-)
    
    # Store session ID for this persona (matching frontend sessionStorage behavior)
    if [ -n "$session_id" ] && [ -n "$persona_id" ]; then
        store_session_id_for_persona "$persona_id" "$session_id"
    fi
    
    # Extract sources and tools from metadata if available
    local sources="[]"
    local tools_used="[]"
    if [ -n "$response_metadata" ] && [ "$response_metadata" != "null" ]; then
        sources=$(echo "$response_metadata" | jq -r '.sources // []' 2>/dev/null || echo "[]")
        tools_used=$(echo "$response_metadata" | jq -r '.toolsUsed // []' 2>/dev/null || echo "[]")
    fi
    
    # Increment test count
    increment_test_count
    
    # Determine success
    # Success if: HTTP 200, no errors, and we got some response (content or metadata)
    local success=false
    if [ "$http_status" = "200" ] && [ "$has_error" = "false" ]; then
        # Consider successful if we got content OR metadata (even if content is empty initially)
        if [ -n "$content" ] || [ -n "$response_metadata" ]; then
            success=true
            increment_passed_count
        else
            increment_failed_count
        fi
    else
        increment_failed_count
    fi
    
    # Store test result
    # Read existing results, append new result, write back
    local existing_results=$(cat "$TEST_RESULTS_FILE" 2>/dev/null || echo "[]")
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
    
    # Append to existing results array
    # Use a temp file to avoid race conditions
    local temp_file="${TEST_RESULTS_FILE}.tmp"
    if echo "$existing_results" | jq --argjson new "$result_json" '. + [$new]' > "$temp_file" 2>/dev/null; then
        mv "$temp_file" "$TEST_RESULTS_FILE"
    else
        # Fallback: append as newline-delimited JSON if jq fails
        echo "$result_json" >> "$TEST_RESULTS_FILE"
    fi
    
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
    
    # Clear session for new persona (matching frontend behavior when switching personas)
    clear_session_for_persona "$persona"
    
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
    
    # Clear session for new persona (matching frontend behavior when switching personas)
    clear_session_for_persona "$persona"
    
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

# Get counts from counter files (more reliable than parsing JSON)
TOTAL_TESTS=$(get_test_count)
PASSED_TESTS=$(get_passed_count)
FAILED_TESTS=$(get_failed_count)

# Also get counts from JSON file for verification
JSON_TOTAL=$(jq -r 'length' "$TEST_RESULTS_FILE" 2>/dev/null || echo "0")
JSON_PASSED=$(jq -r '[.[] | select(.success == true)] | length' "$TEST_RESULTS_FILE" 2>/dev/null || echo "0")
JSON_FAILED=$(jq -r '[.[] | select(.success == false)] | length' "$TEST_RESULTS_FILE" 2>/dev/null || echo "0")
ERROR_COUNT=$(jq -r 'length' "$ERRORS_FILE" 2>/dev/null || echo "0")
RESOLUTION_COUNT=$(jq -r 'length' "$RESOLUTIONS_FILE" 2>/dev/null || echo "0")

echo -e "${CYAN}Test Execution Summary:${NC}"
echo -e "${GREEN}Total Tests Run: ${TOTAL_TESTS}${NC}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
if [ "$FAILED_TESTS" -gt 0 ]; then
    echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
else
    echo -e "${GREEN}Failed: ${FAILED_TESTS}${NC}"
fi
echo ""

echo -e "${CYAN}Results File Summary:${NC}"
echo -e "Results in JSON file: ${JSON_TOTAL}"
echo -e "Passed in JSON: ${JSON_PASSED}"
echo -e "Failed in JSON: ${JSON_FAILED}"
echo ""

echo -e "${CYAN}Error Tracking:${NC}"
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

