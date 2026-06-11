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
