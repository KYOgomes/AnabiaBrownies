-- Anabia Brownies — schema inicial (V1)
-- Rode este arquivo no SQL Editor do Supabase (ou via `supabase db push`).

-- Tipos de brownie configuráveis
create table public.brownie_types (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users on delete cascade,
  name        text not null,
  description text,
  price       numeric(10,2) not null default 0 check (price >= 0),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Quantidade produzida/disponível por dia e tipo
create table public.daily_stock (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null default auth.uid() references auth.users on delete cascade,
  date            date not null,
  brownie_type_id uuid not null references public.brownie_types on delete cascade,
  quantity        integer not null default 0 check (quantity >= 0),
  unique (owner_id, date, brownie_type_id)
);

create table public.customers (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users on delete cascade,
  name       text not null,
  phone      text,
  notes      text,
  created_at timestamptz not null default now()
);

create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null default auth.uid() references auth.users on delete cascade,
  customer_id    uuid references public.customers on delete set null,
  date           date not null,
  delivery_time  time,
  location       text,
  notes          text,
  status         text not null default 'pending'
                 check (status in ('pending', 'delivered', 'cancelled')),
  paid           boolean not null default false,
  payment_method text check (payment_method in ('pix', 'cash', 'card')),
  created_at     timestamptz not null default now()
);

-- unit_price guarda o preço no momento da venda
create table public.order_items (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null default auth.uid() references auth.users on delete cascade,
  order_id        uuid not null references public.orders on delete cascade,
  brownie_type_id uuid not null references public.brownie_types on delete restrict,
  quantity        integer not null check (quantity > 0),
  unit_price      numeric(10,2) not null check (unit_price >= 0)
);

-- Despesas (materiais etc). scope = 'day' vale para o dia; 'week' vale para a
-- semana (domingo a sábado) que contém a data.
create table public.expenses (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users on delete cascade,
  date        date not null,
  description text not null,
  amount      numeric(10,2) not null check (amount >= 0),
  scope       text not null default 'day' check (scope in ('day', 'week')),
  created_at  timestamptz not null default now()
);

create index on public.daily_stock (owner_id, date);
create index on public.orders (owner_id, date);
create index on public.order_items (order_id);
create index on public.expenses (owner_id, date);

-- Total de cada pedido (respeita o RLS de quem consulta)
create view public.order_totals with (security_invoker = true) as
select
  o.id,
  o.owner_id,
  o.customer_id,
  o.date,
  o.status,
  o.paid,
  coalesce(sum(i.quantity * i.unit_price), 0)::numeric(10,2) as total,
  coalesce(sum(i.quantity), 0)::integer as units
from public.orders o
left join public.order_items i on i.order_id = o.id
group by o.id;

-- Row Level Security: cada usuário só enxerga os próprios dados
alter table public.brownie_types enable row level security;
alter table public.daily_stock enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.expenses enable row level security;

create policy "owner_all" on public.brownie_types for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "owner_all" on public.daily_stock for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "owner_all" on public.customers for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "owner_all" on public.orders for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "owner_all" on public.order_items for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "owner_all" on public.expenses for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
