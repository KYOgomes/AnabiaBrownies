import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Nomes já usados em pedidos, para o autocompletar. */
export async function getCustomerNames(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("orders")
    .select("customer_name")
    .not("customer_name", "is", null)
    .order("created_at", { ascending: false })
    .limit(1000);
  const names = new Map<string, string>();
  for (const o of data ?? []) {
    const key = o.customer_name.trim().toLowerCase();
    if (!names.has(key)) names.set(key, o.customer_name.trim());
  }
  return [...names.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
}
