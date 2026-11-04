import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/context/cart";
import { ProductArt } from "./product-art";

export function SummaryLines({ items }: { items: CartItem[] }) {
  return (
    <ul className="space-y-4">
      {items.map((i) => (
        <li key={i.produtoId} className="flex items-center gap-4">
          <div className="relative w-14 shrink-0 overflow-hidden rounded-lg">
            <ProductArt id={i.produtoId} nome={i.nome} label={false} className="aspect-[4/5]" />
            <span className="tabular absolute -top-0 -right-0 flex h-5 min-w-5 items-center justify-center rounded-bl-lg bg-brand px-1 text-[0.65rem] font-semibold text-on-brand">
              {i.quantidade}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{i.nome}</p>
            <p className="tabular text-xs text-muted">{i.quantidade} × {formatPrice(i.preco)}</p>
          </div>
          <p className="tabular text-sm">{formatPrice(i.preco * i.quantidade)}</p>
        </li>
      ))}
    </ul>
  );
}
