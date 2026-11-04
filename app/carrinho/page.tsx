"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/cart";
import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity";
import { StatePanel, Skeleton } from "@/components/ui/states";
import { ProductArt } from "@/components/product/product-art";
import { formatPrice, pluralize } from "@/lib/format";
import { imageSrc } from "@/lib/product-images";

export default function CarrinhoPage() {
  const { items, hydrated, subtotal, count, setQuantity, remove, clear } = useCart();

  return (
    <>
      <PageHeader crumbs={[{ href: "/", label: "Início" }, { label: "Sacola" }]} title="Sua sacola" description={hydrated && count > 0 ? pluralize(count, "item selecionado", "itens selecionados") : undefined} />
      <Container>
        {!hydrated ? (
          <Skeleton className="h-64" />
        ) : items.length === 0 ? (
          <StatePanel
            icon={<ShoppingBag className="size-5" strokeWidth={1.5} />}
            title="Sua sacola está vazia"
            description="Que tal dar uma olhada no catálogo?"
            action={<LinkButton href="/produtos">Explorar produtos</LinkButton>}
          />
        ) : (
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-8">
              <div className="hidden grid-cols-[1fr_9rem_7rem] gap-6 border-b border-line pb-3 text-xs tracking-[0.12em] text-muted uppercase sm:grid">
                <span>Produto</span>
                <span>Quantidade</span>
                <span className="text-right">Total</span>
              </div>
              <ul className="divide-y divide-line">
                {items.map((item) => (
                  <li key={item.produtoId} className="grid grid-cols-[5.5rem_1fr] gap-4 py-6 sm:grid-cols-[1fr_9rem_7rem] sm:items-center sm:gap-6">
                    <div className="contents sm:flex sm:items-center sm:gap-5">
                      <Link href={`/produtos/${item.produtoId}`} className="w-[5.5rem] shrink-0 overflow-hidden rounded-xl sm:w-24">
                        <ProductArt id={item.produtoId} nome={item.nome} src={imageSrc(item.imagemUrl)} label={false} className="aspect-[4/5]" />
                      </Link>
                      <div className="min-w-0">
                        <Link href={`/produtos/${item.produtoId}`} className="font-medium hover:underline">
                          {item.nome}
                        </Link>
                        <p className="tabular mt-1 text-sm text-muted">{formatPrice(item.preco)}</p>
                        <p className="mt-1 text-xs text-subtle">{item.estoque} disponíveis</p>
                        <div className="mt-4 flex items-center gap-3 sm:hidden">
                          <QuantityStepper size="sm" value={item.quantidade} max={item.estoque} onChange={(v) => setQuantity(item.produtoId, v)} />
                          <button onClick={() => remove(item.produtoId)} className="rounded-full p-2 text-muted hover:text-danger" aria-label={`Remover ${item.nome}`}>
                            <Trash2 className="size-4" strokeWidth={1.5} />
                          </button>
                          <p className="tabular ml-auto text-sm font-medium">{formatPrice(item.preco * item.quantidade)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="hidden items-center gap-2 sm:flex">
                      <QuantityStepper size="sm" value={item.quantidade} max={item.estoque} onChange={(v) => setQuantity(item.produtoId, v)} />
                      <button onClick={() => remove(item.produtoId)} className="rounded-full p-2 text-muted hover:text-danger" aria-label={`Remover ${item.nome}`}>
                        <Trash2 className="size-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    <p className="tabular hidden text-right font-medium sm:block">{formatPrice(item.preco * item.quantidade)}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between">
                <Link href="/produtos" className="text-sm text-muted hover:text-fg">← Continuar comprando</Link>
                <button onClick={clear} className="text-sm text-muted hover:text-danger">Esvaziar sacola</button>
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8 lg:sticky lg:top-28">
                <h2 className="font-display text-2xl">Resumo</h2>
                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">Itens ({count})</dt>
                    <dd className="tabular">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-line pt-4">
                    <dt className="font-medium">Total</dt>
                    <dd className="tabular font-display text-2xl">{formatPrice(subtotal)}</dd>
                  </div>
                </dl>
                <LinkButton href="/checkout" size="lg" className="mt-6 w-full">
                  Finalizar compra <ArrowRight className="size-4" strokeWidth={1.75} />
                </LinkButton>
                <p className="mt-4 text-center text-xs leading-relaxed text-muted">Preços e estoque são conferidos com a loja ao finalizar.</p>
              </div>
            </aside>
          </div>
        )}
      </Container>
    </>
  );
}
