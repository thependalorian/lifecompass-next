#!/bin/bash
# Script to remove duplicate environment variables from Vercel
# Removes Development and Preview duplicates, keeping only Production values

set -e

DRY_RUN=${1:-"--dry-run"}

echo "Fetching Vercel environment variables..."
vercel env ls > /tmp/vercel_envs_raw.txt

# Extract unique variable names
UNIQUE_VARS=$(grep -E "^ [A-Z_]+" /tmp/vercel_envs_raw.txt | awk '{print $1}' | sort -u | grep -v "^$")

TOTAL_VARS=$(echo "$UNIQUE_VARS" | wc -l | tr -d ' ')
echo "Found $TOTAL_VARS unique environment variables"
echo ""

if [ "$DRY_RUN" != "--dry-run" ] && [ "$DRY_RUN" != "--execute" ]; then
    echo "Usage: $0 [--dry-run|--execute]"
    echo "  --dry-run: Show what would be removed (default)"
    echo "  --execute: Actually remove duplicates"
    exit 1
fi

if [ "$DRY_RUN" = "--execute" ]; then
    echo "⚠️  WARNING: This will DELETE environment variables from Development and Preview!"
    echo "Press Ctrl+C to cancel, or Enter to continue..."
    read
fi

REMOVED=0
KEPT=0

echo "$UNIQUE_VARS" | while IFS= read -r var; do
    if [ -z "$var" ]; then
        continue
    fi
    
    # Check which environments have this variable
    PROD_COUNT=$(grep -E "^ $var " /tmp/vercel_envs_raw.txt | grep -c "Production" 2>/dev/null || echo "0")
    PREV_COUNT=$(grep -E "^ $var " /tmp/vercel_envs_raw.txt | grep -c "Preview" 2>/dev/null || echo "0")
    DEV_COUNT=$(grep -E "^ $var " /tmp/vercel_envs_raw.txt | grep -c "Development" 2>/dev/null || echo "0")
    
    # Convert to integers for comparison (remove any whitespace)
    HAS_PROD=$(echo "$PROD_COUNT" | tr -d ' ' | grep -E '^[0-9]+$' || echo "0")
    HAS_PREV=$(echo "$PREV_COUNT" | tr -d ' ' | grep -E '^[0-9]+$' || echo "0")
    HAS_DEV=$(echo "$DEV_COUNT" | tr -d ' ' | grep -E '^[0-9]+$' || echo "0")
    
    # Remove from Development if Production exists
    if [ "$HAS_PROD" -gt 0 ] && [ "$HAS_DEV" -gt 0 ]; then
        if [ "$DRY_RUN" = "--dry-run" ]; then
            echo "[DRY RUN] Would remove: $var from Development"
        else
            echo "Removing $var from Development..."
            vercel env rm "$var" development --yes 2>/dev/null || echo "  (already removed or error)"
            REMOVED=$((REMOVED + 1))
        fi
    fi
    
    # Remove from Preview if Production exists
    if [ "$HAS_PROD" -gt 0 ] && [ "$HAS_PREV" -gt 0 ]; then
        if [ "$DRY_RUN" = "--dry-run" ]; then
            echo "[DRY RUN] Would remove: $var from Preview"
        else
            echo "Removing $var from Preview..."
            vercel env rm "$var" preview --yes 2>/dev/null || echo "  (already removed or error)"
            REMOVED=$((REMOVED + 1))
        fi
    fi
    
    # Count kept Production variables
    if [ "$HAS_PROD" -gt 0 ]; then
        KEPT=$((KEPT + 1))
    fi
done

if [ "$DRY_RUN" = "--dry-run" ]; then
    echo ""
    echo "✅ Dry run complete. No changes made."
    echo ""
    echo "To actually remove duplicates, run:"
    echo "  bash scripts/remove-env-duplicates.sh --execute"
else
    echo ""
    echo "✅ Cleanup complete!"
    echo "Removed: $REMOVED duplicate variables"
    echo "Kept: $KEPT variables in Production"
    echo ""
    echo "You can now export clean variables with: vercel env pull .env.production"
fi
