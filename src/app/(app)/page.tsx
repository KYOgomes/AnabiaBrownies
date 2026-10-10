import { Calendar, type DayTotals } from "@/components/calendar";
import { DayPanel } from "@/components/day-panel";
import { isISODate, isMonth, monthGrid, monthOf, todayISO } from "@/lib/dates";
import { getStock } from "@/lib/stock";
import { requireUser } from "@/lib/supabase/server";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { mes, dia } = await searchParams;
  const today = todayISO();
  const selected = typeof dia === "string" && isISODate(dia) ? dia : today;
  const month = typeof mes === "string" && isMonth(mes) ? mes : monthOf(selected);
  const weeks = monthGrid(month);
  const { supabase } = await requireUser();

  const stock = await getStock(supabase, weeks[0][0], weeks.at(-1)![6]);
  const days: DayTotals = new Map();
  for (const [key, v] of stock) {
    const date = key.slice(0, 10);
    const d = days.get(date) ?? { available: 0, sold: 0 };
    days.set(date, { available: d.available + v.available, sold: d.sold + v.sold });
  }

  return (
    <>
      <Calendar month={month} selected={selected} today={today} days={days} />
      <DayPanel date={selected} today={today} />
    </>
  );
}
