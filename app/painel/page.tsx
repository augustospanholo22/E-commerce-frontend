"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Pencil, Plus, Store, Trash2, PackagePlus } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useToast } from "@/context/toast";
import { RequireAuth } from "@/components/auth/require-auth";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Alert, Skeleton, StatePanel } from "@/components/ui/states";
import { StoreArt } from "@/components/store/store-art";
import { ProductArt } from "@/components/product/product-art";
import { api, removeProdutoImagem, setImagemPrincipal, uploadProdutoImagens } from "@/lib/api";
import { effectivePrincipal, ImageManager, initialImagesState, type ImagesState } from "@/components/product/image-manager";
import { errorMessage } from "@/lib/errors";
import { formatPrice, stockInfo } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { CreateLojaDto, ItemPedido, Loja, LojaComProdutos, Produto } from "@/lib/types";
import { productCover } from "@/lib/product-images";

export default function PainelPage() {
  return (
    <RequireAuth>
      <Painel />
    </RequireAuth>
  );
}

type LojaForm = { open: boolean; editing: Loja | null };
type ProdutoForm = { open: boolean; editing: Produto | null };
type Confirm = { kind: "loja"; item: Loja } | { kind: "produto"; item: Produto } | null;

function Painel() {
  const { user } = useAuth();
  const toast = useToast();
  const [lojas, setLojas] = useState<Loja[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detalhe, setDetalhe] = useState<LojaComProdutos | null>(null);
  const [vendidos, setVendidos] = useState<ItemPedido[]>([]);
  const [erro, setErro] = useState("");
  const [loadingLoja, setLoadingLoja] = useState(false);
  const [lojaForm, setLojaForm] = useState<LojaForm>({ open: false, editing: null });
  const [produtoForm, setProdutoForm] = useState<ProdutoForm>({ open: false, editing: null });
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [deleting, setDeleting] = useState(false);

  // GET /lojas/:id (com produtos) + GET /itens-pedido para contar vendas
  const loadDetalhe = useCallback(async (id: number) => {
    try {
      const [l, itens] = await Promise.all([api<LojaComProdutos>(`/lojas/${id}`), api<ItemPedido[]>("/itens-pedido", { auth: true })]);
      setDetalhe(l);
      const ids = new Set(l.produtos.map((p) => p.id));
      setVendidos(itens.filter((i) => ids.has(i.produtoId)));
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setLoadingLoja(false);
    }
  }, [toast]);

  // Recebe GET /lojas, filtra as do usuário logado e seleciona uma
  const applyLojas = useCallback(async (all: Loja[], prefer?: number | null) => {
    if (!user) return;
    const mine = all.filter((l) => l.usuarioId === user.id);
    setLojas(mine);
    const next = prefer && mine.some((l) => l.id === prefer) ? prefer : mine[0]?.id ?? null;
    setSelectedId(next);
    if (next) {
      setLoadingLoja(true);
      await loadDetalhe(next);
    } else setDetalhe(null);
  }, [user, loadDetalhe]);

  const loadLojas = useCallback(async (prefer?: number | null) => {
    try {
      await applyLojas(await api<Loja[]>("/lojas"), prefer);
    } catch (e) {
      setErro(errorMessage(e));
    }
  }, [applyLojas]);

  // Carga inicial
  useEffect(() => {
    api<Loja[]>("/lojas")
      .then((all) => applyLojas(all))
      .catch((e) => setErro(errorMessage(e)));
  }, [applyLojas]);

  function selectLoja(id: number) {
    if (id === selectedId) return;
    setSelectedId(id);
    setLoadingLoja(true);
    loadDetalhe(id);
  }

  const metrics = useMemo(() => {
    const produtos = detalhe?.produtos ?? [];
    return {
      produtos: produtos.length,
      unidades: produtos.reduce((s, p) => s + p.estoque, 0),
      valorEstoque: produtos.reduce((s, p) => s + p.estoque * p.preco, 0),
      vendidas: vendidos.reduce((s, i) => s + i.quantidade, 0),
      receita: vendidos.reduce((s, i) => s + i.quantidade * i.precoUnitario, 0),
    };
  }, [detalhe, vendidos]);

  async function doDelete() {
    if (!confirm) return;
    setDeleting(true);
    try {
      if (confirm.kind === "loja") {
        await api(`/lojas/${confirm.item.id}`, { method: "DELETE", auth: true });
        toast(`Loja “${confirm.item.nome}” excluída.`);
        await loadLojas(null);
      } else {
        await api(`/produtos/${confirm.item.id}`, { method: "DELETE", auth: true });
        toast(`Produto “${confirm.item.nome}” excluído.`);
        if (selectedId) {
          setLoadingLoja(true);
          await loadDetalhe(selectedId);
        }
      }
      setConfirm(null);
    } catch (e) {
      // 409 = loja com produtos ou produto que já está em pedidos (a API explica o motivo)
      toast(errorMessage(e), "error");
    } finally {
      setDeleting(false);
    }
  }

  const selected = lojas?.find((l) => l.id === selectedId) ?? null;

  return (
    <Container className="pt-8 sm:pt-12">
      <Breadcrumbs items={[{ href: "/", label: "Início" }, { href: "/conta", label: "Minha conta" }, { label: "Painel do vendedor" }]} />
      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-fade-up">
          <p className="eyebrow">Painel do vendedor</p>
          <h1 className="mt-3 font-display text-[2.6rem] leading-[1.04] font-bold sm:text-6xl">Suas lojas</h1>
          <p className="mt-3 max-w-lg text-muted">Crie lojas, publique produtos e mantenha o estoque em dia. As alterações aparecem no catálogo na hora.</p>
        </div>
        <Button onClick={() => setLojaForm({ open: true, editing: null })}>
          <Plus className="size-4" strokeWidth={1.75} /> Nova loja
        </Button>
      </div>

      <div className="mt-10">
        {erro ? (
          <StatePanel tone="error" title="Não foi possível carregar suas lojas" description={erro} />
        ) : !lojas ? (
          <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
            <Skeleton className="h-48" />
            <Skeleton className="h-96" />
          </div>
        ) : lojas.length === 0 ? (
          <StatePanel
            icon={<Store className="size-5" strokeWidth={1.5} />}
            title="Você ainda não tem uma loja"
            description="Crie sua primeira loja para começar a publicar produtos na Vitrine."
            action={<Button onClick={() => setLojaForm({ open: true, editing: null })}><Plus className="size-4" strokeWidth={1.75} /> Criar minha loja</Button>}
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[18rem_1fr] lg:gap-10">
            {/* Lista de lojas */}
            <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
              {lojas.map((l) => (
                <li key={l.id} className="w-60 shrink-0 lg:w-auto">
                  <button
                    onClick={() => selectLoja(l.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors",
                      l.id === selectedId ? "border-brand/50 bg-brand-soft" : "border-line bg-surface hover:bg-surface-2",
                    )}
                  >
                    <div className="w-16 shrink-0 overflow-hidden rounded-xl">
                      <StoreArt id={l.id} nome={l.nome} className="aspect-[3/2]" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{l.nome}</p>
                      <p className="truncate text-xs text-muted">{l.descricao || "Sem descrição"}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            {/* Loja selecionada */}
            {selected && (
              <div className="min-w-0 space-y-6">
                <section className="rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-3xl sm:text-4xl">{selected.nome}</h2>
                      <p className="mt-1 text-sm text-muted">{selected.descricao || "Sem descrição"}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link href={`/lojas/${selected.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-fg-soft hover:bg-surface-2">
                        Ver loja <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
                      </Link>
                      <Button size="sm" variant="secondary" onClick={() => setLojaForm({ open: true, editing: selected })}>
                        <Pencil className="size-3.5" strokeWidth={1.5} /> Editar
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setConfirm({ kind: "loja", item: selected })} aria-label="Excluir loja">
                        <Trash2 className="size-3.5" strokeWidth={1.5} />
                      </Button>
                    </div>
                  </div>
                  <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
                    <Metric label="Produtos" value={String(metrics.produtos)} loading={loadingLoja} />
                    <Metric label="Unidades em estoque" value={String(metrics.unidades)} loading={loadingLoja} />
                    <Metric label="Valor em estoque" value={formatPrice(metrics.valorEstoque)} loading={loadingLoja} />
                    <Metric label="Unidades vendidas" value={String(metrics.vendidas)} sub={metrics.receita ? formatPrice(metrics.receita) : undefined} loading={loadingLoja} />
                  </dl>
                </section>

                <section className="rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-display text-2xl">Produtos</h3>
                    <Button size="sm" onClick={() => setProdutoForm({ open: true, editing: null })}>
                      <Plus className="size-3.5" strokeWidth={1.75} /> Novo produto
                    </Button>
                  </div>

                  {loadingLoja && !detalhe ? (
                    <div className="mt-6 space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)}</div>
                  ) : !detalhe || detalhe.produtos.length === 0 ? (
                    <StatePanel
                      className="mt-6"
                      icon={<PackagePlus className="size-5" strokeWidth={1.5} />}
                      title="Nenhum produto ainda"
                      description="Cadastre o primeiro produto desta loja. Ele aparece no catálogo imediatamente."
                      action={<Button onClick={() => setProdutoForm({ open: true, editing: null })}>Cadastrar produto</Button>}
                    />
                  ) : (
                    <ul className={cn("mt-6 divide-y divide-line transition-opacity", loadingLoja && "opacity-60")}>
                      {detalhe.produtos.map((p) => {
                        const st = stockInfo(p.estoque);
                        const sold = vendidos.filter((i) => i.produtoId === p.id).reduce((s, i) => s + i.quantidade, 0);
                        return (
                          <li key={p.id} className="flex items-center gap-4 py-4">
                            <div className="w-14 shrink-0 overflow-hidden rounded-lg">
                              <ProductArt id={p.id} nome={p.nome} src={productCover(p)} label={false} className="aspect-square" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link href={`/produtos/${p.id}`} className="truncate font-medium hover:underline">{p.nome}</Link>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="tabular text-sm text-fg-soft">{formatPrice(p.preco)}</span>
                                <Badge tone={st.tone}>{st.label}</Badge>
                                {sold > 0 && <span className="text-xs text-muted">{sold} vendidas</span>}
                                {(p.imagens?.length ?? 0) > 0 && <span className="text-xs text-subtle">{p.imagens!.length} {p.imagens!.length === 1 ? "foto" : "fotos"}</span>}
                              </div>
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <button onClick={() => setProdutoForm({ open: true, editing: p })} className="rounded-full p-2.5 text-muted hover:bg-surface-2 hover:text-fg" aria-label={`Editar ${p.nome}`}>
                                <Pencil className="size-4" strokeWidth={1.5} />
                              </button>
                              <button onClick={() => setConfirm({ kind: "produto", item: p })} className="rounded-full p-2.5 text-muted hover:bg-danger-soft hover:text-danger" aria-label={`Excluir ${p.nome}`}>
                                <Trash2 className="size-4" strokeWidth={1.5} />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </div>
            )}
          </div>
        )}
      </div>

      {user && (
        <LojaModal
          state={lojaForm}
          onClose={() => setLojaForm({ open: false, editing: null })}
          onSaved={async (l) => {
            toast(lojaForm.editing ? "Loja atualizada." : `Loja “${l.nome}” criada!`);
            setLojaForm({ open: false, editing: null });
            await loadLojas(l.id);
          }}
        />
      )}
      {selected && (
        <ProdutoModal
          state={produtoForm}
          lojaId={selected.id}
          onClose={() => setProdutoForm({ open: false, editing: null })}
          onSaved={async (p) => {
            toast(produtoForm.editing ? "Produto atualizado." : `“${p.nome}” publicado no catálogo!`);
            setProdutoForm({ open: false, editing: null });
            setLoadingLoja(true);
            await loadDetalhe(selected.id);
          }}
        />
      )}

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.kind === "loja" ? "Excluir loja?" : "Excluir produto?"}
        description={confirm ? `“${confirm.item.nome}” será removido permanentemente.` : undefined}
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setConfirm(null)}>Cancelar</Button>
          <Button variant="danger" loading={deleting} onClick={doDelete}>Excluir</Button>
        </div>
      </Modal>
    </Container>
  );
}

function Metric({ label, value, sub, loading }: { label: string; value: string; sub?: string; loading?: boolean }) {
  return (
    <div className="bg-surface p-4 sm:p-5">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="tabular mt-2 font-display text-2xl">{loading ? <span className="skeleton inline-block h-6 w-12 align-middle" /> : value}</dd>
      {sub && !loading && <p className="tabular mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

/** POST /lojas ou PUT /lojas/:id — corpo: { nome, descricao } (o dono vem do token) */
type LojaModalProps = { state: LojaForm; onClose: () => void; onSaved: (l: Loja) => void };

function LojaModal(props: LojaModalProps) {
  const { state, onClose } = props;
  return (
    <Modal open={state.open} onClose={onClose} title={state.editing ? "Editar loja" : "Nova loja"} description="Nome e apresentação aparecem na página pública da loja.">
      {/* O Modal desmonta o conteúdo ao fechar → o formulário sempre abre com os valores certos */}
      <LojaFormBody {...props} />
    </Modal>
  );
}

function LojaFormBody({ state, onClose, onSaved }: LojaModalProps) {
  const [nome, setNome] = useState(state.editing?.nome ?? "");
  const [descricao, setDescricao] = useState(state.editing?.descricao ?? "");
  const [erro, setErro] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return setErro("Dê um nome para a loja.");
    setSaving(true);
    setErro("");
    try {
      const body: CreateLojaDto = { nome: nome.trim(), descricao: descricao.trim() };
      const saved = state.editing
        ? await api<Loja>(`/lojas/${state.editing.id}`, { method: "PUT", body, auth: true })
        : await api<Loja>("/lojas", { method: "POST", body, auth: true });
      onSaved(saved);
    } catch (err) {
      setErro(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form onSubmit={submit} className="space-y-5">
        {erro && <Alert>{erro}</Alert>}
        <Field label="Nome da loja" htmlFor="loja-nome">
          <Input id="loja-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Ateliê Aurora" autoFocus />
        </Field>
        <Field label="Descrição" htmlFor="loja-desc" hint="Conte em poucas palavras o que a loja vende.">
          <Textarea id="loja-desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
        </Field>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={saving}>{state.editing ? "Salvar" : "Criar loja"}</Button>
        </div>
      </form>
    </>
  );
}

/** POST /produtos ou PUT /produtos/:id — corpo: { nome, descricao, preco, estoque, lojaId } */
type ProdutoModalProps = { state: ProdutoForm; lojaId: number; onClose: () => void; onSaved: (p: Produto) => void };

function ProdutoModal(props: ProdutoModalProps) {
  const { state, onClose } = props;
  return (
    <Modal
      open={state.open}
      onClose={onClose}
      size="lg"
      title={state.editing ? "Editar produto" : "Novo produto"}
      description="Dados, preço, estoque e fotos. Sem fotos, o produto usa uma capa neutra."
    >
      <ProdutoFormBody {...props} />
    </Modal>
  );
}

function ProdutoFormBody({ state, lojaId, onClose, onSaved }: ProdutoModalProps) {
  const p = state.editing;
  const [form, setForm] = useState({
    nome: p?.nome ?? "",
    descricao: p?.descricao ?? "",
    preco: p ? p.preco.toFixed(2).replace(".", ",") : "",
    estoque: p ? String(p.estoque) : "",
  });
  const [images, setImages] = useState<ImagesState>(() => initialImagesState(p?.imagens ?? [], p?.imagemUrl ?? null));
  const [erro, setErro] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState("");
  // Produto já gravado nesta sessão do formulário (evita duplicar ao "tentar novamente")
  const [savedProduto, setSavedProduto] = useState<Produto | null>(p);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // O DTO exige preco numérico e estoque inteiro (validação do class-validator)
    const preco = Number(form.preco.replace(/\./g, "").replace(",", "."));
    const estoque = Number(form.estoque);
    if (!form.nome.trim()) return setErro("Informe o nome do produto.");
    if (!Number.isFinite(preco) || preco <= 0) return setErro("Informe um preço válido (ex.: 49,90).");
    if (!Number.isInteger(estoque) || estoque < 0) return setErro("O estoque deve ser um número inteiro (0 ou mais).");
    setSaving(true);
    setErro("");

    let produto = savedProduto;
    let s = images; // cópia local do estado das imagens, atualizada a cada etapa concluída
    const commit = (next: ImagesState) => {
      s = next;
      setImages(next);
    };

    try {
      // 1) Dados do produto (JSON) — POST ou PUT
      setStep("Salvando dados…");
      const body = { nome: form.nome.trim(), descricao: form.descricao.trim(), preco: Math.round(preco * 100) / 100, estoque, lojaId };
      produto = produto
        ? await api<Produto>(`/produtos/${produto.id}`, { method: "PUT", body, auth: true })
        : await api<Produto>("/produtos", { method: "POST", body, auth: true });
      setSavedProduto(produto);
      const pid = produto.id;

      // 2) Remoções marcadas
      for (const id of s.removed) {
        setStep("Removendo imagens…");
        produto = await removeProdutoImagem(pid, id);
        commit({ ...s, existing: s.existing.filter((i) => i.id !== id), removed: s.removed.filter((r) => r !== id) });
      }

      // 3) Upload das novas imagens (multipart/form-data)
      if (s.added.length > 0) {
        setStep(s.added.length === 1 ? "Enviando imagem…" : `Enviando ${s.added.length} imagens…`);
        const antes = new Set(s.existing.map((i) => i.id));
        produto = await uploadProdutoImagens(pid, s.added.map((a) => a.file));
        // As novas voltam na mesma ordem em que foram enviadas
        const criadas = (produto.imagens ?? []).filter((i) => !antes.has(i.id)).sort((a, b) => a.ordem - b.ordem);
        let principal = s.principal;
        if (principal?.kind === "new") {
          const idx = s.added.findIndex((a) => a.key === (principal as { key: string }).key);
          principal = criadas[idx] ? { kind: "existing", id: criadas[idx].id } : null;
        }
        s.added.forEach((a) => URL.revokeObjectURL(a.preview));
        commit({ existing: produto.imagens ?? [], removed: [], added: [], principal });
      }

      // 4) Imagem principal escolhida
      const principal = effectivePrincipal(s);
      if (principal?.kind === "existing") {
        const img = s.existing.find((i) => i.id === principal.id);
        if (img && img.url !== produto.imagemUrl) {
          setStep("Definindo imagem principal…");
          produto = await setImagemPrincipal(pid, img.id);
        }
      }

      onSaved(produto);
    } catch (err) {
      const msg = errorMessage(err);
      setErro(produto ? `Os dados do produto foram salvos, mas houve um problema com as imagens: ${msg}` : msg);
    } finally {
      setSaving(false);
      setStep("");
    }
  }

  return (
    <>
      <form onSubmit={submit} className="space-y-5">
        {erro && <Alert>{erro}</Alert>}
        <Field label="Nome" htmlFor="p-nome">
          <Input id="p-nome" value={form.nome} onChange={set("nome")} placeholder="Ex.: Caneca de cerâmica" autoFocus />
        </Field>
        <Field label="Descrição" htmlFor="p-desc">
          <Textarea id="p-desc" value={form.descricao} onChange={set("descricao")} rows={3} placeholder="Material, medidas, detalhes…" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Preço (R$)" htmlFor="p-preco">
            <Input id="p-preco" inputMode="decimal" value={form.preco} onChange={set("preco")} placeholder="49,90" />
          </Field>
          <Field label="Estoque" htmlFor="p-estoque">
            <Input id="p-estoque" type="number" min={0} step={1} inputMode="numeric" value={form.estoque} onChange={set("estoque")} placeholder="10" />
          </Field>
        </div>

        <div className="border-t border-line pt-5">
          <ImageManager value={images} onChange={setImages} disabled={saving} />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-end">
          {step && <p className="text-xs text-muted sm:mr-auto" aria-live="polite">{step}</p>}
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" loading={saving}>
            {erro && savedProduto ? "Tentar novamente" : state.editing ? "Salvar" : "Publicar produto"}
          </Button>
        </div>
      </form>
    </>
  );
}
