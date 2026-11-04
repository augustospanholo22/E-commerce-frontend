/**
 * Imagens dos produtos e das lojas.
 *
 * O backend (schema Prisma) NÃO tem campo de imagem. Para não inventar dados,
 * as fotos ficam no próprio frontend, em /public, ligadas pelo id real do registro:
 *
 *   1. Coloque a foto em  public/produtos/caderno.png   (PNG com fundo transparente fica melhor)
 *   2. Registre aqui:      1: ["/produtos/caderno.png"]   ← 1 = id do produto no banco
 *
 * Várias imagens por produto viram uma galeria com miniaturas na página do produto.
 * Produto sem imagem mostra um placeholder neutro (nunca uma imagem quebrada).
 *
 * Quando o backend ganhar um campo `imagemUrl`, basta trocar getProductImages()
 * para ler esse campo — os componentes não mudam.
 */
export const PRODUCT_IMAGES: Record<number, string[]> = {
  // 1: ["/produtos/caderno.png", "/produtos/caderno-2.png"],
};

/** Capa das lojas (opcional): id da loja → imagem em public/lojas */
export const STORE_IMAGES: Record<number, string> = {
  // 1: "/lojas/loja-teste.jpg",
};

export function getProductImages(id: number): string[] {
  return PRODUCT_IMAGES[id] ?? [];
}

export function getStoreImage(id: number): string | null {
  return STORE_IMAGES[id] ?? null;
}
