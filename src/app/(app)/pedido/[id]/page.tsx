import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { formatLong, monthOf } from "@/lib/dates";
import { getCustomerNames } from "@/lib/customers";
import { requireUser } from "@/lib/supabase/server";
import { ORDER_SELECT, type BrownieType, type Order, type PriceOption } from "@/lib/types";
import { deleteOrder } from "../actions";
import { EditOrderForm } from "./edit-form";

export default async function EditOrderPage({ params }: PageProps<"/pedido/[id]">) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const [{ data: order }, { data: types }, { data: options }, customers] = await Promise.all([
    supabase.from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle().overrideTypes<Order, { merge: false }>(),
    supabase.from("brownie_types").select("id, name, active").order("name").overrideTypes<BrownieType[], { merge: false }>(),
    supabase.from("price_options").select("id, name, quantity, price, active").order("quantity").overrideTypes<PriceOption[], { merge: false }>(),
    getCustomerNames(supabase),
  ]);
  if (!order) notFound();

  const item = order.order_items[0];
  const back = `/?mes=${monthOf(order.date)}&dia=${order.date}`;

  return (
    <>
      <PageHeader title="Editar pedido" subtitle={formatLong(order.date)} back={back} />
      <EditOrderForm
        order={order}
        types={(types ?? []).filter((t) => t.active || order.order_items.some((i) => i.brownie_type_id === t.id))}
        options={(options ?? [])
          .filter((o) => o.active || o.id === item?.price_option_id)
          .map((o) => ({ id: o.id, name: o.name, price: Number(o.price), quantity: o.quantity }))}
        customers={customers}
      />
      <form action={deleteOrder.bind(null, order.id, back)} className="mt-4">
        <SubmitButton className="btn-danger w-full" pendingText="Excluindo…" confirmMessage="Excluir este pedido?">
          Excluir pedido
        </SubmitButton>
      </form>
    </>
  );
}
