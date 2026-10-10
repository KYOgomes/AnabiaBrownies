import Link from "next/link";
import { addMonths, formatMonth, monthGrid, monthOf } from "@/lib/dates";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export type DayTotals = Map<string, { available: number; sold: number }>;

export function Calendar({
  month,
  selected,
  today,
  days,
}: {
  month: string;
  selected: string;
  today: string;
  days: DayTotals;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold first-letter:uppercase">{formatMonth(month)}</h1>
        <div className="flex gap-1">
          {month !== monthOf(today) && (
            <Link href={`/?dia=${today}`} scroll={false} className="btn-ghost h-9 px-3 py-0 text-xs">
              Hoje
            </Link>
          )}
          <Link href={`/?mes=${addMonths(month, -1)}&dia=${selected}`} scroll={false} className="btn-ghost h-9 w-9 p-0" aria-label="Mês anterior">‹</Link>
          <Link href={`/?mes=${addMonths(month, 1)}&dia=${selected}`} scroll={false} className="btn-ghost h-9 w-9 p-0" aria-label="Próximo mês">›</Link>
        </div>
      </div>

      <div className="card p-2">
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1.5">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthGrid(month).flat().map((date) => {
            const d = days.get(date);
            const has = d && (d.available > 0 || d.sold > 0);
            const left = d ? d.available - d.sold : 0;
            const isSelected = date === selected;
            const tone = !has
              ? ""
              : d.available === 0
                ? "bg-danger/10"
                : left <= 0
                  ? "bg-success/15"
                  : "bg-accent/12";
            return (
              <Link
                key={date}
                href={`/?mes=${monthOf(date)}&dia=${date}`}
                scroll={false}
                className={`flex aspect-square flex-col items-center justify-between rounded-xl p-1 text-sm transition ${
                  monthOf(date) === month ? "" : "opacity-35"
                } ${isSelected ? "bg-primary text-primary-foreground" : `${tone} hover:bg-background`} ${
                  date === today && !isSelected ? "ring-2 ring-accent" : ""
                }`}
              >
                <span className="font-semibold">{Number(date.slice(8))}</span>
                <span className={`text-[10px] font-medium leading-tight tabular-nums ${isSelected ? "" : "text-muted"}`}>
                  {has ? `${d.sold}/${d.available}` : " "}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-muted">
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-accent/25" /> com estoque</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-success/30" /> esgotado</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-danger/20" /> sem produção</span>
        <span>· vendidos/disponíveis</span>
      </div>
    </section>
  );
}
