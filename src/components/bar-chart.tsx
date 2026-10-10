import { brl } from "@/lib/format";

export type Bar = { key: string; label: string; tooltip: string; value: number; highlight?: boolean };

/**
 * Colunas simples (uma série). Valor do maior dia rotulado; os demais no
 * tooltip (hover/toque) e na tabela para leitores de tela.
 */
export function BarChart({ bars, caption }: { bars: Bar[]; caption: string }) {
  const max = Math.max(...bars.map((b) => b.value), 0);
  const peak = max > 0 ? bars.findIndex((b) => b.value === max) : -1;
  const dense = bars.length > 12;

  return (
    <figure>
      <div className="relative h-40" aria-hidden>
        <div className="absolute inset-x-0 bottom-0 border-t border-border" />
        <div className="absolute inset-0 flex items-end gap-0.5">
          {bars.map((b, i) => {
            const pct = max > 0 ? (b.value / max) * 100 : 0;
            return (
              <div
                key={b.key}
                tabIndex={0}
                className="group relative flex h-full flex-1 items-end justify-center outline-none"
              >
                {i === peak && !dense && (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 text-[11px] font-semibold text-foreground"
                    style={{ bottom: `calc(${pct}% + 4px)` }}
                  >
                    {brl(b.value)}
                  </span>
                )}
                <div
                  className={`w-full max-w-6 rounded-t transition-opacity group-hover:opacity-80 group-focus:opacity-80 ${
                    b.highlight ? "bg-accent" : "bg-primary"
                  }`}
                  style={{ height: b.value > 0 ? `max(${pct}%, 3px)` : 0 }}
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-xs text-background shadow-lg group-hover:block group-focus:block">
                  <span className="block text-[10px] opacity-75">{b.tooltip}</span>
                  <span className="font-semibold">{brl(b.value)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-1.5 flex gap-0.5" aria-hidden>
        {bars.map((b, i) => (
          <span
            key={b.key}
            className={`flex-1 text-center text-[10px] tabular-nums ${b.highlight ? "font-bold text-foreground" : "text-muted"}`}
          >
            {!dense || i % 5 === 0 || b.highlight ? b.label : ""}
          </span>
        ))}
      </div>
      <figcaption className="mt-2 text-xs text-muted">{caption} · toque numa barra para ver o valor</figcaption>
      <table className="sr-only">
        <caption>{caption}</caption>
        <tbody>
          {bars.map((b) => (
            <tr key={b.key}>
              <th scope="row">{b.tooltip}</th>
              <td>{brl(b.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export type HBar = { key: string; label: string; value: number };

/** Barras horizontais ordenadas (uma série), com o valor na ponta de cada barra. */
export function HBarChart({ bars, unit }: { bars: HBar[]; unit: (n: number) => string }) {
  const max = Math.max(...bars.map((b) => b.value), 0);
  return (
    <figure>
      <ul className="space-y-2.5">
        {bars.map((b) => {
          const pct = max > 0 ? (b.value / max) * 100 : 0;
          return (
            <li key={b.key} className="grid grid-cols-[minmax(0,7.5rem)_1fr] items-center gap-3">
              <span className="truncate text-sm font-medium" title={b.label}>{b.label}</span>
              {/* mr-14 reserva espaço para o valor na ponta da maior barra */}
              <div className="relative mr-14 flex h-5 items-center">
                <div
                  className="h-full rounded-r bg-primary"
                  style={{ width: b.value > 0 ? `max(${pct}%, 3px)` : 0 }}
                  aria-hidden
                />
                <span
                  className="absolute whitespace-nowrap text-xs font-semibold tabular-nums"
                  style={{ left: `calc(${pct}% + 6px)` }}
                >
                  {unit(b.value)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
