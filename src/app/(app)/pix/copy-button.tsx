"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Copie o código Pix:", text);
        }
      }}
      className={`btn w-full py-3 ${copied ? "bg-success text-white" : "btn-ghost"}`}
    >
      {copied ? "✓ Código copiado" : "Copiar código Pix (copia e cola)"}
    </button>
  );
}
