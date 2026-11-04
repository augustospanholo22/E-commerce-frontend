import Image from "next/image";
import { cn } from "@/lib/cn";
import { getProductImages } from "@/lib/product-images";
import { initialOf } from "./art";

type Props = {
  id: number;
  nome: string;
  className?: string;
  /** Mostra o código do produto no canto */
  label?: boolean;
  /** Índice da imagem (galeria) */
  index?: number;
  /** Tamanho aproximado na tela, para o next/image escolher a resolução */
  sizes?: string;
  priority?: boolean;
};

/**
 * Imagem do produto.
 * - Se houver foto registrada em lib/product-images.ts → exibe a foto (object-contain,
 *   como fotografia de estúdio sobre o fundo escuro).
 * - Se não houver → placeholder neutro de "estúdio" com o monograma do produto.
 */
export function ProductArt({ id, nome, className, label = true, index = 0, sizes = "(min-width: 1024px) 25vw, 50vw", priority }: Props) {
  const src = getProductImages(id)[index];

  return (
    <div className={cn("@container relative block size-full overflow-hidden bg-surface", className)}>
      {/* luz de estúdio sutil vinda de cima */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_38%,rgb(255_255_255/0.06),transparent_70%)]" />
      {src ? (
        <Image src={src} alt={nome} fill sizes={sizes} priority={priority} className="object-contain p-[9%] drop-shadow-[0_24px_30px_rgba(0,0,0,0.55)]" />
      ) : (
        <div role="img" aria-label={`${nome} — imagem indisponível`} className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-[34cqw] leading-none font-bold text-fg/[0.09] select-none">
            {initialOf(nome)}
          </span>
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
