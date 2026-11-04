/** Hash simples e determinístico (mesmo texto → mesmo número). */
export function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function initialOf(nome: string) {
  const ch = nome.trim().charAt(0);
  return ch ? ch.toUpperCase() : "V";
}
