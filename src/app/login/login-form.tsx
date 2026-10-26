"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { signIn } from "./actions";

export function LoginForm({ demo }: { demo?: { email: string; password: string } | null }) {
  const [error, action] = useActionState(signIn, null);
  return (
    <form action={action} className="card space-y-4">
      <div>
        <label className="label" htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={demo?.email} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required defaultValue={demo?.password} className="input" />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <SubmitButton className="btn-primary w-full" pendingText="Entrando…">
        Entrar
      </SubmitButton>
    </form>
  );
}
