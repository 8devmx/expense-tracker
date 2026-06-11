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
