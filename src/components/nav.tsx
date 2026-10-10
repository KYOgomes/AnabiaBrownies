"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Calendário", icon: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" },
  { href: "/resumo", label: "Resumo", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  { href: "/despesas", label: "Despesas", icon: "M12 3v18M17 7.5c0-1.9-2.2-3-5-3s-5 1.1-5 3 2 2.7 5 3.5 5 1.6 5 3.5-2.2 3-5 3-5-1.1-5-3" },
  { href: "/tipos", label: "Brownies", icon: "M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 8l2-4h12l2 4M9 12h.01M15 12h.01M12 15h.01" },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/pedido") : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-2xl grid-cols-4">
        {LINKS.map((l) => {
          const active = isActive(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                  active ? "text-primary" : "text-muted"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2.2 : 1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d={l.icon} />
                </svg>
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
