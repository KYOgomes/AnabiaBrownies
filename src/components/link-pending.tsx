"use client";

import { useLinkStatus } from "next/link";

/** Brilho sobre o link enquanto a navegação carrega (feedback imediato ao toque). */
export function LinkPending({ className = "rounded-xl" }: { className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-0 bg-accent/30 transition-opacity ${className} ${
        pending ? "animate-pulse opacity-100" : "opacity-0"
      }`}
    />
  );
}
