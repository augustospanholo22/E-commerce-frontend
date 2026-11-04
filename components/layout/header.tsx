"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Package, Search, ShoppingBag, Store, User, X } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useCart } from "@/context/cart";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/container";
import { Logo } from "./logo";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/lojas", label: "Lojas" },
];

export function Header() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();
  const { count, openDrawer, hydrated } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha menus quando o usuário navega por um link
  const closeAll = () => {
    setMobileOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);
  };

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const firstName = user?.nome?.split(" ")[0];

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim();
    router.push(q ? `/produtos?q=${encodeURIComponent(q)}` : "/produtos");
    setSearchOpen(false);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || mobileOpen ? "border-b border-line bg-canvas/85 backdrop-blur-md" : "border-b border-line bg-canvas",
      )}
    >
      <Container className="flex h-[4.25rem] items-center gap-6 lg:h-20">
        <button
          className="-ml-2 rounded-full p-2 text-fg md:hidden"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
        </button>

        <Logo onClick={closeAll} className="max-md:absolute max-md:left-1/2 max-md:-translate-x-1/2" />

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Principal">
          {/* usePathname() é um dado de runtime: isolado em Suspense para não bloquear o pré-render */}
          <Suspense fallback={<NavLinks pathname={null} />}>
            <ActiveNavLinks />
          </Suspense>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="rounded-full p-2.5 text-fg transition-colors hover:bg-surface-2"
            aria-label="Buscar produtos"
            aria-expanded={searchOpen}
          >
            <Search className="size-[1.15rem]" strokeWidth={1.5} />
          </button>

          {/* Conta */}
          <div className="relative hidden md:block" ref={menuRef}>
            {ready && user ? (
              <>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full py-1.5 pr-3 pl-1.5 text-sm text-fg transition-colors hover:bg-surface-2"
                  aria-expanded={menuOpen}
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-brand font-display text-[0.8rem] text-on-brand">
                    {(user.nome || user.email).charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-28 truncate">{firstName || "Conta"}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-60 animate-fade-up overflow-hidden rounded-xl border border-line-strong bg-surface p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]">
                    <div className="border-b border-line px-3 py-3">
                      <p className="truncate text-sm font-medium">{user.nome}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                    <MenuLink onClick={closeAll} href="/conta" icon={<User className="size-4" strokeWidth={1.5} />}>Meu perfil</MenuLink>
                    <MenuLink onClick={closeAll} href="/conta/pedidos" icon={<Package className="size-4" strokeWidth={1.5} />}>Meus pedidos</MenuLink>
                    <MenuLink onClick={closeAll} href="/painel" icon={<Store className="size-4" strokeWidth={1.5} />}>Painel do vendedor</MenuLink>
                    <button
                      onClick={() => {
                        logout();
                        router.push("/");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-fg"
                    >
                      <LogOut className="size-4" strokeWidth={1.5} /> Sair
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeAll}
                className={cn("rounded-full px-4 py-2 text-sm text-fg transition-opacity hover:bg-surface-2", !ready && "opacity-0")}
              >
                Entrar
              </Link>
            )}
          </div>

          <button
            onClick={() => {
              closeAll();
              openDrawer();
            }}
            className="relative rounded-full p-2.5 text-fg transition-colors hover:bg-surface-2"
            aria-label={`Abrir sacola (${count} ${count === 1 ? "item" : "itens"})`}
          >
            <ShoppingBag className="size-[1.15rem]" strokeWidth={1.5} />
            {hydrated && count > 0 && (
              <span className="tabular absolute top-1 right-0.5 flex h-[1.1rem] min-w-[1.1rem] animate-fade-in items-center justify-center rounded-full bg-brand px-1 text-[0.65rem] font-bold text-on-brand">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        </div>
      </Container>

      {/* Busca */}
      {searchOpen && (
        <div className="animate-fade-in border-t border-line bg-canvas">
          <Container className="py-4">
            <form onSubmit={onSearch} className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" strokeWidth={1.5} />
              <input
                ref={searchRef}
                name="q"
                placeholder="O que você procura?"
                className="h-13 w-full rounded-xl border border-line-strong bg-surface pr-4 pl-11 text-[0.9375rem] text-fg outline-none placeholder:text-subtle focus:border-brand focus:shadow-[0_0_0_4px_rgb(162_236_52/0.12)]"
                onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
              />
            </form>
          </Container>
        </div>
      )}

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="h-[calc(100dvh-4.25rem)] animate-fade-in overflow-y-auto border-t border-line bg-canvas md:hidden">
          <Container className="flex flex-col py-6">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeAll}
                style={{ animationDelay: `${i * 50}ms` }}
                className="animate-fade-up border-b border-line py-4 font-display text-3xl text-fg"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-8 flex flex-col gap-1">
              {user ? (
                <>
                  <p className="eyebrow mb-2">Olá, {firstName || user.email}</p>
                  <MenuLink onClick={closeAll} href="/conta" icon={<User className="size-4" strokeWidth={1.5} />}>Meu perfil</MenuLink>
                  <MenuLink onClick={closeAll} href="/conta/pedidos" icon={<Package className="size-4" strokeWidth={1.5} />}>Meus pedidos</MenuLink>
                  <MenuLink onClick={closeAll} href="/painel" icon={<Store className="size-4" strokeWidth={1.5} />}>Painel do vendedor</MenuLink>
                  <button onClick={() => { logout(); closeAll(); }} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted">
                    <LogOut className="size-4" strokeWidth={1.5} /> Sair
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={closeAll} className="flex h-12 items-center justify-center rounded-lg border border-line-strong text-sm">
                    Entrar
                  </Link>
                  <Link href="/cadastro" onClick={closeAll} className="flex h-12 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-on-brand">
                    Criar conta
                  </Link>
                </div>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

function NavLinks({ pathname }: { pathname: string | null }) {
  const isActive = (href: string) => pathname !== null && (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn("relative rounded-full px-4 py-2 text-sm transition-colors", isActive(item.href) ? "text-fg" : "text-muted hover:text-fg")}
        >
          {item.label}
          {isActive(item.href) && <span className="absolute inset-x-4 -bottom-0.5 h-0.5 bg-brand" />}
        </Link>
      ))}
    </>
  );
}

function MenuLink({ href, icon, children, onClick }: { href: string; icon: React.ReactNode; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-fg-soft hover:bg-surface-2 hover:text-fg">
      <span className="text-muted">{icon}</span>
      {children}
    </Link>
  );
}
