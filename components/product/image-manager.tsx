"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Star, Trash2, Undo2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { imageSrc } from "@/lib/product-images";
import type { ProdutoImagem } from "@/lib/types";

/* Mesmas regras do backend (src/produtos/imagens.storage.ts) */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGES = 8;
const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPT_EXT = /\.(jpe?g|png|webp)$/i;

/** Arquivo escolhido no computador, ainda não enviado. `preview` é uma URL temporária (blob:) só para a prévia. */
export type NewImage = { key: string; file: File; preview: string };

export type Principal = { kind: "existing"; id: number } | { kind: "new"; key: string } | null;

export type ImagesState = {
  /** Imagens já salvas no backend */
  existing: ProdutoImagem[];
  /** Ids de imagens salvas que serão removidas ao salvar */
  removed: number[];
  /** Arquivos novos que serão enviados ao salvar */
  added: NewImage[];
  /** Imagem escolhida como principal */
  principal: Principal;
};

export function initialImagesState(existing: ProdutoImagem[] = [], imagemUrl: string | null = null): ImagesState {
  const atual = existing.find((i) => i.url === imagemUrl);
  return { existing, removed: [], added: [], principal: atual ? { kind: "existing", id: atual.id } : null };
}

/** Principal que realmente vai valer (se a escolhida foi removida, a primeira restante assume). */
export function effectivePrincipal(s: ImagesState): Principal {
  const kept = s.existing.filter((i) => !s.removed.includes(i.id));
  const p = s.principal;
  if (p?.kind === "existing" && kept.some((i) => i.id === p.id)) return p;
  if (p?.kind === "new" && s.added.some((a) => a.key === p.key)) return p;
  if (kept[0]) return { kind: "existing", id: kept[0].id };
  if (s.added[0]) return { kind: "new", key: s.added[0].key };
  return null;
}

/**
 * Lê os primeiros bytes do arquivo para descobrir o formato REAL.
 * (o navegador deduz o "type" pela extensão — um PDF renomeado para .png passaria)
 */
