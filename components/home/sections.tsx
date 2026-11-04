import Link from "next/link";
import { ArrowRight, BarChart3, Boxes, PackageCheck, PackagePlus, ShieldCheck, Store } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { LinkButton } from "@/components/ui/button";
import { StatePanel } from "@/components/ui/states";
import { DataError } from "@/components/ui/data-error";
import { ProductCard } from "@/components/product/product-card";
import { ProductSpotlight } from "@/components/product/spotlight";
import { OpenStoreCard, StoreCard } from "@/components/store/store-card";
import { getLojas, getProdutos } from "@/lib/server-api";
import { errorMessage } from "@/lib/errors";

/** Faixa de benefícios — descreve funcionalidades que o sistema realmente tem. */
export function ValueStrip() {
  const items = [
    { icon: Store, title: "Lojas independentes", text: "Cada loja gerencia o próprio catálogo" },
    { icon: Boxes, title: "Estoque em tempo real", text: "Disponibilidade lida direto da API" },
    { icon: ShieldCheck, title: "Conta protegida", text: "Acesso autenticado por token" },
    { icon: PackageCheck, title: "Pedidos rastreáveis", text: "Acompanhe tudo em Minha conta" },
  ];
  return (
    <section className="border-b border-line">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <Icon className="size-5 shrink-0 text-brand" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-fg">{title}</p>
              <p className="mt-0.5 text-[0.8125rem] leading-snug text-muted">{text}</p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}

export async function StoresSection() {
  let lojas, produtos;
  try {
    [lojas, produtos] = await Promise.all([getLojas(), getProdutos()]);
  } catch (e) {
    return <DataError message={errorMessage(e)} />;
  }
  const count = (id: number) => produtos.filter((p) => p.lojaId === id).length;
  const shown = lojas.slice(0, 5);

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((loja) => (
        <StoreCard key={loja.id} loja={loja} produtosCount={count(loja.id)} className="animate-fade-up" />
      ))}
      <OpenStoreCard className={shown.length === 0 ? "sm:col-span-2 lg:col-span-1" : ""} />
    </div>
  );
}

export async function FeaturedSection() {
  let produtos, lojas;
  try {
    [produtos, lojas] = await Promise.all([getProdutos(), getLojas()]);
  } catch (e) {
    return <DataError message={errorMessage(e)} />;
  }
  const lojaNome = (id: number) => lojas.find((l) => l.id === id)?.nome;
  // Mais recentes primeiro; produtos com estoque antes dos esgotados
  const ordered = [...produtos].sort((a, b) => Number(b.estoque > 0) - Number(a.estoque > 0) || b.id - a.id);

  if (ordered.length === 0) {
    return (
      <StatePanel
        icon={<Store className="size-5" strokeWidth={1.5} />}
        title="A vitrine está sendo montada"
        description="Ainda não há produtos cadastrados. Crie sua loja e publique o primeiro item do catálogo."
        action={
          <>
            <LinkButton href="/painel">Abrir minha loja</LinkButton>
            <LinkButton href="/cadastro" variant="secondary">
              Criar conta
            </LinkButton>
          </>
        }
      />
    );
  }

  // Poucos produtos → destaque editorial, sem grade com buracos
  if (ordered.length <= 2) {
    return (
      <div className="space-y-6">
        {ordered.map((p, i) => (
          <ProductSpotlight key={p.id} produto={p} lojaNome={lojaNome(p.lojaId)} index={i + 1} />
        ))}
      </div>
    );
  }

  const list = ordered.slice(0, 8);
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {list.map((p) => (
        <ProductCard key={p.id} produto={p} lojaNome={lojaNome(p.lojaId)} className="animate-fade-up" />
      ))}
    </div>
  );
}

export function SellerBanner() {
  const features = [
    { icon: Store, title: "Crie sua loja", text: "Nome e apresentação em menos de um minuto." },
    { icon: PackagePlus, title: "Publique produtos", text: "Preço, descrição e estoque — no catálogo na hora." },
    { icon: BarChart3, title: "Acompanhe vendas", text: "Estoque, valor em estoque e unidades vendidas." },
  ];
  return (
    <section className="mt-24 sm:mt-32">
      <Container>
        <div className="grid overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface lg:grid-cols-2">
          <div className="px-7 py-12 sm:px-12 sm:py-16 lg:px-14">
            <p className="eyebrow">Para vendedores</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.04] font-bold tracking-[-0.03em] sm:text-5xl">
              Abra sua loja.
              <br />
              <span className="text-brand">Publique hoje.</span>
            </h2>
            <p className="mt-5 max-w-md text-muted">
              Pelo painel você cria lojas, cadastra produtos, define preços e controla o estoque — tudo integrado ao catálogo.
            </p>
            <LinkButton href="/painel" size="lg" className="mt-9">
              Ir para o painel <ArrowRight className="size-4" strokeWidth={2} />
            </LinkButton>
          </div>
          <ul className="grid divide-y divide-line border-t border-line lg:border-t-0 lg:border-l">
            {features.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex items-start gap-5 px-7 py-7 sm:px-12 lg:px-10">
                <span className="tabular font-display text-sm font-bold text-subtle">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line-strong text-brand">
                  <Icon className="size-[1.1rem]" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="font-display text-lg font-bold">{title}</p>
                  <p className="mt-1 text-sm text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { n: "01", title: "Descubra", text: "Navegue por lojas independentes e filtre o catálogo por loja, preço e disponibilidade." },
    { n: "02", title: "Monte sua sacola", text: "Adicione produtos, ajuste quantidades e finalize com sua conta e endereço de entrega." },
    { n: "03", title: "Acompanhe", text: "Veja o status de cada pedido e os itens comprados na área Minha conta." },
  ];
  return (
    <section className="mt-24 sm:mt-32">
      <Container>
        <SectionHeading eyebrow="Como funciona" title="Simples do começo ao fim" />
        <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="bg-canvas p-8 transition-colors hover:bg-surface sm:p-10">
              <p className="font-display text-5xl font-bold text-brand">{s.n}</p>
              <p className="mt-8 font-display text-2xl font-bold">{s.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/produtos" className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg">
            <span className="link-underline">Começar pelo catálogo</span>
            <ArrowRight className="size-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
