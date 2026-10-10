"use server";

import { revalidatePath } from "next/cache";
import { isISODate } from "@/lib/dates";
import { parseMoney, str } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";

export type ExpenseFormState = { error?: string; ok?: number } | null;

export async function addExpense(_prev: ExpenseFormState, formData: FormData): Promise<ExpenseFormState> {
  const { supabase } = await requireUser();
  const date = String(formData.get("date") ?? "");
  const description = str(formData.get("description"));
  const amount = parseMoney(formData.get("amount"));
  const scope = formData.get("scope") === "week" ? "week" : "day";

  if (!isISODate(date)) return { error: "Data inválida." };
  if (!description) return { error: "Descreva a despesa." };
  if (!Number.isFinite(amount) || amount < 0) return { error: "Valor inválido." };

  const { error } = await supabase.from("expenses").insert({ date, description, amount, scope });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: Date.now() };
}

export async function deleteExpense(id: string) {
  const { supabase } = await requireUser();
  await supabase.from("expenses").delete().eq("id", id);
  revalidatePath("/", "layout");
}
