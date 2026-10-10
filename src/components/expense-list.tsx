import { deleteExpense } from "@/app/(app)/despesas/actions";
import { formatShort, weekEnd, weekStart } from "@/lib/dates";
import { brl } from "@/lib/format";
import type { Expense } from "@/lib/types";
import { SubmitButton } from "./submit-button";

export function ExpenseList({ expenses, showDate }: { expenses: Expense[]; showDate?: boolean }) {
  if (expenses.length === 0) return <p className="text-sm text-muted">Nenhuma despesa.</p>;
  return (
    <ul className="divide-y divide-border">
      {expenses.map((e) => (
        <li key={e.id} className="flex items-center gap-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{e.description}</p>
            <p className="text-xs text-muted">
              {e.scope === "week"
                ? `semana ${formatShort(weekStart(e.date))} a ${formatShort(weekEnd(e.date))}`
                : showDate
                  ? `dia ${formatShort(e.date)}`
                  : "do dia"}
            </p>
          </div>
          <span className="font-semibold">{brl(Number(e.amount))}</span>
          <form action={deleteExpense.bind(null, e.id)}>
            <SubmitButton className="btn-ghost h-8 w-8 p-0 text-muted" aria-label="Excluir despesa" confirmMessage={`Excluir "${e.description}"?`}>
              ×
            </SubmitButton>
          </form>
        </li>
      ))}
    </ul>
  );
}
