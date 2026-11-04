import "server-only";
import { cache } from "react";
import { parseNestError } from "./errors";
import type { Loja, LojaComProdutos, Produto } from "./types";

/**
 * Cliente usado pelos Server Components.
 * Roda no Node, então pode chamar o backend diretamente (CORS só afeta o navegador).
 */
const API_URL = process.env.API_URL ?? "http://localhost:3000";

async function serverGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw parseNestError(res.status, body);
  return body as T;
}

// cache() do React evita buscar o mesmo recurso duas vezes na mesma renderização
export const getProdutos = cache(() => serverGet<Produto[]>("/produtos"));
/** O backend responde 200 com corpo vazio quando o id não existe → null */
export const getProduto = cache((id: number) => serverGet<Produto | null>(`/produtos/${id}`));
export const getLojas = cache(() => serverGet<Loja[]>("/lojas"));
export const getLoja = cache((id: number) => serverGet<LojaComProdutos | null>(`/lojas/${id}`));
