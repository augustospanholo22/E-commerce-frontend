import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { ProductGridSkeleton } from "@/components/product/product-card";
import { Catalog } from "@/components/product/catalog";
import { DataError } from "@/components/ui/data-error";
import { getLojas, getProdutos } from "@/lib/server-api";
import { errorMessage } from "@/lib/errors";

export const metadata: Metadata = { title: "Produtos" };

export default function ProdutosPage({ searchParams }: PageProps<"/produtos">) {
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Início" }, { label: "Produtos" }]}
        eyebrow="Catálogo"
        title="Todos os produtos"
        description="Tudo o que as lojas da Vitrine publicaram, com estoque e preço atualizados."
      />
      <Container>
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogData searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}

async function CatalogData({ searchParams }: { searchParams: PageProps<"/produtos">["searchParams"] }) {
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  let produtos, lojas;
  try {
    [produtos, lojas] = await Promise.all([getProdutos(), getLojas()]);
  } catch (e) {
    return <DataError message={errorMessage(e)} />;
  }
  {
    const lojaParam = Number(str(sp.loja));
    const ordem = str(sp.ordem);
    return (
      <Catalog
        produtos={produtos}
        lojas={lojas}
        initial={{
          q: str(sp.q),
          loja: Number.isInteger(lojaParam) && lojas.some((l) => l.id === lojaParam) ? lojaParam : null,
          sort: (["menor-preco", "maior-preco", "nome", "recentes"].includes(ordem) ? ordem : "relevancia") as "relevancia",
          estoque: str(sp.estoque) === "1",
        }}
      />
    );
  }
}

function CatalogSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
      <div className="hidden space-y-3 lg:block">
        <div className="skeleton h-3 w-16" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-8" />
        ))}
      </div>
      <div>
        <div className="skeleton h-11 rounded-full" />
        <div className="skeleton mt-5 mb-8 h-3 w-24" />
        <ProductGridSkeleton count={6} columns="xl:grid-cols-3" />
      </div>
    </div>
  );
}
