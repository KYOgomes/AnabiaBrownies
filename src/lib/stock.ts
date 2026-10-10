import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type StockRow = { available: number; sold: number };

/**
 * Disponível e vendido (pedidos não cancelados) por tipo, para um intervalo de
 * datas. Chave: `${date}|${typeId}`.
 */
export async function getStock(
  supabase: SupabaseClient,
  from: string,
  to: string,
  excludeOrderId?: string,
) {
  const [{ data: stock, error: e1 }, { data: items, error: e2 }] = await Promise.all([
    supabase.from("daily_stock").select("date, brownie_type_id, quantity").gte("date", from).lte("date", to),
    supabase
      .from("order_items")
      .select("brownie_type_id, quantity, orders!inner(id, date, status)")
      .gte("orders.date", from)
      .lte("orders.date", to)
      .neq("orders.status", "cancelled"),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;

  const map = new Map<string, StockRow>();
  const row = (key: string) => {
    let r = map.get(key);
    if (!r) map.set(key, (r = { available: 0, sold: 0 }));
    return r;
  };

  for (const s of stock ?? []) row(`${s.date}|${s.brownie_type_id}`).available += s.quantity;
  for (const i of items ?? []) {
    const order = i.orders as unknown as { id: string; date: string };
    if (order.id === excludeOrderId) continue;
    row(`${order.date}|${i.brownie_type_id}`).sold += i.quantity;
  }
  return map;
}
