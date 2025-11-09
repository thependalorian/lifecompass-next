-- Migration: User Uploaded Documents Table
-- Purpose: Store documents uploaded via chat for agent context
-- For Hackathon: Simple text storage, no vector embeddings needed

CREATE TABLE IF NOT EXISTS user_uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number TEXT UNIQUE NOT NULL, -- Format: UD-YYYY-NNNNNN
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE,
  conversation_id TEXT, -- Chat session ID from CopilotKit
  claim_id UUID REFERENCES claims(id) ON DELETE SET NULL, -- Optional: if linked to claim
  
  -- File metadata
  original_filename TEXT NOT NULL,
  file_base64 TEXT, -- Store file as base64 (for hackathon simplicity)
  file_size_bytes BIGINT,
  content_type TEXT, -- MIME type (application/pdf, image/png, etc.)
  
  -- Document classification
  category TEXT, -- Claims, Identity, Policy, Supporting
  document_type TEXT, -- Police Report, ID Document, Repair Quote, etc.
  
  -- Extracted content (for agent context)
  extracted_text TEXT, -- Full extracted text content
  text_preview TEXT, -- First 500 chars for quick reference
  
  -- Processing status
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_user_uploaded_documents_customer 
  ON user_uploaded_documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_uploaded_documents_conversation 
  ON user_uploaded_documents(conversation_id);
CREATE INDEX IF NOT EXISTS idx_user_uploaded_documents_claim 
  ON user_uploaded_documents(claim_id);
CREATE INDEX IF NOT EXISTS idx_user_uploaded_documents_status 
  ON user_uploaded_documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_user_uploaded_documents_category 
  ON user_uploaded_documents(category);

-- Full-text search index for extracted_text (PostgreSQL native)
CREATE INDEX IF NOT EXISTS idx_user_uploaded_documents_text_search 
  ON user_uploaded_documents USING gin(to_tsvector('english', COALESCE(extracted_text, '')));

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_uploaded_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_uploaded_documents_updated_at
  BEFORE UPDATE ON user_uploaded_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_user_uploaded_documents_updated_at();

-- Comments
COMMENT ON TABLE user_uploaded_documents IS 'Stores documents uploaded via chat for agent context access';
COMMENT ON COLUMN user_uploaded_documents.file_base64 IS 'File stored as base64 for hackathon simplicity (Neon DB compatible)';
COMMENT ON COLUMN user_uploaded_documents.extracted_text IS 'Full extracted text content passed to agent context';
COMMENT ON COLUMN user_uploaded_documents.conversation_id IS 'CopilotKit chat session ID for linking documents to conversations';

