"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { deleteOrder, setOrderPaid } from "@/app/(app)/pedido/actions";
import { brl } from "@/lib/format";
import { orderFlavors, orderTotal, type Order } from "@/lib/types";

export function OrderRow({ order, showDate }: { order: Order; showDate?: boolean }) {
  const [paid, setPaid] = useOptimistic(order.paid);
  const [, startTransition] = useTransition();
  const item = order.order_items[0];
  const cancelled = order.status === "cancelled";

  const togglePaid = (value: boolean) =>
    startTransition(async () => {
      setPaid(value);
      await setOrderPaid(order.id, value);
    });

  return (
    <li className={`flex items-center gap-3 py-3 ${cancelled ? "line-through opacity-40" : ""}`}>
      <input
        type="checkbox"
        checked={paid}
        onChange={(e) => togglePaid(e.target.checked)}
        className="h-6 w-6 shrink-0 accent-[var(--success)]"
        aria-label={`Pago: ${order.customer_name ?? "venda avulsa"}`}
      />
      <Link
        href={`/pedido/${order.id}`}
        prefetch={false}
        className={`min-w-0 flex-1 transition-opacity ${paid ? "opacity-40" : ""}`}
      >
        <p className="truncate font-semibold">{order.customer_name ?? "Venda avulsa"}</p>
        <p className="truncate text-sm text-muted">
          {showDate && `${order.date.split("-").reverse().slice(0, 2).join("/")} · `}
          {orderFlavors(order)} · {item?.price_options?.name ?? `${order.order_items.reduce((n, i) => n + i.quantity, 0)} un.`}
          {order.delivery_time && ` · ${order.delivery_time.slice(0, 5)}`}
        </p>
      </Link>
      <span className={`font-semibold tabular-nums ${paid ? "text-success" : ""}`}>{brl(orderTotal(order))}</span>
      <button
        type="button"
        onClick={() => {
          if (window.confirm(`Excluir o pedido de ${order.customer_name ?? "venda avulsa"}?`)) {
            startTransition(() => deleteOrder(order.id));
          }
        }}
        className="btn-ghost h-8 w-8 shrink-0 p-0 text-muted"
        aria-label="Excluir pedido"
      >
        ×
      </button>
    </li>
  );
}
