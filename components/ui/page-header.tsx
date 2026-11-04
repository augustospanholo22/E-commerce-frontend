import Link from "next/link";
import { Container } from "./container";

type Crumb = { href?: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Navegação estrutural" className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-muted">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-subtle">/</span>}
          {c.href ? (
            <Link href={c.href} className="transition-colors hover:text-brand">
              {c.label}
            </Link>
          ) : (
            <span className="max-w-48 truncate text-fg">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({ crumbs, eyebrow, title, description, children }: { crumbs?: Crumb[]; eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <Container className="pt-8 pb-10 sm:pt-12 sm:pb-14">
      {crumbs && <Breadcrumbs items={crumbs} />}
      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl animate-fade-up">
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h1 className="font-display text-[2.4rem] leading-[1.02] font-bold tracking-[-0.03em] sm:text-[3.25rem]">{title}</h1>
          {description && <p className="mt-4 text-base leading-relaxed text-muted">{description}</p>}
        </div>
        {children}
      </div>
    </Container>
  );
}
