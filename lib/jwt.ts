/** Payload que o backend assina em auth.service.ts: { sub, email } + iat/exp */
export type JwtPayload = { sub: number; email: string; iat: number; exp: number };

/**
 * Decodifica (sem validar a assinatura) o payload do JWT.
 * A validação real é feita pelo backend em cada rota protegida;
 * aqui só lemos o id do usuário (sub) e a expiração.
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}
