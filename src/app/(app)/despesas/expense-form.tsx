"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  addMonths,
  formatMonth,
  formatShort,
  monthGrid,
  monthOf,
  weekEnd,
  weekStart,
} from "@/lib/dates";
import { submitWithoutReset } from "@/lib/use-keep-form-action";
import { addExpense } from "./actions";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function ExpenseForm({ date }: { date: string }) {
  const [state, action, pending] = useActionState(addExpense, null);
  const [scope, setScope] = useState<"day" | "week">("day");
  const [selected, setSelected] = useState(date);
  const [month, setMonth] = useState(monthOf(date));
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.ok || !formRef.current) return;
    const form = formRef.current;
    (form.elements.namedItem("description") as HTMLInputElement).value = "";
    (form.elements.namedItem("amount") as HTMLInputElement).value = "";
  }, [state]);

  const ws = weekStart(selected);
  const we = weekEnd(selected);
  const inSelection = (d: string) => (scope === "week" ? d >= ws && d <= we : d === selected);

  return (
    <form ref={formRef} onSubmit={submitWithoutReset(action)} className="space-y-3">
      <input type="hidden" name="date" value={scope === "week" ? ws : selected} />
      <input type="hidden" name="scope" value={scope} />

      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Essa compra é para">
        {(
          [
            ["day", "O dia"],
            ["week", "A semana"],
          ] as const
        ).map(([v, l]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={scope === v}
            onClick={() => setScope(v)}
            className={scope === v ? "btn-primary" : "btn-ghost"}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border p-2">
        <div className="mb-1 flex items-center justify-between">
          <button type="button" onClick={() => setMonth(addMonths(month, -1))} className="btn-ghost h-8 w-8 p-0" aria-label="Mês anterior">‹</button>
          <span className="text-sm font-semibold first-letter:uppercase">{formatMonth(month)}</span>
          <button type="button" onClick={() => setMonth(addMonths(month, 1))} className="btn-ghost h-8 w-8 p-0" aria-label="Próximo mês">›</button>
        </div>
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-muted">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="py-1">{d}</span>
          ))}
        </div>
        {monthGrid(month).map((week) => {
          const weekSelected = scope === "week" && week[0] === ws;
          return (
            <div key={week[0]} className={`grid grid-cols-7 rounded-lg ${weekSelected ? "bg-primary text-primary-foreground" : ""}`}>
              {week.map((d) => {
                const on = inSelection(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelected(d)}
                    className={`h-9 rounded-lg text-sm tabular-nums ${monthOf(d) === month ? "" : "opacity-40"} ${
                      scope === "day" && on ? "bg-primary font-semibold text-primary-foreground" : ""
                    } ${weekSelected ? "font-semibold" : "hover:bg-background"}`}
                  >
                    {Number(d.slice(8))}
                  </button>
                );
              })}
            </div>
          );
        })}
        <p className="mt-2 text-center text-sm">
          {scope === "week" ? (
            <>Semana de <strong>{formatShort(ws)}</strong> a <strong>{formatShort(we)}</strong></>
          ) : (
            <>Dia <strong>{formatShort(selected)}</strong></>
          )}
        </p>
      </div>

      <div className="grid grid-cols-[1fr_7.5rem] gap-3">
        <div>
          <label className="label" htmlFor="exp-desc">Descrição</label>
          <input id="exp-desc" name="description" placeholder="Ex.: chocolate, ovos" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="exp-amount">Valor (R$)</label>
          <input id="exp-amount" name="amount" inputMode="decimal" placeholder="0,00" required className="input" />
        </div>
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Salvando…" : "Adicionar despesa"}
      </button>
    </form>
  );
}
