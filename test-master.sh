#!/bin/bash

# ============================================================================
# LifeCompass Master Testing Suite
# ============================================================================
# Comprehensive testing for ChatWidget streaming API endpoint
# Features:
#   - Database connectivity validation
#   - Session management (matching frontend behavior)
#   - Tests all 10 customer personas and 5 advisor personas
#   - Streaming response capture and parsing
#   - Error detection and DeepSeek resolution
#   - Comprehensive test result tracking
#   - Multiple test scenarios (policies, claims, profiles, tasks, etc.)
# ============================================================================

BASE_URL="${BASE_URL:-http://localhost:3000}"
ENDPOINT="/api/chat/stream"
DEEPSEEK_API_KEY="${DEEPSEEK_API_KEY:-sk-fba9622dfe0d4ef4b9459444fc4df127}"
DEEPSEEK_BASE_URL="${DEEPSEEK_BASE_URL:-https://api.deepseek.com/v1}"

# Configuration
REQUIRE_DATABASE=true
TEST_TIMEOUT=60
MAX_CUSTOMER_PERSONAS=10
MAX_ADVISOR_PERSONAS=5

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Test results storage
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEST_RESULTS_FILE="/tmp/lifecompass_test_results_${TIMESTAMP}.json"
ERRORS_FILE="/tmp/lifecompass_errors_${TIMESTAMP}.json"
RESOLUTIONS_FILE="/tmp/lifecompass_resolutions_${TIMESTAMP}.json"
SUMMARY_FILE="/tmp/lifecompass_summary_${TIMESTAMP}.txt"

# Initialize results files
echo "[]" > "$TEST_RESULTS_FILE"
echo "[]" > "$ERRORS_FILE"
echo "[]" > "$RESOLUTIONS_FILE"
echo "" > "$SUMMARY_FILE"

# Print header
echo -e "${CYAN}============================================================================${NC}"
echo -e "${CYAN}LifeCompass Master Testing Suite${NC}"
echo -e "${CYAN}============================================================================${NC}"
echo -e "Testing Endpoint: ${BASE_URL}${ENDPOINT}"
echo -e "Database Required: ${REQUIRE_DATABASE}"
echo -e "Customer Personas: ${MAX_CUSTOMER_PERSONAS}"
echo -e "Advisor Personas: ${MAX_ADVISOR_PERSONAS}"
echo -e "${CYAN}============================================================================${NC}"
echo ""

# ============================================================================
# Helper Functions
# ============================================================================

# Test counters (file-based for compatibility)
TEST_COUNT_FILE="/tmp/lifecompass_test_count.txt"
PASSED_COUNT_FILE="/tmp/lifecompass_passed_count.txt"
FAILED_COUNT_FILE="/tmp/lifecompass_failed_count.txt"

echo "0" > "$TEST_COUNT_FILE"
echo "0" > "$PASSED_COUNT_FILE"
echo "0" > "$FAILED_COUNT_FILE"

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

# Session management (matching frontend behavior)
SESSION_STORAGE_DIR="/tmp/lifecompass_test_sessions"
mkdir -p "$SESSION_STORAGE_DIR"

get_session_id_for_persona() {
    local persona_id="$1"
    if [ -z "$persona_id" ]; then
        echo ""
        return
    fi
    local session_file="${SESSION_STORAGE_DIR}/${persona_id}.session"
    if [ -f "$session_file" ]; then
        cat "$session_file" 2>/dev/null || echo ""
    else
        echo ""
    fi
}

store_session_id_for_persona() {
    local persona_id="$1"
    local session_id="$2"
    if [ -n "$persona_id" ] && [ -n "$session_id" ]; then
        local session_file="${SESSION_STORAGE_DIR}/${persona_id}.session"
        echo "$session_id" > "$session_file"
    fi
}

clear_session_for_persona() {
    local persona_id="$1"
    if [ -n "$persona_id" ]; then
        local session_file="${SESSION_STORAGE_DIR}/${persona_id}.session"
        rm -f "$session_file"
    fi
}

