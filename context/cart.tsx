"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { useIsClient } from "@/lib/use-is-client";
import type { Produto } from "@/lib/types";

/**
 * O backend não possui carrinho, então ele vive no navegador (localStorage).
 * Guardamos um "retrato" do produto para exibir; no checkout os preços e
 * estoques são conferidos novamente na API antes de criar o pedido.
 */
export type CartItem = {
  produtoId: number;
  nome: string;
  preco: number;
  estoque: number;
  lojaId: number;
  quantidade: number;
};

type CartState = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  add: (p: Produto, qtd?: number) => void;
  setQuantity: (produtoId: number, qtd: number) => void;
  remove: (produtoId: number) => void;
  clear: () => void;
  replaceAll: (items: CartItem[]) => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CART_KEY = "vitrine_cart";
const CART_EVENT = "vitrine:cart";
const EMPTY: CartItem[] = [];
const CartContext = createContext<CartState | null>(null);

/* ------------------------------------------------------------------
   "Store" do carrinho sobre o localStorage, lido via useSyncExternalStore.
   Guardamos o último texto lido para devolver sempre a MESMA referência
   enquanto nada mudar (exigência do useSyncExternalStore).
------------------------------------------------------------------- */
let cacheRaw: string | null = null;
let cacheItems: CartItem[] = EMPTY;

function readCart(): CartItem[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(CART_KEY);
  } catch {
    return cacheItems; // sem armazenamento: usa memória
  }
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      cacheItems = Array.isArray(parsed) ? parsed : EMPTY;
    } catch {
      cacheItems = EMPTY; // carrinho corrompido: começa vazio
    }
  }
  return cacheItems;
}

function writeCart(items: CartItem[]) {
  cacheItems = items;
  cacheRaw = JSON.stringify(items);
  try {
    localStorage.setItem(CART_KEY, cacheRaw);
  } catch {
    /* sem armazenamento disponível */
  }
  window.dispatchEvent(new Event(CART_EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(CART_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CART_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, readCart, () => EMPTY);
  const hydrated = useIsClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const setItems = useCallback((fn: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
    writeCart(typeof fn === "function" ? fn(readCart()) : fn);
  }, []);

  const add = useCallback((p: Produto, qtd = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.produtoId === p.id);
      if (existing) {
        return prev.map((i) =>
          i.produtoId === p.id
            ? { ...i, preco: p.preco, estoque: p.estoque, quantidade: Math.min(i.quantidade + qtd, p.estoque) }
            : i,
        );
      }
      return [
        ...prev,
        { produtoId: p.id, nome: p.nome, preco: p.preco, estoque: p.estoque, lojaId: p.lojaId, quantidade: Math.min(qtd, p.estoque) },
      ];
    });
  }, [setItems]);

  const setQuantity = useCallback((produtoId: number, qtd: number) => {
    setItems((prev) =>
      prev.map((i) => (i.produtoId === produtoId ? { ...i, quantidade: Math.max(1, Math.min(qtd, i.estoque)) } : i)),
    );
  }, [setItems]);

  const remove = useCallback((produtoId: number) => {
    setItems((prev) => prev.filter((i) => i.produtoId !== produtoId));
  }, [setItems]);

  const value = useMemo<CartState>(() => {
    const count = items.reduce((s, i) => s + i.quantidade, 0);
    const subtotal = items.reduce((s, i) => s + i.quantidade * i.preco, 0);
    return {
      items, count, subtotal, hydrated, add, setQuantity, remove,
      clear: () => setItems([]),
      replaceAll: setItems,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    };
  }, [items, hydrated, add, setQuantity, remove, drawerOpen, setItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
