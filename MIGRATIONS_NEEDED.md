# Database Migrations Needed

## Summary

After fixing all hardcoded pages and creating new API endpoints, the following migration is needed:

### ✅ Required Migration: Templates Table

**File:** `/LifeCompass/sql/10_templates_migration.sql`

**Purpose:** Create a proper `templates` table to store message templates for advisors, replacing the current in-memory default templates.

**Why Needed:**
- The `communications` table has a `template_id` field that references templates
- Currently, templates are stored in-memory in the API
- Advisors should be able to create and manage their own templates
- System-wide templates should be available to all advisors

**What It Does:**
1. Creates `templates` table with:
   - `id` (UUID primary key)
   - `template_number` (unique identifier)
   - `name`, `category`, `content`
   - `advisor_id` (NULL for global templates)
   - `is_global` (boolean - true for system templates)
   - `usage_count` (tracks how often template is used)
   - `is_active` (soft delete)
   - Timestamps and metadata

2. Creates indexes for performance:
   - `template_number`
   - `category`
   - `advisor_id`
   - `is_global`
   - `is_active`

3. Adds foreign key constraint:
   - Links `communications.template_id` to `templates.id`

4. Inserts default system templates:
   - Welcome Message
   - Renewal Reminder
   - Claim Update
   - Policy Confirmation
   - Follow-up Check-in

5. Creates trigger for `updated_at` timestamp

**How to Apply:**

**Option 1: Using psql (Recommended)**
```bash
# Connect to your database
psql -h your-host -U your-user -d your-database

# Run the migration
\i LifeCompass/sql/10_templates_migration.sql
```

**Option 2: Using a Database Client (pgAdmin, DBeaver, etc.)**
1. Open the SQL file: `LifeCompass/sql/10_templates_migration.sql`
2. **IMPORTANT:** Make sure your client is set to execute SQL directly (not EXPLAIN mode)
3. Run the entire file or execute each section separately
4. If you get EXPLAIN errors, use the manual version: `10_templates_migration_manual.sql`

**Option 3: Copy-Paste Method**
1. Open `LifeCompass/sql/10_templates_migration_manual.sql`
2. Copy each section and run them one at a time
3. This avoids any EXPLAIN/query analysis issues

**Option 4: Using Neon Console or Supabase Dashboard**
1. Navigate to SQL Editor
2. Paste the contents of `10_templates_migration.sql`
3. Execute the query
4. Verify with: `SELECT COUNT(*) FROM templates;` (should return 5)

**After Migration:**
- The `/api/templates` endpoint will automatically use the database table
- Advisors can create custom templates via the API
- Template usage will be tracked
- Global templates will be available to all advisors

---

## ✅ No Other Migrations Needed

The following tables already exist and are properly structured:
- ✅ `communications` table - Already exists with all required fields
- ✅ `customers` table - Already exists
- ✅ `advisors` table - Already exists
- ✅ `policies` table - Already exists
- ✅ `claims` table - Already exists
- ✅ `tasks` table - Already exists
- ✅ `interactions` table - Already exists
- ✅ `document_files` table - Already exists

All API endpoints are using existing database structures correctly.

---

## Migration Status

- [ ] **Templates Table Migration** - `10_templates_migration.sql` - **NEEDS TO BE RUN**

**Troubleshooting:**
- If you get "EXPLAIN cannot be used with CREATE TABLE" error, your database client is trying to analyze the query
- Solution: Use `10_templates_migration_manual.sql` and run sections separately, or disable EXPLAIN mode in your client
- The SQL is correct - the issue is with the client tool, not the migration

**Note:** The application will work without the templates table (using in-memory defaults), but for production use, the migration should be applied to enable:
- Persistent template storage
- Template usage tracking
- Advisor-specific templates
- Better template management

