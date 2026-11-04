import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, stockInfo } from "@/lib/format";
import type { Produto } from "@/lib/types";
import { ProductArt } from "./product-art";
import { PurchasePanel } from "./add-to-cart";
import { productCover } from "@/lib/product-images";

/**
 * Layout editorial para quando há poucos produtos: um produto real em
 * destaque, grande, em vez de uma grade com espaços vazios.
 */
export function ProductSpotlight({ produto, lojaNome, index }: { produto: Produto; lojaNome?: string; index?: number }) {
  const stock = stockInfo(produto.estoque);
  return (
    <article className="grid items-center gap-8 rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-6 lg:grid-cols-12 lg:gap-14 lg:p-8">
      <Link href={`/produtos/${produto.id}`} className="group block overflow-hidden rounded-xl border border-line lg:col-span-6">
        <ProductArt id={produto.id} nome={produto.nome} src={productCover(produto)} sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-square bg-canvas transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03] sm:aspect-[5/4] lg:aspect-square" />
      </Link>
      <div className="px-2 pb-4 sm:px-4 lg:col-span-6 lg:px-0 lg:pr-6">
        <div className="flex items-center gap-3">
          {index !== undefined && <span className="tabular font-display text-sm font-bold text-brand">{String(index).padStart(2, "0")}</span>}
          {lojaNome && <p className="eyebrow">{lojaNome}</p>}
        </div>
        <h3 className="mt-4 font-display text-4xl leading-[1.02] font-bold tracking-[-0.02em] text-fg uppercase sm:text-5xl">{produto.nome}</h3>
        {produto.descricao && <p className="mt-4 max-w-md text-base leading-relaxed text-muted">{produto.descricao}</p>}
        <div className="mt-8 flex items-center gap-4">
          <p className="tabular font-display text-3xl font-bold">{formatPrice(produto.preco)}</p>
          <Badge tone={stock.tone} dot>
            {stock.label}
          </Badge>
        </div>
        <div className="mt-8 max-w-sm">
          <PurchasePanel produto={produto} />
        </div>
        <Link href={`/produtos/${produto.id}`} className="mt-6 inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg">
          <span className="link-underline">Ver todos os detalhes</span>
          <ArrowRight className="size-3.5" strokeWidth={1.75} />
        </Link>
      </div>
    </article>
  );
}
