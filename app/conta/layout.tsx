"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Package, Store, User } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { Container } from "@/components/ui/container";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/conta", label: "Meu perfil", icon: User },
  { href: "/conta/pedidos", label: "Pedidos", icon: Package },
  { href: "/painel", label: "Painel do vendedor", icon: Store },
];

export default function ContaLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AccountShell>{children}</AccountShell>
    </RequireAuth>
  );
}

function AccountShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <Container className="pt-8 sm:pt-12">
      <div className="flex animate-fade-up items-center gap-5">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand font-display text-2xl text-on-brand sm:size-20 sm:text-3xl">
          {(user?.nome || user?.email || "?").charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="eyebrow">Minha conta</p>
          <h1 className="mt-1 truncate font-display text-3xl font-bold sm:text-5xl">Olá, {user?.nome?.split(" ")[0] || "cliente"}</h1>
          <p className="truncate text-sm text-muted">{user?.email}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[14rem_1fr] lg:gap-14">
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0" aria-label="Conta">
          <Suspense fallback={<AccountLinks pathname={null} />}>
            <ActiveAccountLinks />
          </Suspense>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-fg lg:mt-4 lg:rounded-xl"
          >
            <LogOut className="size-4" strokeWidth={1.5} /> Sair
          </button>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}

function ActiveAccountLinks() {
  return <AccountLinks pathname={usePathname()} />;
}

function AccountLinks({ pathname }: { pathname: string | null }) {
  const active = (href: string) => pathname !== null && (href === "/conta" ? pathname === "/conta" : pathname.startsWith(href));
  return (
    <>
      {LINKS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors lg:rounded-xl",
            active(href) ? "bg-brand-soft font-medium text-brand" : "text-fg-soft hover:bg-surface-2",
          )}
        >
          <Icon className="size-4" strokeWidth={1.5} />
          {label}
        </Link>
      ))}
    </>
  );
}
