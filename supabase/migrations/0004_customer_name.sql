-- O nome de quem comprou passa a ficar direto no pedido.
-- (A tabela customers fica no banco para uma versão futura, mas não é mais usada.)
alter table public.orders add column customer_name text;

update public.orders o
set customer_name = c.name
from public.customers c
where c.id = o.customer_id;
