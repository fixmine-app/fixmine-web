-- Run in Supabase SQL Editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number   TEXT NOT NULL UNIQUE,
  plan_id          TEXT NOT NULL,
  amount           INTEGER NOT NULL,
  plan_days        INTEGER NOT NULL DEFAULT 30,
  status           TEXT NOT NULL DEFAULT 'pending',
  payment_url      TEXT,
  payment_channel  TEXT,
  doku_session_id  TEXT,
  paid_at          TIMESTAMPTZ,
  raw_response     JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoices_own" ON public.invoices;
CREATE POLICY "invoices_own" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);
