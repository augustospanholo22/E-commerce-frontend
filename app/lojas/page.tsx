import { Suspense } from "react";
import type { Metadata } from "next";
import { Store } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { DataError } from "@/components/ui/data-error";
import { StatePanel } from "@/components/ui/states";
import { LinkButton } from "@/components/ui/button";
import { OpenStoreCard, StoreCard, StoreCardSkeleton } from "@/components/store/store-card";
import { getLojas, getProdutos } from "@/lib/server-api";
import { errorMessage } from "@/lib/errors";

export const metadata: Metadata = { title: "Lojas" };

export default function LojasPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Início" }, { label: "Lojas" }]}
        eyebrow="Quem vende"
        title="Lojas na Vitrine"
        description="Pequenos negócios com catálogos próprios. Entre em uma loja para ver tudo o que ela oferece."
      />
      <Container>
        <Suspense
          fallback={
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <StoreCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <StoreList />
        </Suspense>
      </Container>
    </>
  );
}

async function StoreList() {
  let lojas, produtos;
  try {
    [lojas, produtos] = await Promise.all([getLojas(), getProdutos()]);
  } catch (e) {
    return <DataError message={errorMessage(e)} />;
  }
  if (lojas.length === 0) {
    return (
      <StatePanel
        icon={<Store className="size-5" strokeWidth={1.5} />}
        title="Nenhuma loja por aqui ainda"
        description="Crie a primeira loja da Vitrine pelo painel do vendedor."
        action={<LinkButton href="/painel">Criar minha loja</LinkButton>}
      />
    );
  }
  return (
    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {lojas.map((l) => (
        <StoreCard key={l.id} loja={l} produtosCount={produtos.filter((p) => p.lojaId === l.id).length} className="animate-fade-up" />
      ))}
      <OpenStoreCard />
    </div>
  );
}
