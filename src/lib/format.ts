const brlFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function brl(n: number) {
  return brlFmt.format(n);
}

/** Aceita "12,50", "12.50", "R$ 12,50". Retorna NaN se inválido. */
export function parseMoney(v: FormDataEntryValue | null) {
  const s = String(v ?? "")
    .replace(/[R$\s]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  return s === "" ? NaN : Number(s);
}

export function str(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

export const PAYMENT_LABELS = { pix: "Pix", cash: "Dinheiro", card: "Cartão" } as const;
export const STATUS_LABELS = {
  pending: "Pendente",
  delivered: "Entregue",
  cancelled: "Cancelado",
} as const;
