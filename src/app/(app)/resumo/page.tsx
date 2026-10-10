import Link from "next/link";
import { BarChart, HBarChart, type Bar } from "@/components/bar-chart";
import { OrderRow } from "@/components/order-row";
import { SubmitButton } from "@/components/submit-button";
import {
  addDays,
  addMonths,
  formatMonth,
  formatShort,
  monthOf,
  monthRange,
  todayISO,
  weekEnd,
  weekStart,
} from "@/lib/dates";
import { getSummary } from "@/lib/finance";
import { brl } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";
import { ORDER_SELECT, orderTotal, type Order } from "@/lib/types";
import { signOut } from "../../login/actions";

const PERIODS = [
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mês" },
  { id: "total", label: "Total" },
] as const;
type Period = (typeof PERIODS)[number]["id"];

const WEEKDAY = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default async function SummaryPage({ searchParams }: PageProps<"/resumo">) {
  const { periodo } = await searchParams;
  const period: Period = PERIODS.some((p) => p.id === periodo) ? (periodo as Period) : "semana";
  const { supabase } = await requireUser();
  const today = todayISO();
  const month = monthOf(today);

  const range =
    period === "hoje"
      ? { from: today, to: today }
      : period === "semana"
        ? { from: weekStart(today), to: weekEnd(today) }
        : period === "mes"
          ? monthRange(month)
          : undefined;

  // Gráfico: vendas por dia (semana/mês) ou por mês nos últimos 6 meses (total)
  const chartFrom = range?.from ?? `${addMonths(month, -5)}-01`;
  const chartTo = range?.to ?? monthRange(month).to;

  let flavorsQ = supabase
    .from("order_items")
    .select("quantity, brownie_type_id, brownie_types(name), orders!inner(date, status)")
    .neq("orders.status", "cancelled");
  if (range) flavorsQ = flavorsQ.gte("orders.date", range.from).lte("orders.date", range.to);

  const [summary, { data: sales }, { data: unpaid }, { data: flavorItems }] = await Promise.all([
    getSummary(supabase, range),
    period === "hoje"
      ? Promise.resolve({ data: [] as { date: string; total: number }[] })
      : supabase
          .from("order_totals")
          .select("date, total")
          .neq("status", "cancelled")
          .gte("date", chartFrom)
          .lte("date", chartTo),
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("paid", false)
      .neq("status", "cancelled")
      .lte("date", today)
      .order("date", { ascending: false })
      .limit(50)
      .overrideTypes<Order[], { merge: false }>(),
    flavorsQ,
  ]);

  // Sabores mais pedidos (em brownies) no período
  const flavorTotals = new Map<string, { label: string; value: number }>();
  for (const i of flavorItems ?? []) {
    const name = (i.brownie_types as unknown as { name: string } | null)?.name ?? "?";
    const f = flavorTotals.get(i.brownie_type_id) ?? { label: name, value: 0 };
    f.value += i.quantity;
    flavorTotals.set(i.brownie_type_id, f);
  }
  const flavorBars = [...flavorTotals]
    .map(([key, f]) => ({ key, ...f }))
    .sort((a, b) => b.value - a.value);

  const byKey = new Map<string, number>();
  for (const s of sales ?? []) {
    const key = period === "total" ? s.date.slice(0, 7) : s.date;
    byKey.set(key, (byKey.get(key) ?? 0) + Number(s.total));
  }

  let bars: Bar[] = [];
  if (period === "semana" || period === "mes") {
    for (let d = chartFrom; d <= chartTo; d = addDays(d, 1)) {
      const dow = new Date(`${d}T00:00:00Z`).getUTCDay();
      bars.push({
        key: d,
        label: period === "semana" ? WEEKDAY[dow] : String(Number(d.slice(8))),
        tooltip: `${WEEKDAY[dow]} ${formatShort(d)}`,
        value: byKey.get(d) ?? 0,
        highlight: d === today,
      });
    }
  } else if (period === "total") {
    bars = Array.from({ length: 6 }, (_, i) => {
      const m = addMonths(month, i - 5);
      return {
        key: m,
        label: MONTH_SHORT[Number(m.slice(5)) - 1],
        tooltip: formatMonth(m),
        value: byKey.get(m) ?? 0,
        highlight: m === month,
      };
    });
  }

  const periodLabel = {
    hoje: `Hoje · ${formatShort(today)}`,
    semana: `Semana · ${formatShort(weekStart(today))} a ${formatShort(weekEnd(today))}`,
    mes: formatMonth(month),
    total: "Desde o início",
  }[period];

  const margin = summary.revenue > 0 ? Math.round((summary.profit / summary.revenue) * 100) : null;
  const toReceive = summary.revenue - summary.received;
  const unpaidTotal = (unpaid ?? []).reduce((s, o) => s + orderTotal(o), 0);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Resumo</h1>
        <form action={signOut}>
          <SubmitButton className="btn-ghost py-1.5 text-xs">Sair</SubmitButton>
        </form>
      </div>

      <nav className="mb-4 grid grid-cols-4 gap-1 rounded-2xl bg-border/60 p-1" aria-label="Período">
        {PERIODS.map((p) => (
          <Link
            key={p.id}
            href={`/resumo?periodo=${p.id}`}
            scroll={false}
            aria-current={p.id === period ? "page" : undefined}
            className={`rounded-xl py-2 text-center text-sm font-semibold transition ${
              p.id === period ? "bg-surface text-primary shadow-sm" : "text-muted"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </nav>

      {/* Destaque: lucro do período */}
      <section className="rounded-3xl bg-gradient-to-br from-primary to-[#3b2418] p-5 text-primary-foreground shadow-lg shadow-primary/20">
        <p className="text-sm opacity-80 first-letter:uppercase">{periodLabel}</p>
        <p className="mt-3 text-xs font-medium uppercase tracking-wider opacity-70">Lucro</p>
        <p className={`text-5xl font-bold tracking-tight tabular-nums ${summary.profit < 0 ? "text-[#ffb4a6]" : ""}`}>
          {brl(summary.profit)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {margin !== null && (
            <span className="rounded-full bg-primary-foreground/15 px-2.5 py-1 font-semibold">margem {margin}%</span>
          )}
          <span className="rounded-full bg-primary-foreground/15 px-2.5 py-1">
            {summary.units} brownie{summary.units === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-primary-foreground/15 px-2.5 py-1">
            {summary.orders} pedido{summary.orders === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      {/* Composição */}
      <section className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Vendas" value={brl(summary.revenue)} sign="+" tone="text-success" />
        <Stat label="Despesas" value={brl(summary.expenses)} sign="−" tone="text-danger" />
        <Stat label="A receber" value={brl(toReceive)} />
      </section>
      {(period === "hoje" || period === "mes") && summary.expenses > 0 && (
        <p className="mt-2 px-1 text-xs text-muted">
          Despesas semanais entram proporcionalmente aos dias {period === "hoje" ? "(1/7 por dia)" : "do mês"}.
        </p>
      )}

      {/* Gráfico */}
      {bars.length > 0 && (
        <section className="card mt-6">
          <h2 className="mb-4 font-semibold">{period === "total" ? "Vendas por mês" : "Vendas por dia"}</h2>
          <BarChart
            bars={bars}
            caption={period === "total" ? "Últimos 6 meses" : period === "semana" ? "Domingo a sábado" : formatMonth(month)}
          />
        </section>
      )}

      {/* Sabores */}
      <section className="card mt-6">
        <h2 className="font-semibold">Sabores mais pedidos</h2>
        <p className="mb-4 text-xs text-muted first-letter:uppercase">{periodLabel} · em brownies</p>
        {flavorBars.length > 0 ? (
          <HBarChart bars={flavorBars} unit={(n) => `${n} un.`} />
        ) : (
          <p className="text-sm text-muted">Nenhum pedido neste período.</p>
        )}
      </section>

      {/* Não pagos */}
      <section className="mt-6">
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 className="font-display text-lg font-semibold">Ainda não pagos</h2>
          {unpaidTotal > 0 && <span className="text-sm font-semibold text-accent">{brl(unpaidTotal)}</span>}
        </div>
        <div className="card py-1">
          {unpaid && unpaid.length > 0 ? (
            <ul className="divide-y divide-border">
              {unpaid.map((o) => <OrderRow key={o.id} order={o} showDate />)}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-muted">Tudo pago até hoje 🎉</p>
          )}
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, sign, tone }: { label: string; value: string; sign?: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold tabular-nums">
        {sign && <span className={`mr-0.5 ${tone}`}>{sign}</span>}
        <span>{value}</span>
      </p>
    </div>
  );
}
