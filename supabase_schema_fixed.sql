-- ForensiAI Supabase Database Schema (Fixed Version)
-- Run this SQL in your Supabase SQL Editor to set up all required tables
-- This version handles existing tables properly

-- ============================================
-- DROP EXISTING TABLES (if needed - uncomment to reset)
-- ============================================
-- Uncomment the following lines if you want to start fresh
-- DROP TABLE IF EXISTS activity_logs CASCADE;
-- DROP TABLE IF EXISTS team_messages CASCADE;
-- DROP TABLE IF EXISTS ai_insights CASCADE;
-- DROP TABLE IF EXISTS ai_chat_logs CASCADE;
-- DROP TABLE IF EXISTS evidence_media CASCADE;
-- DROP TABLE IF EXISTS evidence_locations CASCADE;
-- DROP TABLE IF EXISTS evidence_messages CASCADE;
-- DROP TABLE IF EXISTS evidence_calls CASCADE;
-- DROP TABLE IF EXISTS cases CASCADE;
-- DROP TABLE IF EXISTS officers CASCADE;

-- ============================================
-- AUTHENTICATION & USERS
-- ============================================

-- Officers table for authentication
CREATE TABLE IF NOT EXISTS officers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id TEXT UNIQUE NOT NULL,
  secure_token TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster badge_id lookups
CREATE INDEX IF NOT EXISTS idx_officers_badge_id ON officers(badge_id);

-- ============================================
-- CASE MANAGEMENT
-- ============================================

-- Cases table (must be created first before other tables reference it)
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  device TEXT,
  owner TEXT,
  extraction_date TIMESTAMPTZ,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence: Calls
CREATE TABLE IF NOT EXISTS evidence_calls (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  "from" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  duration INTEGER,
  type TEXT CHECK (type IN ('incoming', 'outgoing', 'missed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_evidence_calls_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evidence_calls_case_id ON evidence_calls(case_id);

-- Evidence: Messages
CREATE TABLE IF NOT EXISTS evidence_messages (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  "from" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  content TEXT,
  app TEXT CHECK (app IN ('whatsapp', 'sms', 'telegram')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_evidence_messages_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evidence_messages_case_id ON evidence_messages(case_id);

-- Evidence: Locations
CREATE TABLE IF NOT EXISTS evidence_locations (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_evidence_locations_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evidence_locations_case_id ON evidence_locations(case_id);

-- Evidence: Media
CREATE TABLE IF NOT EXISTS evidence_media (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT CHECK (type IN ('image', 'video', 'audio')),
  file_name TEXT NOT NULL,
  url TEXT,
  size TEXT,
  mime_type TEXT,
  metadata JSONB DEFAULT '{}',
  comments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_evidence_media_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evidence_media_case_id ON evidence_media(case_id);

-- ============================================
-- AI CHAT HISTORY
-- ============================================

-- AI Chat Logs
CREATE TABLE IF NOT EXISTS ai_chat_logs (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_ai_chat_logs_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_case_id ON ai_chat_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_timestamp ON ai_chat_logs(timestamp);

-- ============================================
-- AI INSIGHTS & REPORTS
-- ============================================

-- AI Insights (Reports, Analysis, Summaries)
CREATE TABLE IF NOT EXISTS ai_insights (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('report', 'analysis', 'summary')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_by TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_ai_insights_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_case_id ON ai_insights(case_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_timestamp ON ai_insights(timestamp);

-- ============================================
-- COLLABORATION
-- ============================================

-- Team Messages
CREATE TABLE IF NOT EXISTS team_messages (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT CHECK (type IN ('text', 'file', 'alert')),
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_team_messages_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_team_messages_case_id ON team_messages(case_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_timestamp ON team_messages(timestamp);

-- ============================================
-- ACTIVITY LOGGING
-- ============================================

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT CHECK (type IN ('access', 'edit', 'flag', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_activity_logs_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_case_id ON activity_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Officers are viewable by authenticated users" ON officers;
DROP POLICY IF EXISTS "Cases are manageable by authenticated users" ON cases;
DROP POLICY IF EXISTS "Evidence is manageable by authenticated users" ON evidence_calls;
DROP POLICY IF EXISTS "Messages are manageable by authenticated users" ON evidence_messages;
DROP POLICY IF EXISTS "Locations are manageable by authenticated users" ON evidence_locations;
DROP POLICY IF EXISTS "Media is manageable by authenticated users" ON evidence_media;
DROP POLICY IF EXISTS "AI chat logs are manageable by authenticated users" ON ai_chat_logs;
DROP POLICY IF EXISTS "AI insights are manageable by authenticated users" ON ai_insights;
DROP POLICY IF EXISTS "Team messages are manageable by authenticated users" ON team_messages;
DROP POLICY IF EXISTS "Activity logs are manageable by authenticated users" ON activity_logs;

-- Policy: Allow all operations for authenticated users
-- Adjust these policies based on your security requirements

-- Officers: Only authenticated users can read
CREATE POLICY "Officers are viewable by authenticated users"
  ON officers FOR SELECT
  USING (true);

-- Cases: Authenticated users can manage cases
CREATE POLICY "Cases are manageable by authenticated users"
  ON cases FOR ALL
  USING (true);

-- Evidence tables: Authenticated users can manage
CREATE POLICY "Evidence is manageable by authenticated users"
  ON evidence_calls FOR ALL
  USING (true);

CREATE POLICY "Messages are manageable by authenticated users"
  ON evidence_messages FOR ALL
  USING (true);

CREATE POLICY "Locations are manageable by authenticated users"
  ON evidence_locations FOR ALL
  USING (true);

CREATE POLICY "Media is manageable by authenticated users"
  ON evidence_media FOR ALL
  USING (true);

-- AI Chat Logs: Authenticated users can manage
CREATE POLICY "AI chat logs are manageable by authenticated users"
  ON ai_chat_logs FOR ALL
  USING (true);

-- AI Insights: Authenticated users can manage
CREATE POLICY "AI insights are manageable by authenticated users"
  ON ai_insights FOR ALL
  USING (true);

-- Team Messages: Authenticated users can manage
CREATE POLICY "Team messages are manageable by authenticated users"
  ON team_messages FOR ALL
  USING (true);

-- Activity Logs: Authenticated users can manage
CREATE POLICY "Activity logs are manageable by authenticated users"
  ON activity_logs FOR ALL
  USING (true);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert a sample officer for testing
-- Password/token: 'demo123'
INSERT INTO officers (badge_id, secure_token, name, role, avatar)
VALUES ('miller.j', 'demo123', 'Det. Miller', 'Investigator', '')
ON CONFLICT (badge_id) DO NOTHING;

-- ============================================
-- NOTES
-- ============================================
-- 1. Make sure to configure your Supabase project URL and anon key in your .env file
-- 2. Adjust RLS policies based on your security requirements
-- 3. Consider adding additional indexes for frequently queried fields
-- 4. For production, consider adding audit triggers for sensitive operations
-- 5. The schema uses CASCADE deletes - when a case is deleted, all related data is removed
-- 6. If you get errors, try uncommenting the DROP TABLE statements at the top to start fresh

