/** Lê ?next=/rota com segurança (apenas caminhos internos). */
export function nextPath(fallback = "/") {
  if (typeof window === "undefined") return fallback;
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
