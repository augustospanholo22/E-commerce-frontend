"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info, Lock, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useCart, type CartItem } from "@/context/cart";
import { useToast } from "@/context/toast";
import { RequireAuth } from "@/components/auth/require-auth";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/page-header";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Button, LinkButton } from "@/components/ui/button";
import { Alert, Skeleton, StatePanel } from "@/components/ui/states";
import { SummaryLines } from "@/components/product/order-summary";
import { api } from "@/lib/api";
import { ApiError, errorMessage } from "@/lib/errors";
import { formatPrice } from "@/lib/format";
import type { CreatePedidoDto, Pedido, Produto, Profile } from "@/lib/types";

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <Checkout />
    </RequireAuth>
  );
}

function Checkout() {
  const { user } = useAuth();
  const cart = useCart();
  const toast = useToast();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notices, setNotices] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [placed, setPlaced] = useState(false);

  // 1) Carrega o perfil (endereço) e 2) confere preço/estoque atuais na API
  useEffect(() => {
    if (!user || !cart.hydrated) return;
    let cancel = false;
    (async () => {
      try {
        const [mine, produtos] = await Promise.all([api<Profile | null>("/profiles/me", { auth: true }), api<Produto[]>("/produtos")]);
        if (cancel) return;
        setProfile(mine);
        setEndereco(mine?.endereco ?? "");
        setTelefone(mine?.telefone ?? "");

        const msgs: string[] = [];
        const updated: CartItem[] = [];
        for (const item of cart.items) {
          const p = produtos.find((x) => x.id === item.produtoId);
          if (!p) { msgs.push(`“${item.nome}” não está mais disponível e foi removido.`); continue; }
          if (p.estoque <= 0) { msgs.push(`“${p.nome}” esgotou e foi removido.`); continue; }
          let quantidade = item.quantidade;
          if (quantidade > p.estoque) { quantidade = p.estoque; msgs.push(`A quantidade de “${p.nome}” foi ajustada para ${p.estoque} (estoque atual).`); }
          if (p.preco !== item.preco) msgs.push(`O preço de “${p.nome}” mudou para ${formatPrice(p.preco)}.`);
          updated.push({ ...item, nome: p.nome, preco: p.preco, estoque: p.estoque, imagemUrl: p.imagemUrl, quantidade });
        }
        if (msgs.length) setNotices(msgs);
        cart.replaceAll(updated); // também atualiza nome/imagem do retrato salvo
      } catch (e) {
        if (!cancel) setLoadError(errorMessage(e));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, cart.hydrated]);

  const total = useMemo(() => Math.round(cart.subtotal * 100) / 100, [cart.subtotal]);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!endereco.trim()) { setSubmitError("Informe o endereço de entrega."); return; }
    setSubmitError("");
    setSubmitting(true);

    try {
      // a) Salva endereço/telefone no perfil do usuário logado (cria ou atualiza)
      const body = { endereco: endereco.trim(), telefone: telefone.trim() || undefined };
      if (!profile || profile.endereco !== body.endereco || (profile.telefone ?? "") !== (body.telefone ?? "")) {
        setProfile(await api<Profile>("/profiles/me", { method: "PUT", body, auth: true }));
      }
    } catch (err) {
      setSubmitError(`Não foi possível salvar o endereço: ${errorMessage(err)}`);
      setSubmitting(false);
      return;
    }

    // b) Cria o pedido. Enviamos só produtos e quantidades: o backend confere o
    //    estoque, usa o preço do banco, calcula o total e grava tudo em uma transação.
    let pedido: Pedido;
    try {
      const body: CreatePedidoDto = { itens: cart.items.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })) };
      pedido = await api<Pedido>("/pedidos", { method: "POST", auth: true, body });
    } catch (err) {
      // 409 = estoque mudou desde que a sacola foi montada
      setSubmitError(
        err instanceof ApiError && err.status === 409
          ? `${errorMessage(err)} Atualize a sacola e tente novamente.`
          : errorMessage(err),
      );
      setSubmitting(false);
      return;
    }

    setPlaced(true);
    cart.clear();
    toast(`Pedido #${pedido.id} realizado com sucesso!`);
    router.replace(`/conta/pedidos/${pedido.id}?novo=1`);
  }

  if (!cart.hydrated || loading) {
    return (
      <Container className="grid gap-10 py-12 lg:grid-cols-12">
        <Skeleton className="h-96 lg:col-span-7" />
        <Skeleton className="h-80 lg:col-span-5" />
      </Container>
    );
  }

  if (cart.items.length === 0 && !placed) {
    return (
      <Container className="py-12">
        {notices.length > 0 && <Alert tone="info" className="mb-6">{notices.join(" ")}</Alert>}
        <StatePanel
          icon={<ShoppingBag className="size-5" strokeWidth={1.5} />}
          title="Nada para finalizar"
          description="Sua sacola está vazia. Adicione produtos para fazer um pedido."
          action={<LinkButton href="/produtos">Ver produtos</LinkButton>}
        />
      </Container>
    );
  }

  return (
    <Container className="pt-8 sm:pt-12">
      <Breadcrumbs items={[{ href: "/", label: "Início" }, { href: "/carrinho", label: "Sacola" }, { label: "Finalizar compra" }]} />
      <h1 className="mt-8 font-display text-[2.6rem] leading-[1.04] font-bold sm:text-6xl">Finalizar compra</h1>

      <form onSubmit={placeOrder} className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="space-y-8 lg:col-span-7">
          {loadError && <Alert>{loadError}</Alert>}
          {notices.length > 0 && (
            <Alert tone="info">
              <p className="font-medium">Atualizamos sua sacola</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">{notices.map((n) => <li key={n}>{n}</li>)}</ul>
            </Alert>
          )}

          <section className="rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
            <Step n={1} title="Seus dados" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Nome" htmlFor="nome"><Input id="nome" value={user?.nome ?? ""} disabled /></Field>
              <Field label="E-mail" htmlFor="email"><Input id="email" value={user?.email ?? ""} disabled /></Field>
            </div>
            <p className="mt-3 text-xs text-muted">
              Para alterar, acesse <Link href="/conta" className="underline underline-offset-2">Meu perfil</Link>.
            </p>
          </section>

          <section className="rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
            <Step n={2} title="Entrega" />
            <div className="mt-6 space-y-4">
              <Field label="Endereço completo" htmlFor="endereco" hint="Rua, número, complemento, bairro, cidade e CEP. Ele fica salvo no seu perfil.">
                <Textarea id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua das Flores, 123 — Centro, São Paulo/SP, 01000-000" required rows={3} />
              </Field>
              <Field label="Telefone (opcional)" htmlFor="telefone">
                <Input id="telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-0000" />
              </Field>
            </div>
          </section>

          <section className="rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
            <Step n={3} title="Pagamento" />
            <div className="mt-6 flex gap-4 rounded-xl border border-line bg-canvas p-4 text-sm leading-relaxed text-fg-soft">
              <Info className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.5} />
              <p>
                O pedido é registrado com status <strong className="font-medium text-fg">Pendente</strong>. A forma de pagamento é combinada com a loja
                após a confirmação — nenhum dado de cartão é solicitado aqui.
              </p>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8 lg:sticky lg:top-28">
            <h2 className="font-display text-2xl">Seu pedido</h2>
            <div className="mt-6 max-h-80 overflow-y-auto pr-1">
              <SummaryLines items={cart.items} />
            </div>
            <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular">{formatPrice(total)}</dd></div>
              <div className="flex items-baseline justify-between border-t border-line pt-4">
                <dt className="font-medium">Total</dt>
                <dd className="tabular font-display text-3xl">{formatPrice(total)}</dd>
              </div>
            </dl>
            {submitError && <Alert className="mt-5">{submitError}</Alert>}
            <Button type="submit" size="lg" variant="accent" className="mt-6 w-full" loading={submitting} disabled={!!loadError || cart.items.length === 0}>
              {!submitting && <Lock className="size-4" strokeWidth={1.75} />}
              Confirmar pedido
            </Button>
            <p className="mt-4 text-center text-xs text-muted">Ao confirmar, o pedido aparece em Minha conta → Pedidos.</p>
          </div>
        </aside>
      </form>
    </Container>
  );
}

function Step({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-7 items-center justify-center rounded-full bg-brand font-display text-sm text-on-brand">{n}</span>
      <h2 className="font-display text-2xl">{title}</h2>
    </div>
  );
}