# Parse streaming response
parse_stream_response() {
    local stream_data="$1"
    local session_id=""
    local full_content=""
    local metadata_json=""
    local has_error=false
    local error_message=""
    
    while IFS= read -r line; do
        if [[ "$line" == data:* ]]; then
            local data="${line#data: }"
            
            if [[ "$data" == "[DONE]" ]]; then
                break
            fi
            
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
                        # State updates for progress tracking
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

# DeepSeek error resolution
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
                {\"role\": \"system\", \"content\": \"You are a helpful software engineering assistant specializing in debugging Next.js, streaming APIs, and database integrations. Provide actionable, implementable solutions.\"},
                {\"role\": \"user\", \"content\": \"${prompt}\"}
            ],
            \"temperature\": 0.7,
            \"max_tokens\": 800
        }")
    
    local resolution=$(echo "$response" | jq -r '.choices[0].message.content // "Failed to get resolution"' 2>/dev/null)
    
    # Store resolution
    echo "$resolution" | jq -n --arg test "$test_name" --arg error "$error_message" --arg resolution "$resolution" \
        '{test: $test, error: $error, resolution: $resolution, timestamp: now}' >> "$RESOLUTIONS_FILE"
    
    echo "$resolution"
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

echo -e "${BLUE}Checking server status...${NC}"
if ! curl -s --max-time 2 "${BASE_URL}" > /dev/null 2>&1; then
    echo -e "${RED}❌ ERROR: Server not running at ${BASE_URL}${NC}"
    echo "Please start the server with: npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running!${NC}"
echo ""

# Database connectivity check
if [ "$REQUIRE_DATABASE" = "true" ]; then
    echo -e "${BLUE}Checking database connectivity...${NC}"
    echo -e "${CYAN}This test requires a real database connection (not demo mode)${NC}"
    echo ""
    
    # Test with a longer timeout and capture more lines
    DB_TEST_RESPONSE=$(curl -s -N --max-time 15 -X POST "${BASE_URL}${ENDPOINT}" \
        -F "message=test" \
        -F "metadata={\"selectedCustomerPersona\":\"CUST-001\",\"userType\":\"customer\"}" \
        2>&1 | head -50)
    
    if echo "$DB_TEST_RESPONSE" | grep -qi "Demo streaming response\|DATABASE_URL environment variable\|demo-session"; then
        echo -e "${RED}❌ ERROR: Database not configured!${NC}"
        echo ""
        echo "The API is running in demo mode. Tests require a real database connection."
        echo ""
        echo "Please ensure:"
        echo "  1. DATABASE_URL is set in your .env file"
        echo "  2. Database is accessible and migrations are run"
        echo "  3. Server is restarted after setting DATABASE_URL"
        echo ""
        exit 1
    fi
    
    # Check for streaming response format (data: lines)
    if echo "$DB_TEST_RESPONSE" | grep -q "data:"; then
        if echo "$DB_TEST_RESPONSE" | grep -q "sessionId\|session"; then
            echo -e "${GREEN}✅ Database connectivity confirmed!${NC}"
            echo -e "${GREEN}✅ Session management working (database-backed)${NC}"
            echo ""
        else
            echo -e "${YELLOW}⚠️  Warning: Got streaming response but no sessionId detected${NC}"
            echo "Proceeding with caution..."
            echo ""
        fi
    elif [ -z "$DB_TEST_RESPONSE" ]; then
        echo -e "${YELLOW}⚠️  Warning: Empty response (stream may be slow to start)${NC}"
        echo "Proceeding with tests (streaming may work during actual tests)..."
        echo ""
    else
        # Check if it's an error response
        if echo "$DB_TEST_RESPONSE" | grep -qi "error\|failed\|500\|400"; then
            echo -e "${RED}❌ ERROR: API returned an error${NC}"
            echo "Response: $DB_TEST_RESPONSE"
            echo ""
            exit 1
        else
            echo -e "${YELLOW}⚠️  Warning: Unexpected response format${NC}"
            echo "Response preview: $(echo "$DB_TEST_RESPONSE" | head -5)"
            echo "Proceeding with tests..."
            echo ""
        fi
    fi
fi

# Fetch available personas
echo -e "${BLUE}Fetching available personas...${NC}"
CUSTOMER_PERSONAS=$(curl -s "${BASE_URL}/api/customers" | jq -r '.[] | .customerNumber' 2>/dev/null | head -${MAX_CUSTOMER_PERSONAS})
ADVISOR_PERSONAS=$(curl -s "${BASE_URL}/api/advisors" | jq -r '.[] | .advisorNumber' 2>/dev/null | head -${MAX_ADVISOR_PERSONAS})

# Default personas if API fails
CUSTOMER_PERSONAS=${CUSTOMER_PERSONAS:-$'CUST-001\nCUST-002\nCUST-003\nCUST-004\nCUST-005\nCUST-006\nCUST-007\nCUST-008\nCUST-009\nCUST-010'}
ADVISOR_PERSONAS=${ADVISOR_PERSONAS:-$'ADV-001\nADV-002\nADV-003\nADV-004\nADV-005'}

CUSTOMER_COUNT=$(echo "$CUSTOMER_PERSONAS" | grep -c . || echo "0")
ADVISOR_COUNT=$(echo "$ADVISOR_PERSONAS" | grep -c . || echo "0")

echo -e "${GREEN}✅ Found ${CUSTOMER_COUNT} customer personas${NC}"
echo -e "${GREEN}✅ Found ${ADVISOR_COUNT} advisor personas${NC}"
echo ""

# ============================================================================
# Test Execution Function
# ============================================================================

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
    
    # Get existing session ID for this persona
    local existing_session_id=$(get_session_id_for_persona "$persona_id")
    
    # Prepare metadata JSON
    local metadata_obj=$(echo "$metadata" | jq -c . 2>/dev/null || echo "$metadata")
    
    # Add sessionId to metadata
    if [ -n "$existing_session_id" ]; then
        metadata_obj=$(echo "$metadata_obj" | jq -c --arg sid "$existing_session_id" '. + {sessionId: $sid}' 2>/dev/null || echo "$metadata_obj")
    else
        metadata_obj=$(echo "$metadata_obj" | jq -c '. + {sessionId: ""}' 2>/dev/null || echo "$metadata_obj")
    fi
    
    # Run test with streaming endpoint
    local response=$(curl -s --max-time ${TEST_TIMEOUT} -X POST "${BASE_URL}${ENDPOINT}" \
        -F "message=${query}" \
        -F "metadata=${metadata_obj}" \
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
    
    # Store session ID
    if [ -n "$session_id" ] && [ -n "$persona_id" ]; then
        store_session_id_for_persona "$persona_id" "$session_id"
    fi
    
    # Extract sources and tools
    local sources="[]"
    local tools_used="[]"
    if [ -n "$response_metadata" ] && [ "$response_metadata" != "null" ]; then
        sources=$(echo "$response_metadata" | jq -r '.sources // []' 2>/dev/null || echo "[]")
        tools_used=$(echo "$response_metadata" | jq -r '.toolsUsed // []' 2>/dev/null || echo "[]")
    fi
    
    # Increment test count
    increment_test_count
    
    # Determine success
    local success=false
    if [ "$http_status" = "200" ] && [ "$has_error" = "false" ]; then
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
    
    # Append to results
    local temp_file="${TEST_RESULTS_FILE}.tmp"
    if echo "$existing_results" | jq --argjson new "$result_json" '. + [$new]' > "$temp_file" 2>/dev/null; then
        mv "$temp_file" "$TEST_RESULTS_FILE"
    else
        echo "$result_json" >> "$TEST_RESULTS_FILE"
    fi
    
    # Display results
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
        
        # Get error resolution
        local full_error="$error_message"
        if [ -z "$full_error" ]; then
            full_error="HTTP Status: $http_status"
        fi
        
        local resolution=$(resolve_error_with_deepseek "$full_error" "$test_name" "ChatWidget streaming API test with persona: ${persona_id}" "$stream_body")
        echo -e "${YELLOW}📋 DeepSeek Resolution:${NC}"
        echo "$resolution"
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
    
    # Small delay to avoid overwhelming the database
    sleep 0.3
}

# ============================================================================
# Test Execution
# ============================================================================

TEST_NUM=0

# Test Customer Personas
echo -e "${MAGENTA}==========================================${NC}"
echo -e "${MAGENTA}Testing Customer Personas (${CUSTOMER_COUNT} personas)${NC}"
echo -e "${MAGENTA}==========================================${NC}"
echo ""

while IFS= read -r persona; do
    [ -z "$persona" ] && continue
    
    # Clear session for new persona
    clear_session_for_persona "$persona"
    
    TEST_NUM=$((TEST_NUM + 1))
    run_test "${TEST_NUM}" "Policy Query (Customer ${persona})" "What are my policies?" "{\"selectedCustomerPersona\":\"${persona}\",\"userType\":\"customer\"}" "$persona"
    
    TEST_NUM=$((TEST_NUM + 1))
    run_test "${TEST_NUM}" "Claim Query (Customer ${persona})" "Show me my claims" "{\"selectedCustomerPersona\":\"${persona}\",\"userType\":\"customer\"}" "$persona"
    
    TEST_NUM=$((TEST_NUM + 1))
    run_test "${TEST_NUM}" "Profile Query (Customer ${persona})" "What is my profile information?" "{\"selectedCustomerPersona\":\"${persona}\",\"userType\":\"customer\"}" "$persona"
    
    TEST_NUM=$((TEST_NUM + 1))
    run_test "${TEST_NUM}" "Interaction Query (Customer ${persona})" "Show me my interaction history" "{\"selectedCustomerPersona\":\"${persona}\",\"userType\":\"customer\"}" "$persona"
    
    TEST_NUM=$((TEST_NUM + 1))
    run_test "${TEST_NUM}" "Document Query (Customer ${persona})" "Find documents about insurance forms" "{\"selectedCustomerPersona\":\"${persona}\",\"userType\":\"customer\"}" "$persona"
    
    sleep 1
done <<< "$CUSTOMER_PERSONAS"

# Test Advisor Personas
echo -e "${MAGENTA}==========================================${NC}"
echo -e "${MAGENTA}Testing Advisor Personas (${ADVISOR_COUNT} personas)${NC}"
echo -e "${MAGENTA}==========================================${NC}"
echo ""

while IFS= read -r persona; do
    [ -z "$persona" ] && continue
    
    # Clear session for new persona
    clear_session_for_persona "$persona"
    
    TEST_NUM=$((TEST_NUM + 1))
    run_test "${TEST_NUM}" "Task Query (Advisor ${persona})" "What are my tasks?" "{\"selectedAdvisorPersona\":\"${persona}\",\"userType\":\"advisor\"}" "$persona"
    
    TEST_NUM=$((TEST_NUM + 1))
    run_test "${TEST_NUM}" "Profile Query (Advisor ${persona})" "Show me my advisor profile" "{\"selectedAdvisorPersona\":\"${persona}\",\"userType\":\"advisor\"}" "$persona"
    
    TEST_NUM=$((TEST_NUM + 1))
    run_test "${TEST_NUM}" "Clients Query (Advisor ${persona})" "Show me my clients" "{\"selectedAdvisorPersona\":\"${persona}\",\"userType\":\"advisor\"}" "$persona"
    
    sleep 1
done <<< "$ADVISOR_PERSONAS"

# Test Knowledge Base Queries (No Persona)
echo -e "${MAGENTA}==========================================${NC}"
echo -e "${MAGENTA}Testing Knowledge Base Queries (No Persona)${NC}"
echo -e "${MAGENTA}==========================================${NC}"
echo ""

TEST_NUM=$((TEST_NUM + 1))
run_test "${TEST_NUM}" "Knowledge Base Query" "What is life insurance?" '{}' ""

TEST_NUM=$((TEST_NUM + 1))
run_test "${TEST_NUM}" "Document Search Query" "Find documents about insurance forms" '{}' ""

TEST_NUM=$((TEST_NUM + 1))
run_test "${TEST_NUM}" "Calculation Query" "Calculate 25 * 4 + 100" '{}' ""

TEST_NUM=$((TEST_NUM + 1))
run_test "${TEST_NUM}" "Hybrid Query" "Tell me about my policies and find information about claims process" '{"selectedCustomerPersona":"CUST-001","userType":"customer"}' "CUST-001"

# Test Error Scenarios
echo -e "${MAGENTA}==========================================${NC}"
echo -e "${MAGENTA}Testing Error Scenarios${NC}"
echo -e "${MAGENTA}==========================================${NC}"
echo ""

TEST_NUM=$((TEST_NUM + 1))
run_test "${TEST_NUM}" "Invalid Customer Persona" "What are my policies?" '{"selectedCustomerPersona":"INVALID-999","userType":"customer"}' "INVALID-999"

TEST_NUM=$((TEST_NUM + 1))
run_test "${TEST_NUM}" "Invalid Advisor Persona" "What are my tasks?" '{"selectedAdvisorPersona":"INVALID-999","userType":"advisor"}' "INVALID-999"

TEST_NUM=$((TEST_NUM + 1))
run_test "${TEST_NUM}" "Malformed Metadata" "Test query" '{"invalid":"metadata"}' ""

TEST_NUM=$((TEST_NUM + 1))
run_test "${TEST_NUM}" "Empty Query" "" '{"selectedCustomerPersona":"CUST-001","userType":"customer"}' "CUST-001"

# ============================================================================
# Generate Summary Report
# ============================================================================

sleep 1

echo -e "${CYAN}============================================================================${NC}"
echo -e "${CYAN}Testing Complete - Generating Summary${NC}"
echo -e "${CYAN}============================================================================${NC}"
echo ""

# Get counts
TOTAL_TESTS=$(get_test_count)
PASSED_TESTS=$(get_passed_count)
FAILED_TESTS=$(get_failed_count)

JSON_TOTAL=$(jq -r 'length' "$TEST_RESULTS_FILE" 2>/dev/null || echo "0")
JSON_PASSED=$(jq -r '[.[] | select(.success == true)] | length' "$TEST_RESULTS_FILE" 2>/dev/null || echo "0")
JSON_FAILED=$(jq -r '[.[] | select(.success == false)] | length' "$TEST_RESULTS_FILE" 2>/dev/null || echo "0")
ERROR_COUNT=$(jq -r 'length' "$ERRORS_FILE" 2>/dev/null || echo "0")
RESOLUTION_COUNT=$(jq -r 'length' "$RESOLUTIONS_FILE" 2>/dev/null || echo "0")

# Calculate success rate
if [ "$TOTAL_TESTS" -gt 0 ]; then
    SUCCESS_RATE=$(echo "scale=2; ($PASSED_TESTS * 100) / $TOTAL_TESTS" | bc 2>/dev/null || echo "0")
else
    SUCCESS_RATE="0"
fi

echo -e "${CYAN}Test Execution Summary:${NC}"
echo -e "${GREEN}Total Tests Run: ${TOTAL_TESTS}${NC}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
if [ "$FAILED_TESTS" -gt 0 ]; then
    echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
else
    echo -e "${GREEN}Failed: ${FAILED_TESTS}${NC}"
fi
echo -e "${CYAN}Success Rate: ${SUCCESS_RATE}%${NC}"
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
    echo -e "${CYAN}============================================================================${NC}"
    echo -e "${CYAN}DeepSeek Resolutions Summary${NC}"
    echo -e "${CYAN}============================================================================${NC}"
    echo ""
    jq -r '.[] | "Test: \(.test)\nError: \(.error)\nResolution:\n\(.resolution)\n---\n"' "$RESOLUTIONS_FILE" 2>/dev/null
    echo ""
    echo -e "${YELLOW}💡 All resolutions stored in: ${RESOLUTIONS_FILE}${NC}"
    echo ""
fi

echo -e "${CYAN}============================================================================${NC}"
echo -e "${CYAN}Test Results Files${NC}"
echo -e "${CYAN}============================================================================${NC}"
echo "  - Full results: ${TEST_RESULTS_FILE}"
echo "  - Errors: ${ERRORS_FILE}"
echo "  - Resolutions: ${RESOLUTIONS_FILE}"
echo "  - Summary: ${SUMMARY_FILE}"
echo ""

# Write summary to file
{
    echo "LifeCompass Master Test Suite - Summary Report"
    echo "Generated: $(date)"
    echo ""
    echo "Test Execution Summary:"
    echo "  Total Tests: ${TOTAL_TESTS}"
    echo "  Passed: ${PASSED_TESTS}"
    echo "  Failed: ${FAILED_TESTS}"
    echo "  Success Rate: ${SUCCESS_RATE}%"
    echo ""
    echo "Personas Tested:"
    echo "  Customers: ${CUSTOMER_COUNT}"
    echo "  Advisors: ${ADVISOR_COUNT}"
    echo ""
    echo "Error Tracking:"
    echo "  Errors Captured: ${ERROR_COUNT}"
    echo "  Resolutions Generated: ${RESOLUTION_COUNT}"
    echo ""
    echo "Files:"
    echo "  Results: ${TEST_RESULTS_FILE}"
    echo "  Errors: ${ERRORS_FILE}"
    echo "  Resolutions: ${RESOLUTIONS_FILE}"
} > "$SUMMARY_FILE"

echo -e "${GREEN}✅ Summary report saved to: ${SUMMARY_FILE}${NC}"
echo ""

