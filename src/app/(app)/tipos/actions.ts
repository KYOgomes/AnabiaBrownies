"use server";

import { revalidatePath } from "next/cache";
import { parseMoney, str } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";

export type TypeFormState = { error?: string; ok?: number } | null;

export async function saveType(_prev: TypeFormState, formData: FormData): Promise<TypeFormState> {
  const { supabase } = await requireUser();
  const id = str(formData.get("id"));
  const name = str(formData.get("name"));
  if (!name) return { error: "Informe o nome." };

  const data = {
    name,
    description: str(formData.get("description")),
    active: id ? formData.get("active") === "on" : true,
  };
  const { error } = id
    ? await supabase.from("brownie_types").update(data).eq("id", id)
    : await supabase.from("brownie_types").insert(data);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: Date.now() };
}

export async function deleteType(_prev: TypeFormState, formData: FormData): Promise<TypeFormState> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("brownie_types").delete().eq("id", String(formData.get("id")));
  if (error) {
    return {
      error:
        error.code === "23503"
          ? "Este tipo já tem vendas registradas. Desative-o em vez de excluir."
          : error.message,
    };
  }
  revalidatePath("/", "layout");
  return { ok: Date.now() };
}

export async function saveOption(_prev: TypeFormState, formData: FormData): Promise<TypeFormState> {
  const { supabase } = await requireUser();
  const id = str(formData.get("id"));
  const name = str(formData.get("name"));
  const quantity = Math.floor(Number(formData.get("quantity")));
  const price = parseMoney(formData.get("price"));
  if (!name) return { error: "Informe o nome." };
  if (!(quantity > 0)) return { error: "Quantidade inválida." };
  if (!Number.isFinite(price) || price < 0) return { error: "Preço inválido." };

  const data = { name, quantity, price, active: id ? formData.get("active") === "on" : true };
  const { error } = id
    ? await supabase.from("price_options").update(data).eq("id", id)
    : await supabase.from("price_options").insert(data);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: Date.now() };
}

export async function deleteOption(_prev: TypeFormState, formData: FormData): Promise<TypeFormState> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("price_options").delete().eq("id", String(formData.get("id")));
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: Date.now() };
}
