/** Placeholders exibidos enquanto os dados chegam. */

function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-border/60 ${className}`} />;
}

export function CalendarSkeleton() {
  return (
    <div aria-busy aria-label="Carregando calendário">
      <div className="mb-3 flex items-center justify-between">
        <Block className="h-8 w-44" />
        <Block className="h-9 w-20" />
      </div>
      <Block className="aspect-[7/6] w-full" />
    </div>
  );
}

export function DayPanelSkeleton() {
  return (
    <div className="mt-6 space-y-4" aria-busy aria-label="Carregando dia">
      <Block className="h-7 w-56" />
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Block key={i} className="h-14" />
        ))}
      </div>
      <Block className="h-32" />
      <Block className="h-56" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Carregando">
      <Block className="h-8 w-40" />
      <Block className="h-12" />
      <Block className="h-40" />
      <Block className="h-24" />
      <Block className="h-48" />
    </div>
  );
}
