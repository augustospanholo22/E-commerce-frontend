"use client";

import { parseNestError } from "./errors";

/**
 * Cliente HTTP usado no navegador.
 * Sempre chama /api/... (proxy configurado em next.config.ts),
 * adiciona o token JWT quando existe e padroniza os erros.
 */

export const TOKEN_KEY = "vitrine_token";
export const UNAUTHORIZED_EVENT = "vitrine:unauthorized";

type Options = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

export async function api<T>(path: string, { method = "GET", body, auth = false }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
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
