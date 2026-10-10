-- Projetos novos do Supabase não expõem tabelas à API automaticamente.
-- Libera acesso apenas para usuários logados (o RLS continua filtrando por dono).
grant usage on schema public to authenticated;

grant select, insert, update, delete on
  public.brownie_types,
  public.daily_stock,
  public.customers,
  public.orders,
  public.order_items,
  public.expenses
to authenticated;

grant select on public.order_totals to authenticated;
