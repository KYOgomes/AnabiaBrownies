import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { daysBetween, weekEnd, weekStart } from "./dates";

export type Summary = {
  revenue: number; // pedidos não cancelados
  received: number; // desses, os já pagos
  expenses: number;
  profit: number;
  units: number;
  orders: number;
};

type Range = { from: string; to: string };

/**
 * Receita, despesas e lucro de um período (ou de todo o histórico, sem range).
 *
 * Despesas "do dia" contam integralmente na data. Despesas "da semana" são
 * rateadas igualmente pelos 7 dias da semana (dom–sáb) da data, então:
 * - no resumo do dia entra 1/7 do valor;
 * - no resumo da semana entra o valor inteiro.
 */
export async function getSummary(supabase: SupabaseClient, range?: Range): Promise<Summary> {
  let ordersQ = supabase.from("order_totals").select("total, units, paid").neq("status", "cancelled");
  let expensesQ = supabase.from("expenses").select("date, amount, scope");

  if (range) {
    ordersQ = ordersQ.gte("date", range.from).lte("date", range.to);
    // busca as semanas inteiras das pontas para poder ratear as despesas semanais
    expensesQ = expensesQ.gte("date", weekStart(range.from)).lte("date", weekEnd(range.to));
  }

  const [{ data: orders, error: e1 }, { data: expenses, error: e2 }] = await Promise.all([
    ordersQ,
    expensesQ,
  ]);
  if (e1) throw e1;
  if (e2) throw e2;

  let revenue = 0;
  let received = 0;
  let units = 0;
  for (const o of orders ?? []) {
    revenue += Number(o.total);
    units += o.units;
    if (o.paid) received += Number(o.total);
  }

  let expenseTotal = 0;
  for (const e of expenses ?? []) {
    const amount = Number(e.amount);
    if (!range) {
      expenseTotal += amount;
    } else if (e.scope === "day") {
      if (e.date >= range.from && e.date <= range.to) expenseTotal += amount;
    } else {
      const ws = weekStart(e.date);
      const we = weekEnd(e.date);
      const from = ws > range.from ? ws : range.from;
      const to = we < range.to ? we : range.to;
      if (from <= to) expenseTotal += (amount * (daysBetween(from, to) + 1)) / 7;
    }
  }

  return {
    revenue,
    received,
    expenses: expenseTotal,
    profit: revenue - expenseTotal,
    units,
    orders: orders?.length ?? 0,
  };
}
