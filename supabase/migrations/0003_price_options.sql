-- Opções de venda (ex.: "1 brownie" por R$ 7, "2 brownies" por R$ 12).
-- O preço do pedido passa a vir da opção escolhida, não do sabor.

create table public.price_options (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users on delete cascade,
  name       text not null,
  quantity   integer not null check (quantity > 0),
  price      numeric(10,2) not null check (price >= 0),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.price_options enable row level security;
create policy "owner_all" on public.price_options for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
grant select, insert, update, delete on public.price_options to authenticated;

-- Opções iniciais para os usuários já existentes
insert into public.price_options (owner_id, name, quantity, price)
select u.id, o.name, o.quantity, o.price
from auth.users u
cross join (values ('1 brownie', 1, 7.00), ('2 brownies', 2, 12.00)) as o(name, quantity, price);

-- Cada item guarda a opção escolhida e o valor total cobrado por ele
alter table public.order_items
  add column price_option_id uuid references public.price_options on delete set null,
  add column total numeric(10,2);
update public.order_items set total = quantity * unit_price;
alter table public.order_items
  alter column total set not null,
  add constraint order_items_total_check check (total >= 0);

drop view public.order_totals;
alter table public.order_items drop column unit_price;

create view public.order_totals with (security_invoker = true) as
select
  o.id,
  o.owner_id,
  o.customer_id,
  o.date,
  o.status,
  o.paid,
  coalesce(sum(i.total), 0)::numeric(10,2) as total,
  coalesce(sum(i.quantity), 0)::integer as units
from public.orders o
left join public.order_items i on i.order_id = o.id
group by o.id;

grant select on public.order_totals to authenticated;
