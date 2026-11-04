"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth";

/** Protege páginas que precisam de login (as rotas do backend exigem JWT). */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    // window.location em vez de usePathname(): não bloqueia o pré-render das rotas dinâmicas
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        <Loader2 className="size-5 animate-spin" strokeWidth={1.5} />
      </div>
    );
  }
  return <>{children}</>;
}
