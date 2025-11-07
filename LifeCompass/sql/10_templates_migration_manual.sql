-- Migration: Create Templates Table (Manual Execution)
-- Date: 2025-01-XX
-- Purpose: Add templates table to support message templates for advisors
-- 
-- INSTRUCTIONS:
-- 1. Connect to your PostgreSQL database
-- 2. Run each section separately if your client has issues
-- 3. Or run the entire file in psql: \i 10_templates_migration_manual.sql

-- ============================================
-- SECTION 1: Create Table
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    advisor_id UUID REFERENCES advisors(id) ON DELETE SET NULL,
    is_global BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES advisors(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- ============================================
-- SECTION 2: Create Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_templates_template_number ON templates(template_number);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_advisor_id ON templates(advisor_id);
CREATE INDEX IF NOT EXISTS idx_templates_is_global ON templates(is_global);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active);

-- ============================================
-- SECTION 3: Add Foreign Key Constraint
-- ============================================
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

-- ============================================
-- SECTION 4: Insert Default Templates
-- ============================================
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

-- ============================================
-- SECTION 5: Create Update Function
-- ============================================
CREATE OR REPLACE FUNCTION update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SECTION 6: Create Trigger
-- ============================================
DROP TRIGGER IF EXISTS trigger_update_templates_updated_at ON templates;
CREATE TRIGGER trigger_update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_templates_updated_at();

-- ============================================
-- SECTION 7: Add Comments
-- ============================================
COMMENT ON TABLE templates IS 'Message templates for advisor communications';
COMMENT ON COLUMN templates.is_global IS 'True for system-wide templates available to all advisors, False for advisor-specific templates';

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify the migration:
-- SELECT COUNT(*) FROM templates;
-- Should return 5 (the default templates)

