import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { Produto } from "@/lib/types";
import { ProductArt } from "./product-art";
import { QuickAdd } from "./add-to-cart";
import { cn } from "@/lib/cn";

type Props = { produto: Produto; lojaNome?: string; className?: string; priority?: boolean };

export function ProductCard({ produto, lojaNome, className }: Props) {
  const esgotado = produto.estoque <= 0;
  const ultimas = !esgotado && produto.estoque <= 3;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden border-b border-line">
        <Link href={`/produtos/${produto.id}`} className="absolute inset-0" aria-label={produto.nome} tabIndex={-1}>
          <ProductArt
            id={produto.id}
            nome={produto.nome}
            className={cn("transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]", esgotado && "opacity-50 grayscale")}
          />
        </Link>
        <div className="pointer-events-none absolute top-3 left-3 flex gap-2">
          {esgotado && <Badge tone="solid">Esgotado</Badge>}
          {ultimas && <Badge tone="brand">Últimas unidades</Badge>}
        </div>
        <QuickAdd
          produto={produto}
          className="absolute right-3 bottom-3 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:focus-visible:translate-y-0 sm:focus-visible:opacity-100"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {lojaNome && <p className="mb-1.5 truncate text-xs text-muted">{lojaNome}</p>}
        <h3 className="line-clamp-2 text-[0.9375rem] leading-snug font-medium text-fg sm:line-clamp-1">
          <Link href={`/produtos/${produto.id}`} className="transition-colors hover:text-brand">
            {produto.nome}
          </Link>
        </h3>
        {produto.descricao && <p className="mt-1 line-clamp-1 hidden text-sm text-subtle sm:block">{produto.descricao}</p>}
        <p className="tabular mt-auto pt-4 font-display text-lg font-bold text-fg">{formatPrice(produto.preco)}</p>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
        <div className="skeleton aspect-square rounded-none" />
        <div className="space-y-2.5 p-5">
          <div className="skeleton h-3 w-1/3" />
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton mt-4 h-5 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4, columns = "lg:grid-cols-4" }: { count?: number; columns?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:gap-5", columns)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