async function detectImageType(file: File): Promise<"jpg" | "png" | "webp" | null> {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if ([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v)) return "png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

const formatSize = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
let keySeq = 0;

type Props = {
  value: ImagesState;
  onChange: (fn: (s: ImagesState) => ImagesState) => void;
  disabled?: boolean;
};

export function ImageManager({ value, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  // Libera as URLs temporárias de prévia quando o formulário fecha
  const latestAdded = useRef<NewImage[]>([]);
  useEffect(() => {
    latestAdded.current = value.added;
  }, [value.added]);
  useEffect(() => () => latestAdded.current.forEach((a) => URL.revokeObjectURL(a.preview)), []);

  const kept = value.existing.filter((i) => !value.removed.includes(i.id));
  const total = kept.length + value.added.length;
  const principal = effectivePrincipal(value);

  async function addFiles(list: FileList | File[]) {
    const files = Array.from(list);
    const errs: string[] = [];
    const accepted: NewImage[] = [];
    let slots = MAX_IMAGES - total;

    for (const f of files) {
      const tipoOk = ACCEPT_TYPES.includes(f.type) || (!f.type && ACCEPT_EXT.test(f.name));
      if (!tipoOk) { errs.push(`${f.name}: formato não suportado (use JPG, PNG ou WebP).`); continue; }
      if (f.size === 0) { errs.push(`${f.name}: o arquivo está vazio.`); continue; }
      if (f.size > MAX_IMAGE_BYTES) { errs.push(`${f.name}: tem ${formatSize(f.size)} — o limite é 5 MB.`); continue; }
      if (!(await detectImageType(f))) { errs.push(`${f.name}: o conteúdo não é uma imagem JPG, PNG ou WebP válida.`); continue; }
      const dup = value.added.some((a) => a.file.name === f.name && a.file.size === f.size && a.file.lastModified === f.lastModified);
      if (dup) continue;
      if (slots <= 0) { errs.push(`${f.name}: limite de ${MAX_IMAGES} imagens por produto atingido.`); continue; }
      slots--;
      accepted.push({ key: `img-${Date.now()}-${keySeq++}`, file: f, preview: URL.createObjectURL(f) });
    }

    setErrors(errs);
    if (accepted.length) onChange((s) => ({ ...s, added: [...s.added, ...accepted] }));
  }

  function removeNew(key: string) {
    const item = value.added.find((a) => a.key === key);
    if (item) URL.revokeObjectURL(item.preview);
    onChange((s) => ({ ...s, added: s.added.filter((a) => a.key !== key) }));
  }

  function toggleRemoved(id: number) {
    onChange((s) => ({ ...s, removed: s.removed.includes(id) ? s.removed.filter((r) => r !== id) : [...s.removed, id] }));
  }

  return (
    <section className="space-y-3" aria-labelledby="imagens-titulo">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p id="imagens-titulo" className="text-[0.8125rem] font-medium text-fg-soft">Imagens do produto</p>
          <p className="mt-0.5 text-xs text-muted">JPG, PNG ou WebP · até 5 MB cada · a marcada como principal aparece no catálogo.</p>
        </div>
        <span className="tabular shrink-0 text-xs text-subtle">{total}/{MAX_IMAGES}</span>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "grid grid-cols-3 gap-3 rounded-xl p-1 transition-colors sm:grid-cols-4",
          dragging && "bg-brand-soft outline-2 outline-offset-2 outline-brand outline-dashed",
        )}
      >
        {value.existing.map((img) => {
          const isRemoved = value.removed.includes(img.id);
          const isPrincipal = !isRemoved && principal?.kind === "existing" && principal.id === img.id;
          return (
            <Tile
              key={`e-${img.id}`}
              src={imageSrc(img.url)}
              name={img.nomeOriginal || "Imagem salva"}
              detail={isRemoved ? "Será removida" : "Salva"}
              principal={isPrincipal}
              removed={isRemoved}
              disabled={disabled}
              onPrincipal={isRemoved || isPrincipal ? undefined : () => onChange((s) => ({ ...s, principal: { kind: "existing", id: img.id } }))}
              onRemove={() => toggleRemoved(img.id)}
            />
          );
        })}
        {value.added.map((a) => (
          <Tile
            key={a.key}
            src={a.preview}
            name={a.file.name}
            detail={`Nova · ${formatSize(a.file.size)}`}
            isNew
            principal={principal?.kind === "new" && principal.key === a.key}
            disabled={disabled}
            onPrincipal={principal?.kind === "new" && principal.key === a.key ? undefined : () => onChange((s) => ({ ...s, principal: { kind: "new", key: a.key } }))}
            onRemove={() => removeNew(a.key)}
          />
        ))}

        {total < MAX_IMAGES && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong text-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
          >
            <ImagePlus className="size-5" strokeWidth={1.5} />
            <span className="text-xs font-medium">{total === 0 ? "Adicionar imagens" : "Adicionar"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = ""; // permite escolher o mesmo arquivo de novo
        }}
      />

      {total === 0 && value.removed.length === 0 && (
        <p className="text-xs text-subtle">Sem imagens, o produto usa uma capa neutra gerada automaticamente. Você também pode arrastar arquivos para cá.</p>
      )}

      {errors.length > 0 && (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-xs leading-relaxed text-danger">
          <p className="font-medium">Alguns arquivos não foram adicionados:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}

type TileProps = {
  src: string | null;
  name: string;
  detail: string;
  principal?: boolean;
  removed?: boolean;
  isNew?: boolean;
  disabled?: boolean;
  onPrincipal?: () => void;
  onRemove: () => void;
};

function Tile({ src, name, detail, principal, removed, isNew, disabled, onPrincipal, onRemove }: TileProps) {
  return (
    <figure className="min-w-0">
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-xl border bg-surface transition-[opacity,border-color]",
          principal ? "border-brand" : "border-line",
          removed && "opacity-35",
        )}
      >
        {src && <Image src={src} alt={name} fill unoptimized sizes="160px" className="object-contain p-1.5" />}
        {principal && (
          <span className="absolute top-1.5 left-1.5 rounded-full bg-brand px-2 py-0.5 text-[0.62rem] font-semibold text-on-brand">Principal</span>
        )}
        {isNew && !principal && (
          <span className="absolute top-1.5 left-1.5 rounded-full bg-canvas/80 px-2 py-0.5 text-[0.62rem] font-medium text-fg-soft backdrop-blur">Nova</span>
        )}
        <div className="absolute right-1.5 bottom-1.5 flex gap-1">
          {onPrincipal && (
            <TileButton label={`Tornar ${name} a imagem principal`} onClick={onPrincipal} disabled={disabled}>
              <Star className="size-3.5" strokeWidth={1.75} />
            </TileButton>
          )}
          <TileButton label={removed ? `Desfazer remoção de ${name}` : `Remover ${name}`} onClick={onRemove} disabled={disabled} danger={!removed}>
            {removed ? <Undo2 className="size-3.5" strokeWidth={1.75} /> : <Trash2 className="size-3.5" strokeWidth={1.75} />}
          </TileButton>
        </div>
      </div>
      <figcaption className="mt-1.5 min-w-0">
        <p className="truncate text-[0.7rem] text-fg-soft" title={name}>{name}</p>
        <p className={cn("text-[0.65rem]", removed ? "text-danger" : "text-subtle")}>{detail}</p>
      </figcaption>
    </figure>
  );
}

function TileButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex size-7 items-center justify-center rounded-full border border-line-strong bg-canvas/85 text-fg-soft backdrop-blur transition-colors disabled:opacity-50",
        danger ? "hover:border-danger hover:text-danger" : "hover:border-brand hover:text-brand",
      )}
    >
      {children}
    </button>
  );
}
