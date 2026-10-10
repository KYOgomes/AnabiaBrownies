"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/submit-button";
import type { PriceOption } from "@/lib/types";
import { deleteOption, saveOption } from "./actions";

export function OptionForm({ option }: { option?: PriceOption }) {
  const [state, action] = useActionState(saveOption, null);
  const [delState, delAction] = useActionState(deleteOption, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && !option) formRef.current?.reset();
  }, [state, option]);

  const error = state?.error ?? delState?.error;
  const p = `opt-${option?.id ?? "new"}`;

  return (
    <div className={`card ${option && !option.active ? "opacity-60" : ""}`}>
      <form ref={formRef} action={action} className="space-y-3">
        {option && <input type="hidden" name="id" value={option.id} />}
        <div className="grid grid-cols-[1fr_4.5rem_6.5rem] gap-2">
          <div>
            <label className="label" htmlFor={`${p}-name`}>Nome</label>
            <input id={`${p}-name`} name="name" defaultValue={option?.name} required placeholder="Ex.: 2 brownies" className="input" />
          </div>
          <div>
            <label className="label" htmlFor={`${p}-qty`}>Qtd.</label>
            <input id={`${p}-qty`} name="quantity" type="number" min={1} inputMode="numeric" defaultValue={option?.quantity ?? 1} required className="input text-center" />
          </div>
          <div>
            <label className="label" htmlFor={`${p}-price`}>Preço (R$)</label>
            <input
              id={`${p}-price`}
              name="price"
              inputMode="decimal"
              required
              defaultValue={option ? Number(option.price).toFixed(2).replace(".", ",") : ""}
              placeholder="0,00"
              className="input"
            />
          </div>
        </div>
        {option && (
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="active" defaultChecked={option.active} className="h-5 w-5 accent-[var(--primary)]" />
            Ativa (aparece nos pedidos)
          </label>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        {state?.ok && option && <p className="text-sm text-success">Salvo!</p>}
        <div className="flex gap-2">
          <SubmitButton className="btn-primary flex-1" pendingText="Salvando…">
            {option ? "Salvar" : "Adicionar opção"}
          </SubmitButton>
          {option && (
            <SubmitButton formAction={delAction} className="btn-danger" confirmMessage={`Excluir "${option.name}"?`}>
              Excluir
            </SubmitButton>
          )}
        </div>
      </form>
    </div>
  );
}
