import Link from "next/link";

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition active:scale-95"
          aria-label="Voltar para o início"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
          </svg>
        </Link>
        <Link href="/" className="flex-1 font-display text-lg font-semibold">
          Anabia Brownies
        </Link>
        <Link
          href="/pix"
          className="flex h-10 items-center gap-1.5 rounded-xl border-2 border-primary px-3 text-sm font-bold text-primary transition active:scale-95"
          aria-label="Mostrar QR code do Pix"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2M14 18h2v2M18 18h2v2h-2" />
          </svg>
          Pix
        </Link>
      </div>
    </header>
  );
}
