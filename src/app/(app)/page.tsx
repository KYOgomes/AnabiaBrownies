import { Suspense } from "react";
import { Calendar, type DayPayments, type DayTotals } from "@/components/calendar";
import { DayPanel } from "@/components/day-panel";
import { ScrollOnChange } from "@/components/scroll-on-change";
import { CalendarSkeleton, DayPanelSkeleton } from "@/components/skeletons";
import { isISODate, isMonth, monthGrid, monthOf, todayISO } from "@/lib/dates";
import { getStock } from "@/lib/stock";
import { requireUser } from "@/lib/supabase/server";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { mes, dia } = await searchParams;
  const today = todayISO();
  const selected = typeof dia === "string" && isISODate(dia) ? dia : today;
  const month = typeof mes === "string" && isMonth(mes) ? mes : monthOf(selected);
  await requireUser();

  // Calendário e painel do dia carregam em paralelo, cada um com seu placeholder
  return (
    <>
      <Suspense key={month} fallback={<CalendarSkeleton />}>
        <CalendarSection month={month} selected={selected} today={today} />
      </Suspense>
      <ScrollOnChange value={selected} />
      <Suspense key={selected} fallback={<DayPanelSkeleton />}>
        <DayPanel date={selected} today={today} />
      </Suspense>
    </>
  );
}

async function CalendarSection({ month, selected, today }: { month: string; selected: string; today: string }) {
  const { supabase } = await requireUser();
  const weeks = monthGrid(month);
  const from = weeks[0][0];
  const to = weeks.at(-1)![6];

  const [stock, { data: orders }] = await Promise.all([
    getStock(supabase, from, to),
    supabase.from("orders").select("date, paid").neq("status", "cancelled").gte("date", from).lte("date", to),
  ]);

  const days: DayTotals = new Map();
  for (const [key, v] of stock) {
    const date = key.slice(0, 10);
    const d = days.get(date) ?? { available: 0, sold: 0 };
    days.set(date, { available: d.available + v.available, sold: d.sold + v.sold });
  }

  const payments: DayPayments = new Map();
  for (const o of orders ?? []) {
    const p = payments.get(o.date) ?? { orders: 0, unpaid: 0 };
    payments.set(o.date, { orders: p.orders + 1, unpaid: p.unpaid + (o.paid ? 0 : 1) });
  }

  return <Calendar month={month} selected={selected} today={today} days={days} payments={payments} />;
}
