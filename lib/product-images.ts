import type { Produto } from "./types";

/**
 * Imagens dos produtos — agora vindas do BACKEND.
 *
 * O vendedor envia as fotos pelo painel (POST /produtos/:id/imagens). O backend
 * grava o arquivo em disco e guarda no banco apenas o caminho público, por ex.:
 *   produto.imagemUrl  = "/uploads/produtos/3f2c…e1.jpg"   (imagem principal)
 *   produto.imagens[]  = galeria completa, ordenada
 *
 * O navegador acessa esses arquivos pelo proxy do Next (/api/... → backend),
 * igual às demais chamadas da API — não há cadastro manual de imagens aqui.
 */

/** Converte o caminho salvo no banco em uma URL utilizável no <img>. */
export function imageSrc(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path; // ex.: futuro armazenamento S3/CDN
  if (path.startsWith("/uploads/")) return `/api${path}`;
  return null;
}

type ComImagens = Pick<Produto, "imagemUrl"> & { imagens?: Produto["imagens"] };

/** Todas as imagens do produto, com a principal primeiro. */
export function productImageUrls(p: ComImagens): string[] {
  const galeria = (p.imagens ?? []).map((i) => i.url);
  const ordenada = p.imagemUrl ? [p.imagemUrl, ...galeria.filter((u) => u !== p.imagemUrl)] : galeria;
  return ordenada.map(imageSrc).filter((u): u is string => !!u);
}

/** Imagem de capa (principal) ou null. */
export function productCover(p: ComImagens): string | null {
  return imageSrc(p.imagemUrl) ?? productImageUrls(p)[0] ?? null;
}

/**
 * Capas de LOJA continuam opcionais e locais (o modelo Loja não tem imagem):
 * coloque o arquivo em public/lojas e registre aqui pelo id da loja.
 */
export const STORE_IMAGES: Record<number, string> = {
  // 1: "/lojas/loja-teste.jpg",
};

export function getStoreImage(id: number): string | null {
  return STORE_IMAGES[id] ?? null;
}
