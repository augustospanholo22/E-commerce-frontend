const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatPrice = (value: number) => brl.format(value);

export function formatDate(iso: string, withTime = false) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(iso));
}

export function pluralize(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** Status de pedido é uma string livre no backend; normalizamos para exibição. */
export function statusInfo(status: string): { label: string; tone: "outline" | "brand" | "neutral" | "danger" } {
  const s = status.toUpperCase();
  if (s === "PENDENTE") return { label: "Pendente", tone: "outline" };
  if (["PAGO", "ENVIADO", "ENTREGUE", "CONCLUIDO", "CONCLUÍDO"].includes(s))
    return { label: status.charAt(0) + status.slice(1).toLowerCase(), tone: "brand" };
  if (s === "CANCELADO") return { label: "Cancelado", tone: "danger" };
  return { label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(), tone: "neutral" };
}

export function stockInfo(estoque: number) {
  if (estoque <= 0) return { label: "Esgotado", tone: "danger" as const };
  if (estoque <= 3) return { label: `Últimas ${estoque} unidades`, tone: "outline" as const };
  return { label: `${estoque} em estoque`, tone: "brand" as const };
}
