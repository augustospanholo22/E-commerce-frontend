"use client";

import { parseNestError } from "./errors";
import type { Produto } from "./types";

/**
 * Cliente HTTP usado no navegador.
 * Sempre chama /api/... (proxy configurado em next.config.ts),
 * adiciona o token JWT quando existe e padroniza os erros.
 */

export const TOKEN_KEY = "vitrine_token";
export const UNAUTHORIZED_EVENT = "vitrine:unauthorized";

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Objeto (enviado como JSON) ou FormData (enviado como multipart/form-data) */
  body?: unknown;
  auth?: boolean;
};

export async function api<T>(path: string, { method = "GET", body, auth = false }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  // Em multipart NÃO definimos Content-Type: o navegador gera o cabeçalho com o "boundary".
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    cache: "no-store",
  });

  // O Nest pode responder 200 com corpo vazio (ex.: findOne de id inexistente).
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    // Token expirado (validade de 1h no backend) → avisa o AuthProvider
    if (res.status === 401 && auth) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw parseNestError(res.status, data);
  }
  return data as T;
}

// ---------------------------------------------------------------
// Imagens de produto (rotas protegidas: só o dono da loja altera)
// ---------------------------------------------------------------

/** POST /produtos/:id/imagens — multipart, campo "imagens" */
export function uploadProdutoImagens(produtoId: number, files: File[]) {
  const form = new FormData();
  for (const f of files) form.append("imagens", f, f.name);
  return api<Produto>(`/produtos/${produtoId}/imagens`, { method: "POST", body: form, auth: true });
}

/** DELETE /produtos/:id/imagens/:imagemId */
export function removeProdutoImagem(produtoId: number, imagemId: number) {
  return api<Produto>(`/produtos/${produtoId}/imagens/${imagemId}`, { method: "DELETE", auth: true });
}

/** PATCH /produtos/:id/imagens/:imagemId/principal */
export function setImagemPrincipal(produtoId: number, imagemId: number) {
  return api<Produto>(`/produtos/${produtoId}/imagens/${imagemId}/principal`, { method: "PATCH", auth: true });
}
