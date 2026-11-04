import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Hash, Package, Store } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { DataError } from "@/components/ui/data-error";
import { ProductGallery } from "@/components/product/gallery";
import { productImageUrls } from "@/lib/product-images";
import { PurchasePanel } from "@/components/product/add-to-cart";
import { ProductCard, ProductGridSkeleton } from "@/components/product/product-card";
import { StoreArt } from "@/components/store/store-art";
import { getLoja, getProduto, getProdutos } from "@/lib/server-api";
import { errorMessage } from "@/lib/errors";
import { formatPrice, stockInfo } from "@/lib/format";

export default function ProdutoPage({ params }: PageProps<"/produtos/[id]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}

async function ProductDetail({ params }: { params: PageProps<"/produtos/[id]">["params"] }) {
  const { id } = await params;
  const produtoId = Number(id);
  if (!Number.isInteger(produtoId) || produtoId <= 0) notFound();

  let produto, loja;
  try {
    produto = await getProduto(produtoId);
    loja = produto ? await getLoja(produto.lojaId) : null;
  } catch (e) {
    return (
      <Container className="py-16">
        <DataError message={errorMessage(e)} />
      </Container>
    );
  }

  if (!produto) notFound();
  const stock = stockInfo(produto.estoque);

  return (
    <>
      <Container className="pt-8 sm:pt-12">
        <Breadcrumbs
          items={[
            { href: "/", label: "Início" },
            { href: "/produtos", label: "Produtos" },
            ...(loja ? [{ href: `/lojas/${loja.id}`, label: loja.nome }] : []),
            { label: produto.nome },
          ]}
        />
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="animate-fade-in lg:sticky lg:top-28">
              <ProductGallery id={produto.id} nome={produto.nome} urls={productImageUrls(produto)} />
            </div>
          </div>

          <div className="animate-fade-up lg:col-span-5 lg:pt-2">
            {loja && (
              <Link href={`/lojas/${loja.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-brand">
                {loja.nome}
                <ArrowUpRight className="size-3" strokeWidth={1.75} />
              </Link>
            )}
            <h1 className="mt-3 font-display text-[2.2rem] leading-[1.02] font-bold tracking-[-0.02em] uppercase sm:text-[3rem]">{produto.nome}</h1>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <p className="tabular font-display text-[2rem] font-bold">{formatPrice(produto.preco)}</p>
              <Badge tone={stock.tone} dot>
                {stock.label}
              </Badge>
            </div>

            <p className="mt-6 text-base leading-relaxed text-muted">
              {produto.descricao || "A loja ainda não adicionou uma descrição para este produto."}
            </p>

            <div className="mt-10">
              <PurchasePanel produto={produto} />
            </div>

            <dl className="mt-12 divide-y divide-line border-y border-line text-sm">
              <Spec icon={<Store className="size-4" strokeWidth={1.5} />} label="Vendido por" value={loja?.nome ?? `Loja #${produto.lojaId}`} />
              <Spec icon={<Package className="size-4" strokeWidth={1.5} />} label="Disponível" value={`${produto.estoque} ${produto.estoque === 1 ? "unidade" : "unidades"}`} />
              <Spec icon={<Hash className="size-4" strokeWidth={1.5} />} label="Código" value={`Nº ${String(produto.id).padStart(3, "0")}`} />
            </dl>

            {loja && (
              <Link href={`/lojas/${loja.id}`} className="group mt-8 flex items-center gap-4 rounded-2xl bg-surface p-3 pr-5 transition-colors hover:bg-surface-2">
                <div className="w-24 shrink-0 overflow-hidden rounded-xl">
                  <StoreArt id={loja.id} nome={loja.nome} className="aspect-[3/2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted">Conheça a loja</p>
                  <p className="truncate font-display text-lg">{loja.nome}</p>
                  {loja.descricao && <p className="truncate text-xs text-muted">{loja.descricao}</p>}
                </div>
                <ArrowUpRight className="size-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} />
              </Link>
            )}
          </div>
        </div>
      </Container>

      <Suspense fallback={<Container className="mt-24"><ProductGridSkeleton /></Container>}>
        <Related produtoId={produto.id} lojaId={produto.lojaId} lojaNome={loja?.nome} />
      </Suspense>
    </>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <dt className="flex items-center gap-2.5 text-muted">
        {icon}
        {label}
      </dt>
      <dd className="text-right text-fg">{value}</dd>
    </div>
  );
}

/** Mais produtos da mesma loja; se não houver, outros do catálogo. */
async function Related({ produtoId, lojaId, lojaNome }: { produtoId: number; lojaId: number; lojaNome?: string }) {
  let produtos;
  try {
    produtos = await getProdutos();
  } catch {
    return null;
  }
  const others = produtos.filter((p) => p.id !== produtoId);
  const sameStore = others.filter((p) => p.lojaId === lojaId);
  const list = (sameStore.length > 0 ? sameStore : others).slice(0, 4);
  if (list.length === 0) return null;

  return (
    <section className="mt-24 sm:mt-32">
      <Container>
        <SectionHeading
          eyebrow={sameStore.length > 0 ? lojaNome ?? "Mesma loja" : "Catálogo"}
          title={sameStore.length > 0 ? "Mais desta loja" : "Você também pode gostar"}
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} produto={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ProductSkeleton() {
  return (
    <Container className="pt-8 sm:pt-12">
      <div className="skeleton h-3 w-56" />
      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="skeleton aspect-[4/5] rounded-[var(--radius-card)] sm:aspect-[5/4] lg:col-span-7 lg:aspect-[4/5]" />
        <div className="space-y-5 lg:col-span-5 lg:pt-6">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-12 w-4/5" />
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-20" />
          <div className="skeleton h-12 rounded-full" />
          <div className="skeleton h-12 rounded-full" />
        </div>
      </div>
    </Container>
  );
}
