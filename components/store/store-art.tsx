import Image from "next/image";
import { cn } from "@/lib/cn";
import { getStoreImage } from "@/lib/product-images";
import { initialOf } from "../product/art";

/**
 * Capa da loja: foto (se registrada em lib/product-images.ts → STORE_IMAGES)
 * ou uma capa tipográfica escura com o monograma da loja.
 */
export function StoreArt({ id, nome, className, sizes = "(min-width: 1024px) 33vw, 100vw" }: { id: number; nome: string; className?: string; sizes?: string }) {
  const src = getStoreImage(id);
  return (
    <div className={cn("@container relative block size-full overflow-hidden bg-surface", className)}>
      {src ? (
        <Image src={src} alt={`Capa da loja ${nome}`} fill sizes={sizes} className="object-cover" />
      ) : (
        <div role="img" aria-label={`Capa da loja ${nome}`} className="absolute inset-0">
          {/* grade discreta, como uma mesa de trabalho */}
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:10cqw_10cqw]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex aspect-square w-[34%] max-w-36 items-center justify-center rounded-full border border-line-strong bg-canvas font-display text-[13cqw] leading-none font-bold text-fg">
              {initialOf(nome)}
            </span>
          </div>
          <span aria-hidden className="absolute top-[8%] right-[6%] size-[max(4px,1.6cqw)] rounded-full bg-brand" />
        </div>
      )}
    </div>
  );
}
