import Link from "next/link";
import { cn } from "@/lib/cn";

/** Logotipo: arco (a "vitrine") com o ponto neon + nome em Syne. */
export function Logo({ className, onClick }: { className?: string; inverted?: boolean; onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Vitrine — página inicial">
      <svg viewBox="0 0 28 28" className="size-7" aria-hidden>
        <path d="M5 25 V12 a9 9 0 0 1 18 0 V25 Z" fill="none" stroke="var(--color-fg)" strokeWidth="2.2" />
        <circle cx="14" cy="18.5" r="3.4" fill="var(--color-brand)" className="transition-transform duration-500 group-hover:-translate-y-1" />
      </svg>
      <span className="font-display text-[1.35rem] leading-none font-bold tracking-[-0.01em] text-fg">Vitrine</span>
    </Link>
  );
}
