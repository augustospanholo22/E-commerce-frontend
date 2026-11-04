import Link from "next/link";
import { ArrowUpRight, Store } from "lucide-react";
import { ProductArt } from "@/components/product/product-art";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { getLojas, getProdutos } from "@/lib/server-api";
import { formatPrice } from "@/lib/format";
import { productCover } from "@/lib/product-images";

/**
 * "Palco" do banner principal: em vez de uma ilustração, mostra um produto REAL
 * da API (o mais recente com estoque), com a foto em destaque — no estilo da
 * página de produto da referência.
 */
export async function HeroStage() {
  let produtos, lojas;
  try {
    [produtos, lojas] = await Promise.all([getProdutos(), getLojas()]);
  } catch {
    return <StageFrame empty />;
  }
  const destaque = [...produtos].sort((a, b) => Number(b.estoque > 0) - Number(a.estoque > 0) || b.id - a.id)[0];
  if (!destaque) return <StageFrame empty />;
  const loja = lojas.find((l) => l.id === destaque.lojaId);

  return (
    <article className="animate-fade-up overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5 text-xs">
        <span className="truncate text-muted">
          Vitrine <span className="px-1.5 text-subtle">/</span> {loja?.nome ?? "Loja"} <span className="px-1.5 text-subtle">/</span>
          <span className="text-fg"> {destaque.nome}</span>
        </span>
        <Badge tone="brand" dot>Em destaque</Badge>
      </div>
      <Link href={`/produtos/${destaque.id}`} className="group block">
        <ProductArt
          id={destaque.id}
          nome={destaque.nome}
          src={productCover(destaque)}
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="aspect-[4/3] transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.02]"
        />
      </Link>
      <div className="flex flex-col gap-5 border-t border-line p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div className="min-w-0">
          <p className="text-xs text-muted">{loja?.nome}</p>
          <h2 className="mt-1 truncate font-display text-2xl font-bold uppercase sm:text-3xl">{destaque.nome}</h2>
          <p className="tabular mt-2 font-display text-xl font-bold">{formatPrice(destaque.preco)}</p>
        </div>
        <LinkButton href={`/produtos/${destaque.id}`} className="shrink-0">
          Ver produto <ArrowUpRight className="size-4" strokeWidth={2} />
        </LinkButton>
      </div>
    </article>
  );
}

/** Sem produtos (ou sem API): convite real para criar a primeira loja. */
function StageFrame({ empty }: { empty?: boolean }) {
  return (
    <div className="flex aspect-[4/3.6] flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Store className="size-5" strokeWidth={1.5} />
      </span>
      <p className="mt-5 font-display text-2xl font-bold">{empty ? "A vitrine está sendo montada" : ""}</p>
      <p className="mt-2 max-w-xs text-sm text-muted">Os produtos publicados pelas lojas aparecem aqui em destaque.</p>
      <LinkButton href="/painel" className="mt-6">Abrir minha loja</LinkButton>
    </div>
  );
}

export function HeroStageSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
      <div className="border-b border-line px-5 py-3.5"><div className="skeleton h-3 w-48" /></div>
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-6"><div className="skeleton h-3 w-24" /><div className="skeleton h-7 w-56" /><div className="skeleton h-5 w-20" /></div>
    </div>
  );
}

/** Números reais do catálogo, exibidos abaixo do título. */
export async function HeroStats() {
  let produtos, lojas;
  try {
    [produtos, lojas] = await Promise.all([getProdutos(), getLojas()]);
  } catch {
    return null;
  }
  const stats = [
    { value: produtos.length, label: produtos.length === 1 ? "produto" : "produtos" },
    { value: lojas.length, label: lojas.length === 1 ? "loja" : "lojas" },
    { value: produtos.filter((p) => p.estoque > 0).length, label: "em estoque" },
  ];
  return (
    <dl className="flex animate-fade-up divide-x divide-line border-y border-line">
      {stats.map((s) => (
        <div key={s.label} className="flex-1 px-4 py-4 first:pl-0">
          <dt className="sr-only">{s.label}</dt>
          <dd>
            <span className="tabular block font-display text-2xl font-bold sm:text-3xl">{s.value}</span>
            <span className="text-xs text-muted">{s.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
