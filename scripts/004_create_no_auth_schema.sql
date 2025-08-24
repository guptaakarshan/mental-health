-- Create new schema without authentication dependencies

-- Create sessions table (no user authentication required)
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  title TEXT DEFAULT 'New Chat Session',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table (linked to sessions, not users)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mood_logs table (no user authentication required)
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_label TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_entries table (no user authentication required)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_responses table for mental health survey
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  responses JSONB NOT NULL,
  score INTEGER,
  risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high')),
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages(session_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_session_id ON public.mood_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_session_id ON public.journal_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_session_id ON public.survey_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(session_token);
