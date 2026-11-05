"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, PartyPopper } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useToast } from "@/context/toast";
import { api } from "@/lib/api";
import { ApiError, errorMessage } from "@/lib/errors";
import { formatDate, formatPrice } from "@/lib/format";
import type { PedidoDetalhe, Profile } from "@/lib/types";
import { Button, LinkButton } from "@/components/ui/button";
import { Alert, Skeleton, StatePanel } from "@/components/ui/states";
import { Modal } from "@/components/ui/modal";
import { ProductArt } from "@/components/product/product-art";
import { StatusBadge } from "@/components/account/status-badge";
import { cn } from "@/lib/cn";
import { imageSrc } from "@/lib/product-images";

export default function PedidoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const [pedido, setPedido] = useState<PedidoDetalhe | null>(null);
  const [endereco, setEndereco] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "notfound" | "error">("loading");
  const [erro, setErro] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        // O backend responde 404 para pedido inexistente ou de outra conta
        const [p, perfil] = await Promise.all([
          api<PedidoDetalhe>(`/pedidos/${Number(id)}`, { auth: true }),
          api<Profile | null>("/profiles/me", { auth: true }),
        ]);
        setPedido(p);
        setEndereco(perfil?.endereco ?? null);
        setState("ok");
      } catch (e) {
        if (e instanceof ApiError && (e.status === 404 || e.status === 400)) return setState("notfound");
        setErro(errorMessage(e));
        setState("error");
      }
    })();
  }, [id, user]);

  async function cancelar() {
    if (!pedido) return;
    setCanceling(true);
    try {
      // O backend devolve os itens ao estoque na mesma transação
      const updated = await api<PedidoDetalhe>(`/pedidos/${pedido.id}/cancelar`, { method: "PATCH", auth: true });
      setPedido(updated);
      toast(`Pedido #${pedido.id} cancelado.`);
      setConfirmCancel(false);
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setCanceling(false);
    }
  }

  if (state === "loading") return <div className="space-y-4"><Skeleton className="h-40" /><Skeleton className="h-64" /></div>;
  if (state === "notfound")
    return <StatePanel title="Pedido não encontrado" description="Ele não existe ou pertence a outra conta." action={<LinkButton href="/conta/pedidos" variant="secondary">Ver meus pedidos</LinkButton>} />;
  if (state === "error" || !pedido) return <StatePanel tone="error" title="Não foi possível carregar o pedido" description={erro} />;

  const status = pedido.status.toUpperCase();
  const steps = ["Pedido realizado", "Confirmado pela loja", "Enviado", "Entregue"];
  const current = status === "PENDENTE" ? 0 : status === "PAGO" ? 1 : status === "ENVIADO" ? 2 : status === "ENTREGUE" || status.startsWith("CONCLU") ? 3 : 0;
  const itemsTotal = pedido.itens.reduce((s, i) => s + i.quantidade * i.precoUnitario, 0);

  return (
    <div className="space-y-6">
      <Link href="/conta/pedidos" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" strokeWidth={1.5} /> Todos os pedidos
      </Link>

      <Suspense fallback={null}>
        <NewOrderBanner />
      </Suspense>

      <section className="rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow">Pedido</p>
            <h2 className="mt-1 font-display text-4xl">#{pedido.id}</h2>
            <p className="mt-1 text-sm text-muted">Realizado em {formatDate(pedido.data, true)}</p>
          </div>
          <StatusBadge status={pedido.status} />
        </div>

        {status !== "CANCELADO" ? (
          <ol className="mt-10 grid grid-cols-4 gap-2">
            {steps.map((s, i) => (
              <li key={s} className="flex flex-col gap-3">
                <div className={cn("h-1 rounded-full", i <= current ? "bg-brand" : "bg-line")} />
                <div className="flex items-center gap-1.5">
                  {i <= current && <Check className="size-3.5 shrink-0 text-brand" strokeWidth={2} />}
                  <span className={cn("text-xs leading-tight", i <= current ? "text-fg" : "text-subtle")}>{s}</span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <Alert tone="info" className="mt-8">Este pedido foi cancelado.</Alert>
        )}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_20rem]">
        <section className="rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
          <h3 className="font-display text-2xl">Itens</h3>
          {pedido.itens.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Nenhum item registrado neste pedido.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {pedido.itens.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-4">
                  <Link href={`/produtos/${i.produto.id}`} className="w-16 shrink-0 overflow-hidden rounded-lg">
                    <ProductArt id={i.produto.id} nome={i.produto.nome} src={imageSrc(i.produto.imagemUrl)} label={false} className="aspect-[4/5]" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/produtos/${i.produto.id}`} className="truncate font-medium hover:underline">{i.produto.nome}</Link>
                    <p className="tabular text-sm text-muted">{i.quantidade} × {formatPrice(i.precoUnitario)}</p>
                  </div>
                  <p className="tabular text-sm font-medium">{formatPrice(i.quantidade * i.precoUnitario)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
            <h3 className="font-display text-xl">Resumo</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Itens</dt><dd className="tabular">{formatPrice(itemsTotal)}</dd></div>
              <div className="flex justify-between border-t border-line pt-3"><dt className="font-medium">Total</dt><dd className="tabular font-display text-2xl">{formatPrice(pedido.valorTotal)}</dd></div>
            </dl>
          </section>
          <section className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
            <h3 className="font-display text-xl">Entrega</h3>
            <p className="mt-3 text-sm leading-relaxed text-fg-soft">{pedido.usuario.nome}</p>
            <p className="text-sm leading-relaxed whitespace-pre-line text-muted">{endereco || "Nenhum endereço cadastrado no perfil."}</p>
          </section>
          {status === "PENDENTE" && (
            <Button variant="danger" className="w-full" onClick={() => setConfirmCancel(true)}>Cancelar pedido</Button>
          )}
        </aside>
      </div>

      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancelar pedido?" description={`O pedido #${pedido.id} será marcado como cancelado.`}>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setConfirmCancel(false)}>Manter pedido</Button>
          <Button variant="danger" loading={canceling} onClick={cancelar}>Sim, cancelar</Button>
        </div>
      </Modal>
    </div>
  );
}

/** Aparece logo após o checkout (?novo=1). useSearchParams fica em Suspense. */
function NewOrderBanner() {
  const params = useSearchParams();
  if (params.get("novo") !== "1") return null;
  return (
    <div className="flex animate-fade-up items-start gap-4 rounded-[var(--radius-card)] border border-brand/40 bg-brand-soft p-6 sm:p-8">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand">
        <PartyPopper className="size-5" strokeWidth={1.75} />
      </span>
      <div>
        <p className="font-display text-2xl font-bold">Pedido recebido!</p>
        <p className="mt-1 text-sm text-fg-soft">Obrigado pela compra. A loja vai confirmar seu pedido em breve — acompanhe o status por aqui.</p>
      </div>
    </div>
  );
}
