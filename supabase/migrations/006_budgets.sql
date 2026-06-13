-- Budgets table for monthly spending challenges
create table if not exists public.budgets (
  id bigint primary key generated always as identity,
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id bigint not null references public.categories(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, category_id)
);

create index if not exists idx_budgets_user_id on public.budgets(user_id);
create index if not exists idx_budgets_category_id on public.budgets(category_id);

-- RLS
alter table public.budgets enable row level security;

drop policy if exists "Users can view own budgets" on public.budgets;
create policy "Users can view own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own budgets" on public.budgets;
create policy "Users can create own budgets"
  on public.budgets for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own budgets" on public.budgets;
create policy "Users can update own budgets"
  on public.budgets for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own budgets" on public.budgets;
create policy "Users can delete own budgets"
  on public.budgets for delete
  using (auth.uid() = user_id);

-- Trigger for auto user_id
drop trigger if exists trg_set_budgets_user_id on public.budgets;
create trigger trg_set_budgets_user_id
  before insert on public.budgets
  for each row
  when (new.user_id is null)
  execute function public.set_user_id();

-- Function: get budget progress for current month
create or replace function public.get_budget_progress(p_user_id uuid)
returns table(
  category_id bigint,
  category_name text,
  category_emoji text,
  category_color text,
  budget_amount numeric(10,2),
  spent numeric(10,2),
  remaining numeric(10,2),
  percentage numeric(5,2)
)
language plpgsql
security definer
as $$
declare
  v_start date;
  v_end date;
  v_month_start_day int;
begin
  select coalesce(
    (select transaction_month_start_day from public.user_settings where user_id = p_user_id),
    1
  ) into v_month_start_day;

  if v_month_start_day > 1 then
    if extract(month from current_date) = 1 then
      v_start := make_date(extract(year from current_date)::int - 1, 12, v_month_start_day);
    else
      v_start := make_date(extract(year from current_date)::int, extract(month from current_date)::int - 1, v_month_start_day);
    end if;
    v_end := make_date(extract(year from current_date)::int, extract(month from current_date)::int, v_month_start_day) - 1;
  else
    v_start := date_trunc('month', current_date)::date;
    v_end := (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::date;
  end if;

  return query
    select
      b.category_id,
      c.name,
      c.emoji,
      c.color,
      b.amount,
      coalesce(sum(t.amount), 0)::numeric(10,2) as spent,
      (b.amount - coalesce(sum(t.amount), 0))::numeric(10,2) as remaining,
      case when b.amount > 0
        then round((coalesce(sum(t.amount), 0) / b.amount * 100)::numeric, 2)
        else 0
      end as percentage
    from public.budgets b
    left join public.categories c on b.category_id = c.id
    left join public.transactions t on t.category_id = b.category_id
      and t.user_id = p_user_id
      and t.type = 'expense'
      and t.date >= v_start
      and t.date <= v_end
    where b.user_id = p_user_id
    group by b.category_id, c.name, c.emoji, c.color, b.amount
    order by percentage desc;
end;
$$;
