-- Expense Tracker Database Schema for Supabase

-- Categories
create table if not exists public.categories (
  id bigint primary key generated always as identity,
  name text not null,
  emoji text,
  color text,
  type text not null check (type in ('income', 'expense')),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_categories_user_id on public.categories(user_id);

-- Transactions
create table if not exists public.transactions (
  id bigint primary key generated always as identity,
  description text not null,
  amount numeric(10,2) not null,
  type text not null check (type in ('income', 'expense')),
  date date not null,
  repeat_frequency text default 'none' check (repeat_frequency in ('none', 'daily', 'weekly', 'biweekly', 'monthly', 'bimonthly')),
  repeat_end_date date,
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id bigint references public.categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_date on public.transactions(date);
create index idx_transactions_user_date on public.transactions(user_id, date);

-- User settings
create table if not exists public.user_settings (
  id bigint primary key generated always as identity,
  user_id uuid not null references auth.users(id) on delete cascade unique,
  transaction_month_start_day int not null default 1 check (transaction_month_start_day between 1 and 28),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_user_settings_user_id on public.user_settings(user_id);
