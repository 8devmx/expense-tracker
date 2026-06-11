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

create index if not exists idx_categories_user_id on public.categories(user_id);

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

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_date on public.transactions(date);
create index if not exists idx_transactions_user_date on public.transactions(user_id, date);

-- User settings
create table if not exists public.user_settings (
  id bigint primary key generated always as identity,
  user_id uuid not null references auth.users(id) on delete cascade unique,
  transaction_month_start_day int not null default 1 check (transaction_month_start_day between 1 and 28),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_settings_user_id on public.user_settings(user_id);
-- Row Level Security Policies

-- Categories
alter table public.categories enable row level security;

drop policy if exists "Users can view own categories" on public.categories;
create policy "Users can view own categories"
  on public.categories for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own categories" on public.categories;
create policy "Users can create own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own categories" on public.categories;
create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own categories" on public.categories;
create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Transactions
alter table public.transactions enable row level security;

drop policy if exists "Users can view own transactions" on public.transactions;
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own transactions" on public.transactions;
create policy "Users can create own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own transactions" on public.transactions;
create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own transactions" on public.transactions;
create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- User settings
alter table public.user_settings enable row level security;

drop policy if exists "Users can view own settings" on public.user_settings;
create policy "Users can view own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own settings" on public.user_settings;
create policy "Users can create own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own settings" on public.user_settings;
create policy "Users can delete own settings"
  on public.user_settings for delete
  using (auth.uid() = user_id);

create policy if not exists "Users can create own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Transactions
alter table public.transactions enable row level security;

create policy if not exists "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy if not exists "Users can create own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- User settings
alter table public.user_settings enable row level security;

create policy if not exists "Users can view own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy if not exists "Users can create own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete own settings"
  on public.user_settings for delete
  using (auth.uid() = user_id);
-- Helper: get monthly transactions with recurring expansion
create or replace function public.get_monthly_transactions(
  p_user_id uuid,
  p_year int,
  p_month int
)
returns table(
  id bigint,
  description text,
  amount numeric(10,2),
  type text,
  date date,
  repeat_frequency text,
  repeat_end_date date,
  category_id bigint,
  category_name text,
  category_emoji text,
  category_color text
)
language plpgsql
security definer
as $$
declare
  v_start_date date;
  v_end_date date;
  v_month_start_day int;
  v_rec record;
  v_current date;
  v_step interval;
begin
  select coalesce(
    (select transaction_month_start_day from public.user_settings where user_id = p_user_id),
    1
  ) into v_month_start_day;

  if v_month_start_day > 1 then
    if p_month = 1 then
      v_start_date := make_date(p_year - 1, 12, v_month_start_day);
    else
      v_start_date := make_date(p_year, p_month - 1, v_month_start_day);
    end if;
    v_end_date := make_date(p_year, p_month, v_month_start_day) - 1;
  else
    v_start_date := make_date(p_year, p_month, 1);
    v_end_date := (make_date(p_year, p_month, 1) + interval '1 month' - interval '1 day')::date;
  end if;

  return query
    select 
      t.id, t.description, t.amount, t.type, t.date,
      t.repeat_frequency, t.repeat_end_date,
      t.category_id, c.name, c.emoji, c.color
    from public.transactions t
    left join public.categories c on t.category_id = c.id
    where t.user_id = p_user_id
      and (t.repeat_frequency is null or t.repeat_frequency = 'none')
      and t.date >= v_start_date and t.date <= v_end_date
    order by t.date desc;

  for v_rec in
    select t.*, c.name as cat_name, c.emoji as cat_emoji, c.color as cat_color
    from public.transactions t
    left join public.categories c on t.category_id = c.id
    where t.user_id = p_user_id
      and t.repeat_frequency is not null
      and t.repeat_frequency != 'none'
      and t.date <= v_end_date
      and (t.repeat_end_date is null or t.repeat_end_date >= v_start_date)
  loop
    v_step := case v_rec.repeat_frequency
      when 'daily' then interval '1 day'
      when 'weekly' then interval '7 days'
      when 'biweekly' then interval '14 days'
      when 'monthly' then interval '1 month'
      when 'bimonthly' then interval '2 months'
    end;

    v_current := greatest(v_rec.date, v_start_date);

    while v_current <= v_end_date loop
      if (v_rec.repeat_end_date is null or v_current <= v_rec.repeat_end_date) then
        return query select 
          v_rec.id, v_rec.description, v_rec.amount, v_rec.type, v_current,
          v_rec.repeat_frequency, v_rec.repeat_end_date,
          v_rec.category_id, v_rec.cat_name, v_rec.cat_emoji, v_rec.cat_color;
      end if;
      v_current := v_current + v_step;
    end loop;
  end loop;
end;
$$;

-- Helper: get transactions for the full year (for dashboard)
create or replace function public.get_year_transactions(
  p_user_id uuid,
  p_year int
)
returns table(
  id bigint,
  description text,
  amount numeric(10,2),
  type text,
  date date,
  month int,
  repeat_frequency text,
  repeat_end_date date,
  category_id bigint,
  category_name text,
  category_emoji text,
  category_color text
)
language plpgsql
security definer
as $$
declare
  v_start_date date;
  v_end_date date;
  v_rec record;
  v_current date;
  v_step interval;
begin
  v_start_date := make_date(p_year, 1, 1);
  v_end_date := make_date(p_year, 12, 31);

  return query
    select 
      t.id, t.description, t.amount, t.type, t.date,
      extract(month from t.date)::int,
      t.repeat_frequency, t.repeat_end_date,
      t.category_id, c.name, c.emoji, c.color
    from public.transactions t
    left join public.categories c on t.category_id = c.id
    where t.user_id = p_user_id
      and (t.repeat_frequency is null or t.repeat_frequency = 'none')
      and t.date >= v_start_date and t.date <= v_end_date
    order by t.date desc;

  for v_rec in
    select t.*, c.name as cat_name, c.emoji as cat_emoji, c.color as cat_color
    from public.transactions t
    left join public.categories c on t.category_id = c.id
    where t.user_id = p_user_id
      and t.repeat_frequency is not null
      and t.repeat_frequency != 'none'
      and t.date <= v_end_date
      and (t.repeat_end_date is null or t.repeat_end_date >= v_start_date)
  loop
    v_step := case v_rec.repeat_frequency
      when 'daily' then interval '1 day'
      when 'weekly' then interval '7 days'
      when 'biweekly' then interval '14 days'
      when 'monthly' then interval '1 month'
      when 'bimonthly' then interval '2 months'
    end;

    v_current := greatest(v_rec.date, v_start_date);

    while v_current <= v_end_date loop
      if (v_rec.repeat_end_date is null or v_current <= v_rec.repeat_end_date) then
        return query select 
          v_rec.id, v_rec.description, v_rec.amount, v_rec.type, v_current,
          extract(month from v_current)::int,
          v_rec.repeat_frequency, v_rec.repeat_end_date,
          v_rec.category_id, v_rec.cat_name, v_rec.cat_emoji, v_rec.cat_color;
      end if;
      v_current := v_current + v_step;
    end loop;
  end loop;
end;
$$;
-- Auto-create default categories when a user signs up

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (name, emoji, color, type, user_id) values
    ('Comidas', '🍔', 'oklch(70% 0.15 45)', 'expense', new.id),
    ('Gastos Fijos', '🗓️', 'oklch(60% 0.05 240)', 'expense', new.id),
    ('Innecesarios', '🛍️', 'oklch(80% 0.2 300)', 'expense', new.id),
    ('General', '📝', 'oklch(75% 0.05 100)', 'expense', new.id),
    ('Entretenimiento', '🎬', 'oklch(50% 0.2 280)', 'expense', new.id),
    ('Despensa', '🥦', 'oklch(65% 0.18 120)', 'expense', new.id),
    ('Gasolina', '⛽', 'oklch(55% 0.18 60)', 'expense', new.id),
    ('No Identificados', '❓', 'oklch(40% 0.01 0)', 'expense', new.id),
    ('Cerveza', '🍺', 'oklch(45% 0.18 80)', 'expense', new.id),
    ('Salario', '💰', 'oklch(55% 0.15 150)', 'income', new.id),
    ('Extras', '🎁', 'oklch(80% 0.25 210)', 'income', new.id);

  insert into public.user_settings (user_id) values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
