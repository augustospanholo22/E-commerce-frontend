import "server-only";
import { cache } from "react";
import { ApiError, parseNestError } from "./errors";
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

/** A API responde 404 para registro inexistente → tratamos como null (página "não encontrado"). */
async function orNull<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

// cache() do React evita buscar o mesmo recurso duas vezes na mesma renderização
export const getProdutos = cache(() => serverGet<Produto[]>("/produtos"));
export const getProduto = cache((id: number) => orNull(serverGet<Produto>(`/produtos/${id}`)));
export const getLojas = cache(() => serverGet<Loja[]>("/lojas"));
export const getLoja = cache((id: number) => orNull(serverGet<LojaComProdutos>(`/lojas/${id}`)));
