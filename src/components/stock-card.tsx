"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { saveStock } from "@/app/(app)/stock-actions";

type Row = { id: string; name: string; available: number; sold: number };

export function StockCard({ date, rows }: { date: string; rows: Row[] }) {
  const hasStock = rows.some((r) => r.available > 0);
  const [editing, setEditing] = useState(!hasStock);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const anyStock = [...fd.values()].some((v) => Number(v) > 0);
    startTransition(async () => {
      await saveStock(date, fd);
      if (anyStock) setEditing(false);
    });
  };

  return (
    <div className="card">
      <h3 className="mb-3 font-semibold">Brownies disponíveis</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">
          Nenhum sabor cadastrado.{" "}
          <Link href="/tipos" className="font-semibold text-primary underline">Cadastrar sabores</Link>
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-2">
          {rows.map((r) => {
            const left = r.available - r.sold;
            return (
              <div key={r.id} className="flex items-center gap-3">
                <label htmlFor={`stock_${r.id}`} className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{r.name}</span>
                  <span className={`text-xs ${left < 0 ? "font-semibold text-danger" : "text-muted"}`}>
                    {r.sold} vendido{r.sold === 1 ? "" : "s"} · {left} restante{Math.abs(left) === 1 ? "" : "s"}
                  </span>
                </label>
                {editing ? (
                  <input
                    id={`stock_${r.id}`}
                    name={`stock_${r.id}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    defaultValue={r.available || ""}
                    placeholder="0"
                    className="input w-20 text-center"
                  />
                ) : (
                  <span className="flex h-11 w-20 items-center justify-center rounded-xl border-2 border-primary bg-primary/5 text-lg font-bold text-primary tabular-nums">
                    {r.available}
                  </span>
                )}
              </div>
            );
          })}
          {editing ? (
            <div className="flex gap-2">
              {hasStock && (
                <button type="button" onClick={() => setEditing(false)} className="btn-ghost">
                  Cancelar
                </button>
              )}
              <button type="submit" disabled={pending} className="btn-primary flex-1">
                {pending ? "Salvando…" : "Salvar quantidade"}
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setEditing(true)} className="btn-ghost w-full">
              ✎ Editar
            </button>
          )}
        </form>
      )}
    </div>
  );
}
