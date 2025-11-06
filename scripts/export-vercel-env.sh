#!/bin/bash
# Script to export Vercel environment variables without duplicates
# Exports unique variable names with their values (prioritizing Production > Preview > Development)

echo "Fetching Vercel environment variables..."
vercel env ls > /tmp/vercel_envs_raw.txt

# Extract unique variable names (first column)
echo "Extracting unique variable names..."
UNIQUE_VARS=$(grep -E "^ [A-Z_]+" /tmp/vercel_envs_raw.txt | awk '{print $1}' | sort -u)

echo "Found $(echo "$UNIQUE_VARS" | wc -l | tr -d ' ') unique environment variables"
echo ""
echo "Export format (prioritizing Production > Preview > Development):"
echo "=========================================="

# Create a clean export file
OUTPUT_FILE="vercel-env-export.txt"
> "$OUTPUT_FILE"

echo "$UNIQUE_VARS" | while read var; do
    if [ -n "$var" ]; then
        # Check which environments have this variable
        PROD=$(grep -E "^ $var" /tmp/vercel_envs_raw.txt | grep -c "Production" || echo "0")
        PREV=$(grep -E "^ $var" /tmp/vercel_envs_raw.txt | grep -c "Preview" || echo "0")
        DEV=$(grep -E "^ $var" /tmp/vercel_envs_raw.txt | grep -c "Development" || echo "0")
        
        ENVS=""
        [ "$PROD" -gt 0 ] && ENVS="${ENVS}Production "
        [ "$PREV" -gt 0 ] && ENVS="${ENVS}Preview "
        [ "$DEV" -gt 0 ] && ENVS="${ENVS}Development"
        
        echo "$var (in: $ENVS)" | tee -a "$OUTPUT_FILE"
    fi
done

echo ""
echo "Exported to: $OUTPUT_FILE"
echo ""
echo "To get actual values, use: vercel env pull"

