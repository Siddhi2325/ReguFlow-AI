-- Create table for storing demo requests
CREATE TABLE IF NOT EXISTS public.demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  institution TEXT NOT NULL,
  job_title TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grant permissions to anonym and authenticated users to submit demo requests
GRANT INSERT ON public.demo_requests TO anon, authenticated;
GRANT ALL ON public.demo_requests TO service_role;

-- Enable Row Level Security (RLS)
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Enable inserts for everyone (needed for the public demo request form)
CREATE POLICY "Enable public inserts for demo requests" ON public.demo_requests
  FOR INSERT WITH CHECK (true);
