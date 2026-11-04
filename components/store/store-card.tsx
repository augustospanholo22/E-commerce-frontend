import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import type { Loja } from "@/lib/types";
import { StoreArt } from "./store-art";
import { cn } from "@/lib/cn";

export function StoreCard({ loja, produtosCount, className }: { loja: Loja; produtosCount?: number; className?: string }) {
  return (
    <Link
      href={`/lojas/${loja.id}`}
      className={cn("group block overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition-colors duration-300 hover:border-line-strong", className)}
    >
      <div className="aspect-[3/2] overflow-hidden border-b border-line">
        <StoreArt id={loja.id} nome={loja.nome} className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]" />
      </div>
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <h3 className="truncate font-display text-xl text-fg">{loja.nome}</h3>
          <p className="mt-0.5 line-clamp-1 text-sm text-muted">{loja.descricao || "Loja independente na Vitrine"}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          {produtosCount !== undefined && (
            <span className="tabular text-xs text-muted">
              {produtosCount} {produtosCount === 1 ? "produto" : "produtos"}
            </span>
          )}
          <ArrowUpRight className="size-4 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" strokeWidth={1.5} />
        </div>
      </div>
    </Link>
  );
}

/** Cartão de convite para criar uma loja — leva ao painel (funcionalidade real). */
export function OpenStoreCard({ className }: { className?: string }) {
  return (
    <Link
      href="/painel"
      className={cn(
        "group flex min-h-56 flex-col justify-between gap-10 rounded-[var(--radius-card)] border border-dashed border-line-strong p-6 transition-colors hover:border-brand/60 hover:bg-surface",
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-brand text-on-brand transition-transform duration-300 group-hover:rotate-90">
        <Plus className="size-4" strokeWidth={1.75} />
      </span>
      <div>
        <p className="font-display text-2xl leading-tight">Sua loja aqui</p>
        <p className="mt-1 text-sm text-muted">Crie uma loja e cadastre produtos pelo painel do vendedor.</p>
      </div>
    </Link>
  );
}

export function StoreCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[3/2] rounded-[var(--radius-card)]" />
      <div className="mt-4 space-y-2 px-1">
        <div className="skeleton h-5 w-1/2" />
        <div className="skeleton h-3 w-2/3" />
      </div>
    </div>
  );
}
