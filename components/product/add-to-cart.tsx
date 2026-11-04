"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart";
import { useToast } from "@/context/toast";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity";
import { cn } from "@/lib/cn";
import type { Produto } from "@/lib/types";

/** Botão redondo de adicionar rápido, usado sobre a imagem do card. */
export function QuickAdd({ produto, className }: { produto: Produto; className?: string }) {
  const { add, items } = useCart();
  const toast = useToast();
  const [done, setDone] = useState(false);
  const inCart = items.find((i) => i.produtoId === produto.id)?.quantidade ?? 0;
  const disabled = produto.estoque <= 0 || inCart >= produto.estoque;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={`Adicionar ${produto.nome} à sacola`}
      onClick={(e) => {
        e.preventDefault();
        add(produto);
        setDone(true);
        toast(`${produto.nome} foi adicionado à sacola.`);
        window.setTimeout(() => setDone(false), 1400);
      }}
      className={cn(
        "flex size-10 items-center justify-center rounded-full bg-brand text-on-brand shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]",
        "transition-all duration-300 hover:scale-105 hover:bg-brand-hover disabled:pointer-events-none disabled:opacity-0",
        className,
      )}
    >
      {done ? <Check className="size-4" strokeWidth={2} /> : <Plus className="size-4" strokeWidth={1.75} />}
    </button>
  );
}

/** Bloco de compra da página de produto: quantidade + adicionar + comprar agora. */
export function PurchasePanel({ produto }: { produto: Produto }) {
  const { add, items, openDrawer } = useCart();
  const toast = useToast();
  const router = useRouter();
  const inCart = items.find((i) => i.produtoId === produto.id)?.quantidade ?? 0;
  const available = Math.max(produto.estoque - inCart, 0);
  const [qty, setQty] = useState(1);

  if (produto.estoque <= 0) {
    return (
      <Button size="lg" disabled className="w-full">
        Produto esgotado
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={Math.min(qty, Math.max(available, 1))} max={Math.max(available, 1)} onChange={setQty} />
        <Button
          size="lg"
          className="flex-1"
          disabled={available <= 0}
          onClick={() => {
            add(produto, qty);
            toast(`${qty}× ${produto.nome} na sacola.`);
            setQty(1);
            openDrawer();
          }}
        >
          <ShoppingBag className="size-4" strokeWidth={1.75} />
          Adicionar à sacola
        </Button>
      </div>
      <Button
        size="lg"
        variant="secondary"
        disabled={available <= 0}
        onClick={() => {
          add(produto, qty);
          router.push("/checkout");
        }}
      >
        Comprar agora
      </Button>
      {inCart > 0 && (
        <p className="text-xs text-muted">
          Você já tem {inCart} {inCart === 1 ? "unidade" : "unidades"} na sacola
          {available <= 0 ? " — limite do estoque atingido." : "."}
        </p>
      )}
    </div>
  );
}
