import type { Summary } from "@/lib/finance";
import { brl } from "@/lib/format";

export function SummaryCard({ title, summary, hint }: { title: string; summary: Summary; hint?: string }) {
  const positive = summary.profit >= 0;
  return (
    <section className="card">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-muted">{title}</h2>
        <span className="text-xs text-muted">
          {summary.units} brownie{summary.units === 1 ? "" : "s"} · {summary.orders} pedido
          {summary.orders === 1 ? "" : "s"}
        </span>
      </div>
      <p className={`mt-1 font-display text-3xl font-semibold ${positive ? "text-success" : "text-danger"}`}>
        {brl(summary.profit)}
      </p>
      <p className="text-xs text-muted">lucro</p>
      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-sm">
        <div>
          <dt className="text-xs text-muted">Vendas</dt>
          <dd className="font-semibold">{brl(summary.revenue)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Despesas</dt>
          <dd className="font-semibold">{brl(summary.expenses)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">A receber</dt>
          <dd className="font-semibold">{brl(summary.revenue - summary.received)}</dd>
        </div>
      </dl>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </section>
  );
}
