# LifeCompass Master Testing Suite

## Overview

The `test-master.sh` script is a comprehensive testing suite that combines the best features from all previous test scripts. It provides complete coverage of the ChatWidget streaming API endpoint with database validation, session management, error resolution, and comprehensive result tracking.

## Features

### ✅ Database Connectivity Validation
- Checks if database is configured (not demo mode)
- Validates session management is working
- Exits gracefully if database is not available

### ✅ Session Management
- Matches frontend behavior exactly
- Stores session IDs per persona (matching sessionStorage)
- Clears sessions when switching personas
- Reuses sessions for same persona across tests

### ✅ Comprehensive Persona Testing
- Tests all **10 customer personas** from database
- Tests all **5 advisor personas** from database
- Automatically fetches personas from `/api/customers` and `/api/advisors`
- Falls back to default personas if API fails

### ✅ Streaming Response Parsing
- Parses Server-Sent Events (SSE) format
- Extracts session IDs, content, metadata, errors
- Handles all event types: session, content, metadata, state, error

### ✅ Error Detection & Resolution
- Detects HTTP errors and stream errors
- Automatically consults DeepSeek API for error resolution
- Stores resolutions for later implementation
- Provides actionable debugging steps

### ✅ Comprehensive Test Coverage
- **Customer Tests**: Policies, Claims, Profiles, Interactions, Documents
- **Advisor Tests**: Tasks, Profiles, Clients
- **Knowledge Base Tests**: General queries, document search, calculations
- **Error Scenarios**: Invalid personas, malformed requests, empty queries

### ✅ Result Tracking
- JSON-formatted test results with full details
- Separate error tracking file
- Resolution tracking file
- Summary report with statistics
- Success rate calculation

## Usage

```bash
# Make sure server is running
npm run dev

# Run the master test suite
./test-master.sh

# Or with custom base URL
BASE_URL=http://localhost:3000 ./test-master.sh
```

## Configuration

Environment variables:
- `BASE_URL` - API base URL (default: `http://localhost:3000`)
- `DEEPSEEK_API_KEY` - DeepSeek API key for error resolution
- `DEEPSEEK_BASE_URL` - DeepSeek API base URL

Script configuration:
- `REQUIRE_DATABASE=true` - Require real database (not demo mode)
- `TEST_TIMEOUT=60` - Request timeout in seconds
- `MAX_CUSTOMER_PERSONAS=10` - Maximum customer personas to test
- `MAX_ADVISOR_PERSONAS=5` - Maximum advisor personas to test

## Output Files

All files are timestamped and stored in `/tmp/`:

- `lifecompass_test_results_YYYYMMDD_HHMMSS.json` - Full test results
- `lifecompass_errors_YYYYMMDD_HHMMSS.json` - Error details
- `lifecompass_resolutions_YYYYMMDD_HHMMSS.json` - DeepSeek resolutions
- `lifecompass_summary_YYYYMMDD_HHMMSS.txt` - Summary report

## Test Scenarios

### Customer Personas (5 tests per persona × 10 personas = 50 tests)
1. Policy Query - "What are my policies?"
2. Claim Query - "Show me my claims"
3. Profile Query - "What is my profile information?"
4. Interaction Query - "Show me my interaction history"
5. Document Query - "Find documents about insurance forms"

### Advisor Personas (3 tests per persona × 5 personas = 15 tests)
1. Task Query - "What are my tasks?"
2. Profile Query - "Show me my advisor profile"
3. Clients Query - "Show me my clients"

### Knowledge Base (4 tests)
1. General Query - "What is life insurance?"
2. Document Search - "Find documents about insurance forms"
3. Calculation - "Calculate 25 * 4 + 100"
4. Hybrid Query - "Tell me about my policies and find information about claims process"

### Error Scenarios (4 tests)
1. Invalid Customer Persona
2. Invalid Advisor Persona
3. Malformed Metadata
4. Empty Query

## Expected Test Count

- Customer tests: 10 personas × 5 tests = **50 tests**
- Advisor tests: 5 personas × 3 tests = **15 tests**
- Knowledge base: **4 tests**
- Error scenarios: **4 tests**
- **Total: ~73 tests**

## Summary Report

The script generates a comprehensive summary including:
- Total tests run
- Passed/Failed counts
- Success rate percentage
- Error count
- Resolution count
- File locations

## Integration with Previous Scripts

This master script combines features from:
- `test-copilotkit-with-error-resolution.sh` - Error resolution with DeepSeek
- `test-copilotkit-comprehensive.sh` - Streaming response parsing
- `test-chatwidget-comprehensive.sh` - Database checks, session management
- `test-copilotkit-all-tools.sh` - Test scenarios (adapted for streaming)

## Notes

- The script requires `jq` for JSON parsing
- The script requires `curl` for HTTP requests
- The script requires `bc` for calculations (optional, falls back if missing)
- Server must be running before executing tests
- Database must be configured and accessible
- DeepSeek API key is optional but recommended for error resolution

## Troubleshooting

### Server not running
```
❌ ERROR: Server not running at http://localhost:3000
```
**Solution**: Start the server with `npm run dev`

### Database not configured
```
❌ ERROR: Database not configured!
```
**Solution**: 
1. Set `DATABASE_URL` in `.env` file
2. Ensure database is accessible
3. Restart the server

### No personas found
**Solution**: Script will use default personas, but check that `/api/customers` and `/api/advisors` endpoints are working

### jq not found
**Solution**: Install jq: `brew install jq` (macOS) or `apt-get install jq` (Linux)

