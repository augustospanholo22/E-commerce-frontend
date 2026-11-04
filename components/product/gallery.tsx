"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { ProductArt } from "./product-art";

/**
 * Galeria da página de produto (imagem principal + miniaturas), no estilo da
 * referência. Com 0 ou 1 imagem, mostra apenas a principal.
 */
export function ProductGallery({ id, nome, count }: { id: number; nome: string; count: number }) {
  const [active, setActive] = useState(0);
  const multi = count > 1;
  const go = (d: number) => setActive((i) => (i + d + count) % count);

  return (
    <div className="space-y-3">
      <div className="group relative overflow-hidden rounded-[var(--radius-card)] border border-line">
        <ProductArt id={id} nome={nome} index={active} priority sizes="(min-width: 1024px) 58vw, 100vw" className="aspect-square sm:aspect-[5/4]" />
        {multi && (
          <>
            <GalleryArrow side="left" onClick={() => go(-1)} />
            <GalleryArrow side="right" onClick={() => go(1)} />
          </>
        )}
      </div>
      {multi && (
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ver imagem ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "overflow-hidden rounded-xl border transition-colors",
                i === active ? "border-fg" : "border-line hover:border-line-strong",
              )}
            >
              <ProductArt id={id} nome={nome} index={i} label={false} sizes="15vw" className="aspect-[4/3]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Imagem anterior" : "Próxima imagem"}
      className={cn(
        "absolute top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-canvas/70 text-fg backdrop-blur transition-colors hover:border-brand hover:text-brand",
        side === "left" ? "left-4" : "right-4",
      )}
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </button>
  );
}
