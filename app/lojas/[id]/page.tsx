import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PackageOpen } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/page-header";
import { DataError } from "@/components/ui/data-error";
import { StatePanel } from "@/components/ui/states";
import { LinkButton } from "@/components/ui/button";
import { StoreArt } from "@/components/store/store-art";
import { ProductCard, ProductGridSkeleton } from "@/components/product/product-card";
import { ProductSpotlight } from "@/components/product/spotlight";
import { getLoja } from "@/lib/server-api";
import { errorMessage } from "@/lib/errors";
import { formatPrice } from "@/lib/format";

export default function LojaPage({ params }: PageProps<"/lojas/[id]">) {
  return (
    <Suspense
      fallback={
        <Container className="pt-8 sm:pt-12">
          <div className="skeleton h-3 w-40" />
          <div className="skeleton mt-8 h-72 rounded-[var(--radius-card)]" />
          <div className="mt-16">
            <ProductGridSkeleton />
          </div>
        </Container>
      }
    >
      <StoreDetail params={params} />
    </Suspense>
  );
}

async function StoreDetail({ params }: { params: PageProps<"/lojas/[id]">["params"] }) {
  const { id } = await params;
  const lojaId = Number(id);
  if (!Number.isInteger(lojaId) || lojaId <= 0) notFound();

  let loja;
  try {
    loja = await getLoja(lojaId);
  } catch (e) {
    return (
      <Container className="py-16">
        <DataError message={errorMessage(e)} />
      </Container>
    );
  }
  if (!loja) notFound();

  const produtos = [...loja.produtos].sort((a, b) => Number(b.estoque > 0) - Number(a.estoque > 0) || b.id - a.id);
  const emEstoque = produtos.filter((p) => p.estoque > 0).length;
  const menorPreco = produtos.length ? Math.min(...produtos.map((p) => p.preco)) : null;

  return (
    <Container className="pt-8 sm:pt-12">
      <Breadcrumbs items={[{ href: "/", label: "Início" }, { href: "/lojas", label: "Lojas" }, { label: loja.nome }]} />

      <section className="mt-8 grid overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface lg:grid-cols-2">
        <div className="flex flex-col justify-between gap-10 p-7 sm:p-12">
          <div className="animate-fade-up">
            <p className="eyebrow">Loja independente</p>
            <h1 className="mt-4 font-display text-5xl leading-[1.02] font-bold sm:text-6xl">{loja.nome}</h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">{loja.descricao || "Esta loja ainda não escreveu uma apresentação."}</p>
          </div>
          <dl className="grid grid-cols-3 gap-4 border-t border-line pt-6">
            <Stat label="Produtos" value={String(produtos.length)} />
            <Stat label="Em estoque" value={String(emEstoque)} />
            <Stat label="A partir de" value={menorPreco !== null ? formatPrice(menorPreco) : "—"} />
          </dl>
        </div>
        <div className="min-h-64 lg:min-h-[26rem]">
          <StoreArt id={loja.id} nome={loja.nome} className="size-full" />
        </div>
      </section>

      <div className="mt-16 sm:mt-20">
        <h2 className="font-display text-3xl">Catálogo da loja</h2>
        <div className="mt-8">
          {produtos.length === 0 ? (
            <StatePanel
              icon={<PackageOpen className="size-5" strokeWidth={1.5} />}
              title="Nenhum produto publicado"
              description="Esta loja ainda está preparando o catálogo. Volte em breve."
              action={<LinkButton href="/produtos" variant="secondary">Ver outros produtos</LinkButton>}
            />
          ) : produtos.length === 1 ? (
            <ProductSpotlight produto={produtos[0]} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {produtos.map((p) => (
                <ProductCard key={p.id} produto={p} className="animate-fade-up" />
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="tabular mt-1 font-display text-xl sm:text-2xl">{value}</dd>
    </div>
  );
}
