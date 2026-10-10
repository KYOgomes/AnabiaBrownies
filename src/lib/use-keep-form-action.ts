"use client";

import { startTransition, type FormEvent } from "react";

/**
 * Envia o form para uma action do useActionState sem o reset automático do
 * React 19 (que apagaria o que foi digitado quando a action devolve um aviso).
 */
export function submitWithoutReset(action: (fd: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const fd = new FormData(e.currentTarget, submitter);
    startTransition(() => action(fd));
  };
}
