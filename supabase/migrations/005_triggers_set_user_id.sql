-- Trigger function to automatically set user_id on insert
create or replace function public.set_user_id()
returns trigger
security definer
as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$ language plpgsql;

-- Transactions trigger
drop trigger if exists trg_set_transactions_user_id on public.transactions;
create trigger trg_set_transactions_user_id
  before insert on public.transactions
  for each row
  when (new.user_id is null)
  execute function public.set_user_id();

-- Categories trigger
drop trigger if exists trg_set_categories_user_id on public.categories;
create trigger trg_set_categories_user_id
  before insert on public.categories
  for each row
  when (new.user_id is null)
  execute function public.set_user_id();

-- Ensure id columns always use sequence (never accept client-provided ids)
alter table public.transactions
  alter column id drop identity if exists,
  alter column id add generated always as identity;

alter table public.categories
  alter column id drop identity if exists,
  alter column id add generated always as identity;
