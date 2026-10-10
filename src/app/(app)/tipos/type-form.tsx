"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/submit-button";
import type { BrownieType } from "@/lib/types";
import { deleteType, saveType } from "./actions";

export function TypeForm({ type }: { type?: BrownieType }) {
  const [state, action] = useActionState(saveType, null);
  const [delState, delAction] = useActionState(deleteType, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && !type) formRef.current?.reset();
  }, [state, type]);

  const error = state?.error ?? delState?.error;
  const p = type?.id ?? "new";

  return (
    <div className={`card ${type && !type.active ? "opacity-60" : ""}`}>
      <form ref={formRef} action={action} className="space-y-3">
        {type && <input type="hidden" name="id" value={type.id} />}
        <div>
          <label className="label" htmlFor={`${p}-name`}>Sabor</label>
          <input id={`${p}-name`} name="name" defaultValue={type?.name} required placeholder="Ex.: Ninho com Nutella" className="input" />
        </div>
        <div>
          <label className="label" htmlFor={`${p}-desc`}>Descrição (opcional)</label>
          <input id={`${p}-desc`} name="description" defaultValue={type?.description ?? ""} className="input" />
        </div>
        {type && (
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="active" defaultChecked={type.active} className="h-5 w-5 accent-[var(--primary)]" />
            Ativo (aparece em novos pedidos)
          </label>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        {state?.ok && type && <p className="text-sm text-success">Salvo!</p>}
        <div className="flex gap-2">
          <SubmitButton className="btn-primary flex-1" pendingText="Salvando…">
            {type ? "Salvar" : "Adicionar sabor"}
          </SubmitButton>
          {type && (
            <SubmitButton
              formAction={delAction}
              className="btn-danger"
              confirmMessage={`Excluir "${type.name}"?`}
            >
              Excluir
            </SubmitButton>
          )}
        </div>
      </form>
    </div>
  );
}
