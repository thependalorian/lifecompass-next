-- Migration: Create Templates Table
-- Date: 2025-01-XX
-- Purpose: Add templates table to support message templates for advisors
-- Location: /LifeCompass/sql/10_templates_migration.sql
-- 
-- IMPORTANT: Run this migration directly in your database client (psql, pgAdmin, etc.)
-- Do NOT use EXPLAIN or query analysis tools - this is a DDL statement

-- Step 1: Create Templates Table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    advisor_id UUID REFERENCES advisors(id) ON DELETE SET NULL, -- NULL for global templates
    is_global BOOLEAN DEFAULT FALSE, -- True for system-wide templates, False for advisor-specific
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES advisors(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_templates_template_number ON templates(template_number);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_advisor_id ON templates(advisor_id);
CREATE INDEX IF NOT EXISTS idx_templates_is_global ON templates(is_global);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active);

-- Step 3: Add foreign key constraint to communications.template_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_communications_template'
    ) THEN
        ALTER TABLE communications 
        ADD CONSTRAINT fk_communications_template 
        FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Step 4: Insert default templates
INSERT INTO templates (template_number, name, category, content, is_global, created_at) VALUES
    ('TPL-001', 'Welcome Message', 'Onboarding', 
     'Welcome to Old Mutual! I''m your dedicated advisor and I''m here to help you with all your insurance needs.', 
     TRUE, CURRENT_TIMESTAMP),
    ('TPL-002', 'Renewal Reminder', 'Policy Management', 
     'Your policy is due for renewal. Please contact me to discuss your options and ensure continuous coverage.', 
     TRUE, CURRENT_TIMESTAMP),
    ('TPL-003', 'Claim Update', 'Claims', 
     'Your claim has been processed. Here are the details of the payout and next steps.', 
     TRUE, CURRENT_TIMESTAMP),
    ('TPL-004', 'Policy Confirmation', 'Policy Management', 
     'Thank you for choosing Old Mutual. Your policy has been confirmed. Here are the details:', 
     TRUE, CURRENT_TIMESTAMP),
    ('TPL-005', 'Follow-up Check-in', 'Relationship Management', 
     'I wanted to check in and see how you''re doing with your policy. Is there anything I can help you with?', 
     TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (template_number) DO NOTHING;

-- Step 5: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_templates_updated_at ON templates;
CREATE TRIGGER trigger_update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_templates_updated_at();

-- Step 7: Add comments
COMMENT ON TABLE templates IS 'Message templates for advisor communications';
COMMENT ON COLUMN templates.is_global IS 'True for system-wide templates available to all advisors, False for advisor-specific templates';

-- Migration complete!
-- Verify with: SELECT * FROM templates;
