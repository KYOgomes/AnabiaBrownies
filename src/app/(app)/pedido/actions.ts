"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isISODate } from "@/lib/dates";
import { str } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

export type OrderFormState = { error?: string; warning?: string; ok?: number } | null;

type Supabase = Awaited<ReturnType<typeof requireUser>>["supabase"];

const STATUSES: OrderStatus[] = ["pending", "delivered", "cancelled"];

/**
 * Cria (formulário rápido do dia) ou edita (página do pedido) um pedido de um
 * sabor + uma opção de venda. Campos de entrega/status só são alterados quando
 * vêm no formulário.
 */
export async function saveOrder(_prev: OrderFormState, formData: FormData): Promise<OrderFormState> {
  const { supabase } = await requireUser();

  const id = str(formData.get("id"));
  const date = String(formData.get("date") ?? "");
  const optionId = str(formData.get("price_option_id"));
  const flavors = formData.getAll("brownie_type_id").map(String).filter(Boolean);
  if (!isISODate(date)) return { error: "Data inválida." };
  if (!optionId) return { error: "Escolha a opção." };

  const { data: option } = await supabase
    .from("price_options")
    .select("id, quantity, price")
    .eq("id", optionId)
    .maybeSingle();
  if (!option) return { error: "Opção inválida." };
  if (flavors.length !== option.quantity) return { error: "Escolha o sabor de cada brownie." };

  // Quantos de cada sabor (ex.: 2 por R$ 12 com um de cada → { ninho: 1, nutella: 1 })
  const counts = new Map<string, number>();
  for (const f of flavors) counts.set(f, (counts.get(f) ?? 0) + 1);

  const orderData: Record<string, unknown> = { date, paid: formData.get("paid") === "on" };
  for (const key of ["customer_name", "delivery_time", "location", "notes"]) {
    if (formData.has(key)) orderData[key] = str(formData.get(key));
  }
  const status = String(formData.get("status") ?? "");
  if ((STATUSES as string[]).includes(status)) orderData.status = status;

  // Aviso de estoque (não bloqueia: pede confirmação)
  if (orderData.status !== "cancelled" && formData.get("confirm") !== "1") {
    const warning = await stockWarning(supabase, date, counts, id);
    if (warning) return { warning };
  }

  let orderId = id;
  let total = Number(option.price);

  if (id) {
    const { error } = await supabase.from("orders").update(orderData).eq("id", id);
    if (error) return { error: error.message };
    // Mantém o valor cobrado originalmente se a opção não mudou
    const { data: old } = await supabase.from("order_items").select("price_option_id, total").eq("order_id", id);
    if (old?.length && old.every((i) => i.price_option_id === optionId)) {
      total = old.reduce((sum, i) => sum + Number(i.total), 0);
    }
    await supabase.from("order_items").delete().eq("order_id", id);
  } else {
    const { data, error } = await supabase.from("orders").insert(orderData).select("id").single();
    if (error) return { error: error.message };
    orderId = data.id;
  }

  // Divide o valor entre os sabores, em centavos; o resto do arredondamento fica no primeiro
  const cents = Math.round(total * 100);
  const entries = [...counts];
  const shares = entries.map(([, n]) => Math.floor((cents * n) / option.quantity));
  shares[0] += cents - shares.reduce((a, b) => a + b, 0);

  const { error: itemError } = await supabase.from("order_items").insert(
    entries.map(([typeId, n], i) => ({
      order_id: orderId,
      brownie_type_id: typeId,
      price_option_id: optionId,
      quantity: n,
      total: shares[i] / 100,
    })),
  );
  if (itemError) return { error: itemError.message };

  revalidatePath("/", "layout");
  if (id) redirect(`/?dia=${date}`);
  return { ok: Date.now() };
}

async function stockWarning(
  supabase: Supabase,
  date: string,
  counts: Map<string, number>,
  excludeOrderId: string | null,
) {
  const typeIds = [...counts.keys()];
  const [{ data: stock }, { data: sold }, { data: types }] = await Promise.all([
    supabase.from("daily_stock").select("brownie_type_id, quantity").eq("date", date).in("brownie_type_id", typeIds),
    supabase
      .from("order_items")
      .select("brownie_type_id, quantity, orders!inner(id, date, status)")
      .in("brownie_type_id", typeIds)
      .eq("orders.date", date)
      .neq("orders.status", "cancelled"),
    supabase.from("brownie_types").select("id, name").in("id", typeIds),
  ]);

  const problems: string[] = [];
  for (const [typeId, wanted] of counts) {
    const available = stock?.find((s) => s.brownie_type_id === typeId)?.quantity ?? 0;
    const used = (sold ?? [])
      .filter((s) => s.brownie_type_id === typeId && (s.orders as unknown as { id: string }).id !== excludeOrderId)
      .reduce((n, s) => n + s.quantity, 0);
    const left = available - used;
    if (wanted > left) {
      const name = types?.find((t) => t.id === typeId)?.name ?? "este sabor";
      problems.push(left > 0 ? `${name}: resta${left === 1 ? "" : "m"} só ${left}` : `${name}: não resta nenhum`);
    }
  }

  return problems.length ? `Estoque do dia — ${problems.join("; ")}. Salvar mesmo assim?` : null;
}

export async function setOrderPaid(id: string, paid: boolean) {
  const { supabase } = await requireUser();
  await supabase.from("orders").update({ paid }).eq("id", id);
  revalidatePath("/", "layout");
}

export async function deleteOrder(id: string, redirectTo?: string) {
  const { supabase } = await requireUser();
  await supabase.from("orders").delete().eq("id", id);
  revalidatePath("/", "layout");
  if (redirectTo) redirect(redirectTo);
}
