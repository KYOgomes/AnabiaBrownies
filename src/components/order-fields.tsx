"use client";

import { useState } from "react";
import { brl } from "@/lib/format";

export type TypeOption = { id: string; name: string; left?: number | null };
export type SaleOption = { id: string; name: string; price: number; quantity: number };

/**
 * Campos opção / sabores / nome, usados no formulário rápido e na edição.
 * Uma opção com N brownies mostra N seletores de sabor (ex.: 2 por R$ 12 com
 * um de cada sabor).
 */
export function OrderFields({
  types,
  options,
  customers,
  defaults,
  idPrefix,
}: {
  types: TypeOption[];
  options: SaleOption[];
  customers: string[];
  defaults?: { flavors?: string[]; optionId?: string; name?: string };
  idPrefix: string;
}) {
  const single = types.length === 1 ? types[0].id : "";
  const [optionId, setOptionId] = useState(defaults?.optionId ?? options[0]?.id ?? "");
  const [flavors, setFlavors] = useState<string[]>(defaults?.flavors ?? []);
  const quantity = options.find((o) => o.id === optionId)?.quantity ?? 1;

  const flavorAt = (i: number) => flavors[i] ?? flavors[0] ?? single;
  const setFlavor = (i: number, id: string) =>
    setFlavors((prev) => {
      const next = Array.from({ length: quantity }, (_, j) => prev[j] ?? prev[0] ?? single);
      next[i] = id;
      // Mudar o primeiro sabor arrasta os demais que ainda estavam iguais a ele
      if (i === 0) for (let j = 1; j < quantity; j++) if (!prev[j] || prev[j] === prev[0]) next[j] = id;
      return next;
    });

  return (
    <>
      <div>
        <label className="label" htmlFor={`${idPrefix}-option`}>Opção</label>
        <select
          id={`${idPrefix}-option`}
          name="price_option_id"
          required
          value={optionId}
          onChange={(e) => setOptionId(e.target.value)}
          className="input"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} · {brl(o.price)}
            </option>
          ))}
        </select>
      </div>
      <div className={quantity > 1 ? "grid grid-cols-2 gap-2" : ""}>
        {Array.from({ length: quantity }, (_, i) => (
          <div key={i}>
            <label className="label" htmlFor={`${idPrefix}-type-${i}`}>
              {quantity > 1 ? `Sabor ${i + 1}` : "Sabor"}
            </label>
            <select
              id={`${idPrefix}-type-${i}`}
              name="brownie_type_id"
              required
              value={flavorAt(i)}
              onChange={(e) => setFlavor(i, e.target.value)}
              className="input"
            >
              <option value="" disabled>Escolha…</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.left != null ? ` (restam ${Math.max(t.left, 0)})` : ""}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div>
        <label className="label" htmlFor={`${idPrefix}-name`}>Quem comprou</label>
        <input
          id={`${idPrefix}-name`}
          name="customer_name"
          list={`${idPrefix}-customers`}
          defaultValue={defaults?.name ?? ""}
          placeholder="Nome"
          autoComplete="off"
          className="input"
        />
        <datalist id={`${idPrefix}-customers`}>
          {customers.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
    </>
  );
}
