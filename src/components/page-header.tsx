import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  back,
  action,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start gap-3">
      {back && (
        <Link href={back} className="btn-ghost -ml-1 mt-0.5 h-9 w-9 p-0" aria-label="Voltar">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-semibold leading-tight first-letter:uppercase">
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
