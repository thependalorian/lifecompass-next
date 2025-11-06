#!/bin/bash
# Script to clean up duplicate Vercel environment variables
# This script removes duplicates, keeping only Production values (or Development if Production doesn't exist)

echo "Fetching Vercel environment variables..."
vercel env ls --json > /tmp/vercel_envs.json 2>&1

if [ ! -f /tmp/vercel_envs.json ] || [ ! -s /tmp/vercel_envs.json ]; then
    echo "Error: Could not fetch environment variables"
    exit 1
fi

# Extract unique variable names
echo "Extracting unique variable names..."
UNIQUE_VARS=$(vercel env ls | grep -E "^ [A-Z_]+" | awk '{print $1}' | sort -u)

echo "Found unique variables:"
echo "$UNIQUE_VARS" | while read var; do
    if [ -n "$var" ]; then
        echo "  - $var"
    fi
done

echo ""
echo "To remove duplicates, you can:"
echo "1. Keep only Production values (recommended)"
echo "2. Keep only Development values"
echo "3. Keep all environments (current state)"
echo ""
echo "Would you like to remove Development and Preview duplicates, keeping only Production?"
echo "This will require manual confirmation for each variable."
echo ""
echo "Note: This script will show you what would be removed. Run with --dry-run first."

