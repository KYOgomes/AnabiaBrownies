import Link from "next/link";
import { ExpenseList } from "@/components/expense-list";
import { PageHeader } from "@/components/page-header";
import { addMonths, formatMonth, isMonth, monthOf, monthRange, todayISO } from "@/lib/dates";
import { brl } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";
import type { Expense } from "@/lib/types";
import { ExpenseForm } from "./expense-form";

export default async function ExpensesPage({ searchParams }: PageProps<"/despesas">) {
  const { mes } = await searchParams;
  const today = todayISO();
  const month = typeof mes === "string" && isMonth(mes) ? mes : monthOf(today);
  const { from, to } = monthRange(month);
  const { supabase } = await requireUser();

  const { data } = await supabase
    .from("expenses")
    .select("id, date, description, amount, scope")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .overrideTypes<Expense[], { merge: false }>();
  const expenses = data ?? [];
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <>
      <PageHeader title="Despesas" subtitle="Compras de ingredientes, embalagens etc." />

      <section className="card">
        <ExpenseForm date={today} />
        <p className="mt-3 text-xs text-muted">
          Em “A semana”, toque em qualquer dia para marcar a semana inteira (domingo a sábado). No lucro
          diário, a despesa da semana entra dividida por 7.
        </p>
      </section>

      <section className="card mt-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Link href={`/despesas?mes=${addMonths(month, -1)}`} className="btn-ghost h-9 w-9 p-0" aria-label="Mês anterior">‹</Link>
          <div className="text-center">
            <h2 className="font-display text-lg font-semibold first-letter:uppercase">{formatMonth(month)}</h2>
            <p className="text-sm text-muted">Total: <span className="font-semibold text-foreground">{brl(total)}</span></p>
          </div>
          <Link href={`/despesas?mes=${addMonths(month, 1)}`} className="btn-ghost h-9 w-9 p-0" aria-label="Próximo mês">›</Link>
        </div>
        <ExpenseList expenses={expenses} showDate />
      </section>
    </>
  );
}
