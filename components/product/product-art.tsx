"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { initialOf } from "./art";

type Props = {
  id: number;
  nome: string;
  /** URL da imagem (use productCover(produto)). Sem URL → placeholder. */
  src?: string | null;
  className?: string;
  /** Mostra o código do produto no canto */
  label?: boolean;
  sizes?: string;
  priority?: boolean;
};

/**
 * Imagem do produto com fallback.
 * - Com imagem → foto inteira (object-contain: sem cortes nem distorção) sobre o fundo escuro.
 * - Sem imagem, ou se o arquivo falhar ao carregar → placeholder neutro com o monograma.
 */
export function ProductArt({ id, nome, src, className, label = true, sizes = "(min-width: 1024px) 25vw, 50vw", priority }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = !!src && failedSrc !== src;

  return (
    <div className={cn("@container relative block size-full overflow-hidden bg-surface", className)}>
      {/* luz de estúdio sutil vinda de cima */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_38%,rgb(255_255_255/0.06),transparent_70%)]" />
      {showImage ? (
        <Image
          src={src}
          alt={nome}
          fill
          sizes={sizes}
          priority={priority}
          // As imagens vêm da API (via proxy /api); servimos o arquivo original.
          unoptimized
          onError={() => setFailedSrc(src)}
          className="object-contain p-[7%] drop-shadow-[0_24px_30px_rgba(0,0,0,0.55)]"
        />
      ) : (
        <div role="img" aria-label={`${nome} — sem imagem`} className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-[34cqw] leading-none font-bold text-fg/[0.09] select-none">{initialOf(nome)}</span>
          <span aria-hidden className="absolute bottom-[18%] h-[6%] w-[46%] rounded-[50%] bg-black/35 blur-md" />
        </div>
      )}
      {label && (
        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[0.65rem] tracking-[0.18em] text-subtle uppercase">
          <span className="size-1.5 rounded-full bg-brand" />
          {`Nº ${String(id).padStart(3, "0")}`}
        </span>
      )}
    </div>
  );
}
