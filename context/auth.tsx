"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { api, TOKEN_KEY, UNAUTHORIZED_EVENT } from "@/lib/api";
import { decodeJwt } from "@/lib/jwt";
import { useIsClient } from "@/lib/use-is-client";
import type { CreateUsuarioDto, LoginResponse, Usuario } from "@/lib/types";

/* ------------------------------------------------------------------
   O token JWT fica no localStorage. Em vez de copiá-lo para um useState,
   "assinamos" o localStorage com useSyncExternalStore: assim todas as
   abas e componentes enxergam sempre o mesmo valor.
------------------------------------------------------------------- */
const TOKEN_EVENT = "vitrine:token";

/** Só roda no navegador. Token expirado é tratado como "sem login". */
function readToken() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const payload = token ? decodeJwt(token) : null;
    return payload && payload.exp * 1000 > Date.now() ? token : null;
  } catch {
    return null;
  }
}
function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* armazenamento indisponível */
  }
  window.dispatchEvent(new Event(TOKEN_EVENT));
}
function subscribe(cb: () => void) {
  window.addEventListener(TOKEN_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(TOKEN_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

type AuthState = {
  /** false até o navegador ler o token (evita "piscar" a UI) */
  ready: boolean;
  user: Usuario | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<void>;
  register: (dto: CreateUsuarioDto) => Promise<void>;
  logout: (reason?: "expired") => void;
  refreshUser: () => Promise<void>;
  expiredNotice: boolean;
  clearExpiredNotice: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const ready = useIsClient();
  const token = useSyncExternalStore(subscribe, readToken, () => null);
  const payload = useMemo(() => (token ? decodeJwt(token) : null), [token]);

  /** Dados completos vindos de GET /users/:id (o backend não tem /me) */
  const [profile, setProfile] = useState<Usuario | null>(null);
  const [expiredNotice, setExpiredNotice] = useState(false);

  const logout = useCallback((reason?: "expired") => {
    writeToken(null);
    setProfile(null);
    if (reason === "expired") setExpiredNotice(true);
  }, []);

  const fetchUser = useCallback(async (id: number) => {
    const u = await api<Usuario | null>(`/users/${id}`);
    if (u) setProfile(u);
    return u;
  }, []);

  // Carrega o nome do usuário sempre que o token muda
  useEffect(() => {
    if (!token || !payload) return;
    let active = true;
    api<Usuario | null>(`/users/${payload.sub}`)
      .then((u) => {
        if (!active) return;
        if (u) setProfile(u);
        else logout(); // usuário foi removido do banco
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [token, payload, logout]);

  // Expiração automática (o backend assina o token com validade de 1h)
  useEffect(() => {
    if (!token || !payload) return;
    const id = window.setTimeout(() => logout("expired"), Math.max(payload.exp * 1000 - Date.now(), 0));
    return () => window.clearTimeout(id);
  }, [token, payload, logout]);

  // Qualquer 401 vindo da API encerra a sessão
  useEffect(() => {
    const onUnauthorized = () => logout("expired");
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [logout]);

  const login = useCallback(async (email: string, senha: string) => {
    const { access_token } = await api<LoginResponse>("/auth/login", { method: "POST", body: { email, senha } });
    const p = decodeJwt(access_token);
    if (p) await fetchUser(p.sub).catch(() => undefined);
    writeToken(access_token);
    setExpiredNotice(false);
  }, [fetchUser]);

  /** POST /users é público; em seguida fazemos login com as mesmas credenciais */
  const register = useCallback(async (dto: CreateUsuarioDto) => {
    await api<Usuario>("/users", { method: "POST", body: dto });
    await login(dto.email, dto.senha);
  }, [login]);

  const refreshUser = useCallback(async () => {
    if (payload) await fetchUser(payload.sub);
  }, [payload, fetchUser]);

  const user = useMemo<Usuario | null>(() => {
    if (!token || !payload) return null;
    if (profile && profile.id === payload.sub) return profile;
    return { id: payload.sub, email: payload.email, nome: "" };
  }, [token, payload, profile]);

  const value = useMemo<AuthState>(
    () => ({
      ready, user, token, login, register, logout, refreshUser,
      expiredNotice, clearExpiredNotice: () => setExpiredNotice(false),
    }),
    [ready, user, token, login, register, logout, refreshUser, expiredNotice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
