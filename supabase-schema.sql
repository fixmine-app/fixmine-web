-- Run this in Supabase SQL Editor
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text, name text, lang text default 'id', plan text default 'free',
  plan_expires_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  ip text, month text not null, count int default 0, updated_at timestamptz default now(),
  unique(user_id, month), unique(ip, month)
);
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_number text not null unique, plan_id text not null,
  amount integer not null, plan_days integer not null default 30,
  status text not null default 'pending', payment_url text, payment_channel text,
  paid_at timestamptz, raw_response jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.usage enable row level security;
alter table public.invoices enable row level security;
create policy "profiles own" on public.profiles for all using (auth.uid() = id);
create policy "usage own" on public.usage for all using (auth.uid() = user_id);
create policy "invoices own" on public.invoices for select using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
