"use client";

import { useActionState } from "react";
import { OrderFields, type SaleOption, type TypeOption } from "@/components/order-fields";
import { STATUS_LABELS } from "@/lib/format";
import type { Order } from "@/lib/types";
import { submitWithoutReset } from "@/lib/use-keep-form-action";
import { saveOrder } from "../actions";

export function EditOrderForm({
  order,
  types,
  options,
  customers,
}: {
  order: Order;
  types: TypeOption[];
  options: SaleOption[];
  customers: string[];
}) {
  const [state, action, pending] = useActionState(saveOrder, null);
  const item = order.order_items[0];

  return (
    <form onSubmit={submitWithoutReset(action)} className="space-y-4">
      <input type="hidden" name="id" value={order.id} />
      <div className="card space-y-3">
        <OrderFields
          types={types}
          options={options}
          customers={customers}
          idPrefix="edit"
          defaults={{
            flavors: order.order_items.flatMap((i) => Array<string>(i.quantity).fill(i.brownie_type_id)),
            optionId: item?.price_option_id ?? undefined,
            name: order.customer_name ?? undefined,
          }}
        />
        <label className="flex items-center gap-2 font-medium">
          <input type="checkbox" name="paid" defaultChecked={order.paid} className="h-6 w-6 accent-[var(--success)]" />
          Pago
        </label>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Entrega (opcional)</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="date">Data</label>
            <input id="date" name="date" type="date" required defaultValue={order.date} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="delivery_time">Horário</label>
            <input id="delivery_time" name="delivery_time" type="time" defaultValue={order.delivery_time?.slice(0, 5) ?? ""} className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="location">Local</label>
          <input id="location" name="location" defaultValue={order.location ?? ""} placeholder="Ex.: portaria, retirada…" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="notes">Observações</label>
          <textarea id="notes" name="notes" rows={2} defaultValue={order.notes ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={order.status} className="input">
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {state?.error && <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{state.error}</p>}
      {state?.warning ? (
        <div className="space-y-2 rounded-xl border border-accent/40 bg-accent/10 p-3">
          <p className="text-sm">{state.warning}</p>
          <button type="submit" name="confirm" value="1" disabled={pending} className="btn-primary w-full">
            {pending ? "Salvando…" : "Salvar mesmo assim"}
          </button>
        </div>
      ) : (
        <button type="submit" disabled={pending} className="btn-primary w-full py-3">
          {pending ? "Salvando…" : "Salvar alterações"}
        </button>
      )}
    </form>
  );
}
