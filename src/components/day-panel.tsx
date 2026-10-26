import Link from "next/link";
import { ExpenseForm } from "@/app/(app)/despesas/expense-form";
import { addDays, formatLong, monthOf, weekEnd, weekStart } from "@/lib/dates";
import { getSummary } from "@/lib/finance";
import { brl } from "@/lib/format";
import { getCustomerNames } from "@/lib/customers";
import { getStock } from "@/lib/stock";
import { createClient } from "@/lib/supabase/server";
import { ORDER_SELECT, type BrownieType, type Expense, type Order, type PriceOption } from "@/lib/types";
import { ExpenseList } from "./expense-list";
import { OrderRow } from "./order-row";
import { QuickOrderForm } from "./quick-order-form";
import { StockCard } from "./stock-card";
import { SummaryCard } from "./summary-card";

export async function DayPanel({ date, today }: { date: string; today: string }) {
  const supabase = await createClient();

  const [summary, stock, { data: types }, { data: options }, customers, { data: orders }, { data: expenses }] =
    await Promise.all([
      getSummary(supabase, { from: date, to: date }),
      getStock(supabase, date, date),
      supabase
        .from("brownie_types")
        .select("id, name, description, price, active")
        .order("name")
        .overrideTypes<BrownieType[], { merge: false }>(),
      supabase
        .from("price_options")
        .select("id, name, quantity, price, active")
        .eq("active", true)
        .order("quantity")
        .overrideTypes<PriceOption[], { merge: false }>(),
      getCustomerNames(supabase),
      supabase
        .from("orders")
        .select(ORDER_SELECT)
        .eq("date", date)
        .order("created_at")
        .overrideTypes<Order[], { merge: false }>(),
      supabase
        .from("expenses")
        .select("id, date, description, amount, scope")
        .or(`and(scope.eq.day,date.eq.${date}),and(scope.eq.week,date.gte.${weekStart(date)},date.lte.${weekEnd(date)})`)
        .order("created_at")
        .overrideTypes<Expense[], { merge: false }>(),
    ]);

  const rows = (types ?? [])
    .map((t) => ({ ...t, ...(stock.get(`${date}|${t.id}`) ?? { available: 0, sold: 0 }) }))
    .filter((t) => t.active || t.available > 0 || t.sold > 0);
  const available = rows.reduce((n, r) => n + r.available, 0);
  const sold = rows.reduce((n, r) => n + r.sold, 0);
  const nav = (d: string) => `/?mes=${monthOf(d)}&dia=${d}`;

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-semibold first-letter:uppercase">{formatLong(date)}</h2>
          {date === today && <p className="text-sm font-medium text-accent">Hoje</p>}
        </div>
        <Link href={nav(addDays(date, -1))} scroll={false} prefetch={false} className="btn-ghost h-9 w-9 p-0" aria-label="Dia anterior">‹</Link>
        <Link href={nav(addDays(date, 1))} scroll={false} prefetch={false} className="btn-ghost h-9 w-9 p-0" aria-label="Próximo dia">›</Link>
      </div>

      <dl className="mb-4 grid grid-cols-4 gap-2 text-center">
        {[
          ["Disponíveis", String(available)],
          ["Vendidos", String(sold)],
          ["Vendido", brl(summary.revenue)],
          ["Recebido", brl(summary.received)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-surface px-1 py-2 ring-1 ring-border">
            <dd className="text-sm font-semibold tabular-nums">{value}</dd>
            <dt className="text-[11px] text-muted">{label}</dt>
          </div>
        ))}
      </dl>

      <StockCard
        key={date}
        date={date}
        rows={rows.map((r) => ({ id: r.id, name: r.name, available: r.available, sold: r.sold }))}
      />

      <div className="mt-6 overflow-hidden rounded-2xl border-2 border-primary/25 bg-surface">
        <div className="flex items-center gap-2 bg-primary px-4 py-2.5 text-primary-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20 text-sm font-bold">+</span>
          <h3 className="font-semibold">Lançar pedido</h3>
        </div>
        <div className="p-4">
          <QuickOrderForm
            key={date}
            date={date}
            types={rows.filter((r) => r.active).map((r) => ({ id: r.id, name: r.name, left: r.available - r.sold }))}
            options={(options ?? []).map((o) => ({ id: o.id, name: o.name, price: Number(o.price), quantity: o.quantity }))}
            customers={customers}
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h3 className="font-display text-lg font-semibold">
            Pedidos do dia
            {orders && orders.length > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 align-middle font-sans text-xs font-semibold text-primary">
                {orders.length}
              </span>
            )}
          </h3>
          {orders && orders.length > 0 && (
            <span className="text-sm text-muted">
              {orders.filter((o) => o.paid).length} de {orders.length} pagos
            </span>
          )}
        </div>
        <div className="card py-1">
          {orders && orders.length > 0 ? (
            <ul className="divide-y divide-border">
              {orders.map((o) => <OrderRow key={o.id} order={o} />)}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-muted">Nenhum pedido lançado neste dia.</p>
          )}
        </div>
      </div>

      <details className="card mt-6">
        <summary className="cursor-pointer font-semibold">Despesas e lucro do dia</summary>
        <div className="mt-3 space-y-4">
          <SummaryCard title="Resultado do dia" summary={summary} hint="Inclui 1/7 das despesas lançadas para a semana." />
          <ExpenseList expenses={expenses ?? []} />
          <ExpenseForm key={date} date={date} />
        </div>
      </details>
    </section>
  );
}
