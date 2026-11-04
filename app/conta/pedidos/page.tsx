"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { useAuth } from "@/context/auth";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { formatDate, formatPrice } from "@/lib/format";
import type { Pedido, PedidoDetalhe } from "@/lib/types";
import { LinkButton, Button } from "@/components/ui/button";
import { Skeleton, StatePanel } from "@/components/ui/states";
import { ProductArt } from "@/components/product/product-art";
import { StatusBadge } from "@/components/account/status-badge";

export default function PedidosPage() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoDetalhe[] | null>(null);
  const [erro, setErro] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        // O backend lista todos os pedidos; filtramos os do usuário logado.
        const all = await api<Pedido[]>("/pedidos");
        const mine = all.filter((p) => p.usuarioId === user.id).sort((a, b) => b.id - a.id);
        // Detalhe de cada pedido traz os itens com o produto
        const detalhes = await Promise.all(mine.map((p) => api<PedidoDetalhe>(`/pedidos/${p.id}`)));
        setPedidos(detalhes.filter(Boolean));
      } catch (e) {
        setErro(errorMessage(e));
      }
    })();
  }, [user, reload]);

  if (erro) {
    return (
      <StatePanel tone="error" title="Não foi possível carregar seus pedidos" description={erro} action={<Button variant="secondary" onClick={() => { setErro(""); setReload((n) => n + 1); }}>Tentar novamente</Button>} />
    );
  }

  if (!pedidos) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-[var(--radius-card)]" />)}
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <StatePanel
        icon={<Package className="size-5" strokeWidth={1.5} />}
        title="Você ainda não fez pedidos"
        description="Quando você finalizar uma compra, ela aparece aqui com o status atualizado."
        action={<LinkButton href="/produtos">Começar a comprar</LinkButton>}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-display text-3xl">Pedidos</h2>
        <p className="text-sm text-muted">{pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}</p>
      </div>
      <ul className="space-y-4">
        {pedidos.map((p) => {
          const qtd = p.itens.reduce((s, i) => s + i.quantidade, 0);
          return (
            <li key={p.id} className="animate-fade-up">
              <Link href={`/conta/pedidos/${p.id}`} className="group flex flex-col gap-5 rounded-[var(--radius-card)] border border-line bg-surface p-5 transition-colors hover:bg-surface-2/60 sm:flex-row sm:items-center sm:p-6">
                <div className="flex -space-x-3">
                  {p.itens.slice(0, 3).map((i) => (
                    <div key={i.id} className="w-14 overflow-hidden rounded-lg ring-4 ring-surface">
                      <ProductArt id={i.produto.id} nome={i.produto.nome} label={false} className="aspect-[4/5]" />
                    </div>
                  ))}
                  {p.itens.length === 0 && (
                    <div className="flex aspect-[4/5] w-14 items-center justify-center rounded-lg bg-surface-2 text-muted">
                      <Package className="size-4" strokeWidth={1.5} />
                    </div>
                  )}
                  {p.itens.length > 3 && (
                    <div className="tabular flex aspect-[4/5] w-14 items-center justify-center rounded-lg bg-surface-2 text-xs ring-4 ring-surface">+{p.itens.length - 3}</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-medium">Pedido #{p.id}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {formatDate(p.data)} · {qtd} {qtd === 1 ? "item" : "itens"}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <p className="tabular font-display text-xl">{formatPrice(p.valorTotal)}</p>
                  <ChevronRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
