import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/supabase/server";
import type { BrownieType, PriceOption } from "@/lib/types";
import { OptionForm } from "./option-form";
import { TypeForm } from "./type-form";

export default async function TypesPage() {
  const { supabase } = await requireUser();
  const [{ data: types }, { data: options }] = await Promise.all([
    supabase
      .from("brownie_types")
      .select("id, name, description, price, active")
      .order("active", { ascending: false })
      .order("name")
      .overrideTypes<BrownieType[], { merge: false }>(),
    supabase
      .from("price_options")
      .select("id, name, quantity, price, active")
      .order("active", { ascending: false })
      .order("quantity")
      .overrideTypes<PriceOption[], { merge: false }>(),
  ]);

  return (
    <>
      <PageHeader title="Brownies" subtitle="Sabores e opções de venda usados nos pedidos." />

      <section>
        <h2 className="mb-1 font-display text-lg font-semibold">Opções de venda</h2>
        <p className="mb-3 text-sm text-muted">
          Quantos brownies e por quanto. Ex.: “1 brownie” por R$ 7, “2 brownies” por R$ 12.
        </p>
        <div className="space-y-3">
          {options?.map((o) => <OptionForm key={o.id} option={o} />)}
          <OptionForm />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-1 font-display text-lg font-semibold">Sabores</h2>
        <p className="mb-3 text-sm text-muted">Aparecem na lista de sabores ao registrar um pedido.</p>
        <div className="space-y-3">
          {types?.map((t) => <TypeForm key={t.id} type={t} />)}
          <TypeForm />
        </div>
      </section>
    </>
  );
}
