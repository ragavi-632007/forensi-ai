-- ForensiAI Supabase Database Schema - RESET VERSION
-- Use this if you need to completely reset your database
-- WARNING: This will delete all existing data!

-- ============================================
-- DROP ALL EXISTING TABLES (in reverse dependency order)
-- ============================================

DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS team_messages CASCADE;
DROP TABLE IF EXISTS ai_insights CASCADE;
DROP TABLE IF EXISTS ai_chat_logs CASCADE;
DROP TABLE IF EXISTS evidence_media CASCADE;
DROP TABLE IF EXISTS evidence_locations CASCADE;
DROP TABLE IF EXISTS evidence_messages CASCADE;
DROP TABLE IF EXISTS evidence_calls CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS officers CASCADE;

-- ============================================
-- AUTHENTICATION & USERS
-- ============================================

CREATE TABLE officers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id TEXT UNIQUE NOT NULL,
  secure_token TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_officers_badge_id ON officers(badge_id);

-- ============================================
-- CASE MANAGEMENT
-- ============================================

CREATE TABLE cases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  device TEXT,
  owner TEXT,
  extraction_date TIMESTAMPTZ,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE evidence_calls (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  "from" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  duration INTEGER,
  type TEXT CHECK (type IN ('incoming', 'outgoing', 'missed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evidence_calls_case_id ON evidence_calls(case_id);

CREATE TABLE evidence_messages (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  "from" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  content TEXT,
  app TEXT CHECK (app IN ('whatsapp', 'sms', 'telegram')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evidence_messages_case_id ON evidence_messages(case_id);

CREATE TABLE evidence_locations (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evidence_locations_case_id ON evidence_locations(case_id);

CREATE TABLE evidence_media (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT CHECK (type IN ('image', 'video', 'audio')),
  file_name TEXT NOT NULL,
  url TEXT,
  size TEXT,
  mime_type TEXT,
  metadata JSONB DEFAULT '{}',
  comments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evidence_media_case_id ON evidence_media(case_id);

-- ============================================
-- AI CHAT HISTORY
-- ============================================

CREATE TABLE ai_chat_logs (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_chat_logs_case_id ON ai_chat_logs(case_id);
CREATE INDEX idx_ai_chat_logs_timestamp ON ai_chat_logs(timestamp);

-- ============================================
-- AI INSIGHTS & REPORTS
-- ============================================

CREATE TABLE ai_insights (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('report', 'analysis', 'summary')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_by TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_case_id ON ai_insights(case_id);
CREATE INDEX idx_ai_insights_type ON ai_insights(type);
CREATE INDEX idx_ai_insights_timestamp ON ai_insights(timestamp);

-- ============================================
-- COLLABORATION
-- ============================================

CREATE TABLE team_messages (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT CHECK (type IN ('text', 'file', 'alert')),
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_messages_case_id ON team_messages(case_id);
CREATE INDEX idx_team_messages_timestamp ON team_messages(timestamp);

-- ============================================
-- ACTIVITY LOGGING
-- ============================================

CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT CHECK (type IN ('access', 'edit', 'flag', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_case_id ON activity_logs(case_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

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

CREATE POLICY "Officers are viewable by authenticated users"
  ON officers FOR SELECT
  USING (true);

CREATE POLICY "Cases are manageable by authenticated users"
  ON cases FOR ALL
  USING (true);

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

CREATE POLICY "AI chat logs are manageable by authenticated users"
  ON ai_chat_logs FOR ALL
  USING (true);

CREATE POLICY "AI insights are manageable by authenticated users"
  ON ai_insights FOR ALL
  USING (true);

CREATE POLICY "Team messages are manageable by authenticated users"
  ON team_messages FOR ALL
  USING (true);

CREATE POLICY "Activity logs are manageable by authenticated users"
  ON activity_logs FOR ALL
  USING (true);

-- ============================================
-- SAMPLE DATA
-- ============================================

INSERT INTO officers (badge_id, secure_token, name, role, avatar)
VALUES ('miller.j', 'demo123', 'Det. Miller', 'Investigator', '');

