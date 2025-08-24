-- Remove all authentication dependencies and RLS policies
-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can insert their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON public.chat_sessions;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

DROP POLICY IF EXISTS "Users can view their own mood logs" ON public.mood_logs;
DROP POLICY IF EXISTS "Users can insert their own mood logs" ON public.mood_logs;
DROP POLICY IF EXISTS "Users can update their own mood logs" ON public.mood_logs;
DROP POLICY IF EXISTS "Users can delete their own mood logs" ON public.mood_logs;

DROP POLICY IF EXISTS "Users can view their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON public.journal_entries;

-- Disable Row Level Security on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries DISABLE ROW LEVEL SECURITY;

-- Drop existing tables to recreate without auth dependencies
DROP TABLE IF EXISTS public.journal_entries;
DROP TABLE IF EXISTS public.mood_logs;
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.chat_sessions;
DROP TABLE IF EXISTS public.profiles;
