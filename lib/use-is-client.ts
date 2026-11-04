import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** true apenas no navegador, depois da hidratação (sem setState em efeito). */
export function useIsClient() {
  return useSyncExternalStore(noop, () => true, () => false);
}
