"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/context/cart";
import { ProductArt } from "@/components/product/product-art";
import { QuantityStepper } from "@/components/ui/quantity";
import { LinkButton } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { imageSrc } from "@/lib/product-images";

export function CartDrawer() {
  const { drawerOpen, closeDrawer, items, subtotal, count, setQuantity, remove } = useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Sacola">
      <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-[2px]" onClick={closeDrawer} />
      <aside className="absolute top-0 right-0 flex h-full w-full max-w-[26rem] animate-slide-in flex-col bg-canvas border-l border-line shadow-[-30px_0_80px_-30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="font-display text-2xl">Sua sacola</h2>
            <p className="text-xs text-muted">{count === 0 ? "Nenhum item" : `${count} ${count === 1 ? "item" : "itens"}`}</p>
          </div>
          <button onClick={closeDrawer} aria-label="Fechar sacola" className="-mr-2 rounded-full p-2 text-muted hover:bg-surface-2 hover:text-fg">
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-surface-2">
              <ShoppingBag className="size-5 text-fg-soft" strokeWidth={1.5} />
            </div>
            <p className="font-display text-2xl">Sua sacola está vazia</p>
            <p className="mt-2 text-sm text-muted">Explore o catálogo e adicione o que gostar.</p>
            <LinkButton href="/produtos" className="mt-6" onClick={closeDrawer}>
              Ver produtos
            </LinkButton>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.produtoId} className="flex gap-4 py-5">
                  <Link href={`/produtos/${item.produtoId}`} onClick={closeDrawer} className="w-20 shrink-0 overflow-hidden rounded-xl">
                    <ProductArt id={item.produtoId} nome={item.nome} src={imageSrc(item.imagemUrl)} label={false} className="aspect-[4/5]" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link href={`/produtos/${item.produtoId}`} onClick={closeDrawer} className="truncate text-sm font-medium hover:underline">
                        {item.nome}
                      </Link>
                      <p className="tabular shrink-0 text-sm font-medium">{formatPrice(item.preco * item.quantidade)}</p>
                    </div>
                    <p className="tabular text-xs text-muted">{formatPrice(item.preco)} cada</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QuantityStepper size="sm" value={item.quantidade} max={item.estoque} onChange={(v) => setQuantity(item.produtoId, v)} />
                      <button onClick={() => remove(item.produtoId)} className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-danger" aria-label={`Remover ${item.nome}`}>
                        <Trash2 className="size-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line bg-surface px-6 pt-5 pb-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted">Subtotal</span>
                <span className="tabular font-display text-2xl">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">O total é confirmado com a loja ao finalizar o pedido.</p>
              <div className="mt-5 grid gap-2">
                <LinkButton href="/checkout" size="lg" onClick={closeDrawer}>
                  Finalizar compra
                </LinkButton>
                <LinkButton href="/carrinho" variant="ghost" onClick={closeDrawer}>
                  Ver sacola completa
                </LinkButton>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
