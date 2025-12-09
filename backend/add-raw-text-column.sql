-- Add raw_text column to candidates table for RAG retrieval
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS raw_text TEXT;

-- Create index for faster text search (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_candidates_raw_text_gin 
ON candidates USING gin(to_tsvector('english', raw_text));

-- Grant permissions
GRANT SELECT, UPDATE ON candidates TO authenticated;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'candidates' AND column_name = 'raw_text';
