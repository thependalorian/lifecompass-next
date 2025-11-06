#!/bin/bash
# Script to remove ALL duplicate environment variables from Vercel
# This will keep only ONE instance of each variable (preferring Production)

set -e

echo "Fetching ALL Vercel environment variables..."
vercel env ls > /tmp/vercel_envs_all.txt 2>&1

# Extract all variable names and environments
echo "Analyzing duplicates..."

# Get all unique variable names
UNIQUE_VARS=$(grep -E "^ [A-Z_]+" /tmp/vercel_envs_all.txt | awk '{print $1}' | sort -u)

# For each variable, check all occurrences and remove duplicates
echo "$UNIQUE_VARS" | while IFS= read -r var; do
    if [ -z "$var" ]; then
        continue
    fi
    
    # Count occurrences of this variable
    OCCURRENCES=$(grep -E "^ $var " /tmp/vercel_envs_all.txt | wc -l | tr -d ' ')
    
    if [ "$OCCURRENCES" -gt 1 ]; then
        echo "Found $OCCURRENCES instances of $var"
        
        # Get all environments for this variable
        ENVS=$(grep -E "^ $var " /tmp/vercel_envs_all.txt | awk '{print $3}' | sort -u)
        
        # Keep Production if it exists, otherwise keep the first one
        KEEP_ENV=""
        if echo "$ENVS" | grep -q "Production"; then
            KEEP_ENV="Production"
        else
            KEEP_ENV=$(echo "$ENVS" | head -1)
        fi
        
        echo "  Keeping $var in $KEEP_ENV"
        
        # Remove from all other environments
        for env in $ENVS; do
            if [ "$env" != "$KEEP_ENV" ]; then
                echo "  Removing $var from $env..."
                vercel env rm "$var" "$env" --yes 2>/dev/null || echo "    (already removed or error)"
            fi
        done
    fi
done

echo ""
echo "✅ Duplicate removal complete!"
echo "Verifying cleanup..."

# Check for remaining duplicates
REMAINING=$(vercel env ls 2>&1 | grep -E "^ [A-Z_]+" | awk '{print $1}' | sort | uniq -d | wc -l | tr -d ' ')

if [ "$REMAINING" -eq "0" ]; then
    echo "✅ No duplicates found!"
else
    echo "⚠️  Found $REMAINING variables that still appear multiple times"
    echo "Run 'vercel env ls' to see details"
fi

