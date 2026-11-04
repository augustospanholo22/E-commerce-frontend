"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Loja, Produto } from "@/lib/types";
import { ProductCard } from "./product-card";
import { ProductSpotlight } from "./spotlight";
import { Select } from "@/components/ui/field";
import { Button, LinkButton } from "@/components/ui/button";
import { StatePanel } from "@/components/ui/states";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

type Sort = "relevancia" | "menor-preco" | "maior-preco" | "nome" | "recentes";

type Props = {
  produtos: Produto[];
  lojas: Loja[];
  initial: { q: string; loja: number | null; sort: Sort; estoque: boolean };
};

const SORTS: { value: Sort; label: string }[] = [
  { value: "relevancia", label: "Relevância" },
  { value: "recentes", label: "Mais recentes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "nome", label: "Nome (A–Z)" },
];

const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function Catalog({ produtos, lojas, initial }: Props) {
  const [q, setQ] = useState(initial.q);
  const [loja, setLoja] = useState<number | null>(initial.loja);
  const [sort, setSort] = useState<Sort>(initial.sort);
  const [onlyStock, setOnlyStock] = useState(initial.estoque);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const priceCeil = useMemo(() => Math.ceil(Math.max(0, ...produtos.map((p) => p.preco))), [produtos]);
  const lojaNome = (id: number) => lojas.find((l) => l.id === id)?.nome;

  // Mantém a URL sincronizada (dá para compartilhar o link filtrado)
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (loja) params.set("loja", String(loja));
    if (sort !== "relevancia") params.set("ordem", sort);
    if (onlyStock) params.set("estoque", "1");
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [q, loja, sort, onlyStock]);

  const filtered = useMemo(() => {
    const term = normalize(q.trim());
    const list = produtos.filter((p) => {
      if (loja && p.lojaId !== loja) return false;
      if (onlyStock && p.estoque <= 0) return false;
      if (maxPrice !== null && p.preco > maxPrice) return false;
      if (term && !normalize(`${p.nome} ${p.descricao ?? ""} ${lojaNome(p.lojaId) ?? ""}`).includes(term)) return false;
      return true;
    });
    const sorted = [...list];
    switch (sort) {
      case "menor-preco": sorted.sort((a, b) => a.preco - b.preco); break;
      case "maior-preco": sorted.sort((a, b) => b.preco - a.preco); break;
      case "nome": sorted.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")); break;
      case "recentes": sorted.sort((a, b) => b.id - a.id); break;
      default: sorted.sort((a, b) => Number(b.estoque > 0) - Number(a.estoque > 0));
    }
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produtos, q, loja, onlyStock, maxPrice, sort]);

  const activeCount = (loja ? 1 : 0) + (onlyStock ? 1 : 0) + (maxPrice !== null ? 1 : 0);
  const clearAll = () => {
    setQ("");
    setLoja(null);
    setOnlyStock(false);
    setMaxPrice(null);
  };

  const filters = (
    <div className="space-y-9">
      <div>
        <p className="eyebrow mb-4">Lojas</p>
        <ul className="space-y-1">
          <FilterOption active={loja === null} onClick={() => setLoja(null)} label="Todas as lojas" count={produtos.length} />
          {lojas.map((l) => (
            <FilterOption
              key={l.id}
              active={loja === l.id}
              onClick={() => setLoja(l.id)}
              label={l.nome}
              count={produtos.filter((p) => p.lojaId === l.id).length}
            />
          ))}
        </ul>
      </div>

      {priceCeil > 0 && (
        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <p className="eyebrow">Preço até</p>
            <p className="tabular text-sm font-medium">{formatPrice(maxPrice ?? priceCeil)}</p>
          </div>
          <input
            type="range"
            min={0}
            max={priceCeil}
            step={Math.max(1, Math.round(priceCeil / 100))}
            value={maxPrice ?? priceCeil}
            onChange={(e) => {
              const v = Number(e.target.value);
              setMaxPrice(v >= priceCeil ? null : v);
            }}
            className="w-full accent-brand"
            aria-label="Preço máximo"
          />
        </div>
      )}

      <div>
        <p className="eyebrow mb-4">Disponibilidade</p>
        <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
          Apenas em estoque
          <span className="relative inline-flex">
            <input type="checkbox" checked={onlyStock} onChange={(e) => setOnlyStock(e.target.checked)} className="peer sr-only" />
            <span className="h-6 w-11 rounded-full bg-line-strong transition-colors peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand" />
            <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
          </span>
        </label>
      </div>

      {activeCount > 0 && (
        <button onClick={clearAll} className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
          Limpar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
      {/* Filtros desktop */}
      <aside className="hidden lg:block">
        <div className="sticky top-28">{filters}</div>
      </aside>

      <div>
        {/* Barra superior */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" strokeWidth={1.5} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, descrição ou loja"
              aria-label="Buscar produtos"
              className="h-11 w-full rounded-xl border border-line-strong bg-surface pr-10 pl-11 text-fg placeholder:text-subtle text-sm outline-none transition-colors focus:border-brand"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Limpar busca" className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted hover:text-fg">
                <X className="size-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1 lg:hidden" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal className="size-4" strokeWidth={1.5} />
              Filtros {activeCount > 0 && <span className="tabular rounded-full bg-brand px-1.5 text-[0.7rem] font-semibold text-on-brand">{activeCount}</span>}
            </Button>
            <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Ordenar" className="w-auto min-w-44 flex-1 sm:flex-none">
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <p className="mt-5 mb-8 text-sm text-muted" aria-live="polite">
          {filtered.length === produtos.length
            ? `${produtos.length} ${produtos.length === 1 ? "produto" : "produtos"}`
            : `${filtered.length} de ${produtos.length} produtos`}
          {loja && <> em <span className="text-fg">{lojaNome(loja)}</span></>}
        </p>

        {produtos.length === 0 ? (
          <StatePanel
            title="Nenhum produto publicado ainda"
            description="Quando as lojas cadastrarem produtos, eles aparecerão aqui."
            action={<LinkButton href="/painel">Cadastrar um produto</LinkButton>}
          />
        ) : filtered.length === 0 ? (
          <StatePanel
            icon={<Search className="size-5" strokeWidth={1.5} />}
            title="Nada encontrado"
            description="Tente outro termo de busca ou remova alguns filtros."
            action={<Button variant="secondary" onClick={clearAll}>Limpar filtros</Button>}
          />
        ) : filtered.length === 1 ? (
          <ProductSpotlight produto={filtered[0]} lojaNome={lojaNome(filtered[0].lojaId)} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} produto={p} lojaNome={lojaNome(p.lojaId)} className="animate-fade-in" />
            ))}
          </div>
        )}
      </div>

      {/* Filtros mobile (sheet) */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 animate-fade-in bg-black/70" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] animate-fade-up overflow-y-auto rounded-t-3xl bg-canvas px-6 pt-6 pb-8">
            <div className="mb-8 flex items-center justify-between">
              <p className="font-display text-2xl">Filtros</p>
              <button onClick={() => setFiltersOpen(false)} aria-label="Fechar filtros" className="rounded-full p-2 text-muted hover:bg-surface-2">
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>
            {filters}
            <Button className="mt-10 w-full" size="lg" onClick={() => setFiltersOpen(false)}>
              Ver {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterOption({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <li>
      <button
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
          active ? "bg-brand-soft font-medium text-brand" : "text-fg-soft hover:bg-surface-2",
        )}
      >
        <span className="truncate">{label}</span>
        <span className={cn("tabular text-xs", active ? "text-brand/80" : "text-subtle")}>{count}</span>
      </button>
    </li>
  );
}
