"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveOrder } from "@/app/(app)/pedido/actions";
import { OrderFields, type SaleOption, type TypeOption } from "./order-fields";
import { submitWithoutReset } from "@/lib/use-keep-form-action";

export function QuickOrderForm({
  date,
  types,
  options,
  customers,
}: {
  date: string;
  types: TypeOption[];
  options: SaleOption[];
  customers: string[];
}) {
  const [state, action, pending] = useActionState(saveOrder, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [dismissed, setDismissed] = useState<typeof state>(null);
  const warning = state?.warning && dismissed !== state ? state.warning : null;

  // Depois de adicionar, limpa só o nome e o "pago" (sabor e opção costumam se repetir)
  useEffect(() => {
    if (!state?.ok || !formRef.current) return;
    const form = formRef.current;
    (form.elements.namedItem("customer_name") as HTMLInputElement).value = "";
    (form.elements.namedItem("paid") as HTMLInputElement).checked = false;
    (form.elements.namedItem("customer_name") as HTMLInputElement).focus();
  }, [state]);

  if (types.length === 0 || options.length === 0) {
    return (
      <p className="text-sm text-muted">
        Para registrar pedidos, cadastre {types.length === 0 ? "um sabor" : "uma opção de venda"} na aba{" "}
        <Link href="/tipos" className="font-semibold text-primary underline">Brownies</Link>.
      </p>
    );
  }

  return (
    <form ref={formRef} onSubmit={submitWithoutReset(action)} className="space-y-3">
      <input type="hidden" name="date" value={date} />
      <OrderFields types={types} options={options} customers={customers} idPrefix={`new-${date}`} />
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 font-medium">
          <input type="checkbox" name="paid" className="h-6 w-6 accent-[var(--success)]" />
          Pago
        </label>
        {!warning && (
          <button type="submit" disabled={pending} className="btn-primary flex-1">
            {pending ? "Adicionando…" : "+ Adicionar pedido"}
          </button>
        )}
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {warning && (
        <div className="space-y-2 rounded-xl border border-accent/40 bg-accent/10 p-3">
          <p className="text-sm">{warning}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setDismissed(state)} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" name="confirm" value="1" disabled={pending} className="btn-primary flex-1">
              {pending ? "Adicionando…" : "Adicionar mesmo assim"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
