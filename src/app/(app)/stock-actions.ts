"use server";

import { revalidatePath } from "next/cache";
import { isISODate } from "@/lib/dates";
import { requireUser } from "@/lib/supabase/server";

export async function saveStock(date: string, formData: FormData) {
  if (!isISODate(date)) return;
  const { supabase, user } = await requireUser();

  const upserts: { owner_id: string; date: string; brownie_type_id: string; quantity: number }[] = [];
  const removals: string[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("stock_")) continue;
    const typeId = key.slice(6);
    const quantity = Math.max(0, Math.floor(Number(value) || 0));
    if (quantity > 0) upserts.push({ owner_id: user.id, date, brownie_type_id: typeId, quantity });
    else removals.push(typeId);
  }

  if (upserts.length) {
    await supabase
      .from("daily_stock")
      .upsert(upserts, { onConflict: "owner_id,date,brownie_type_id" });
  }
  if (removals.length) {
    await supabase.from("daily_stock").delete().eq("date", date).in("brownie_type_id", removals);
  }
  revalidatePath("/", "layout");
}
