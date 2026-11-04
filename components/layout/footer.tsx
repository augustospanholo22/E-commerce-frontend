import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "./logo";

const COLS = [
  { title: "Comprar", links: [["Todos os produtos", "/produtos"], ["Lojas", "/lojas"], ["Sacola", "/carrinho"]] },
  { title: "Sua conta", links: [["Entrar", "/login"], ["Criar conta", "/cadastro"], ["Meus pedidos", "/conta/pedidos"]] },
  { title: "Vender", links: [["Painel do vendedor", "/painel"], ["Abrir uma loja", "/painel"]] },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-canvas-deep sm:mt-32">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Um marketplace de lojas independentes. Cada loja cuida do próprio catálogo; você encontra tudo em um só lugar.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLS.map((col) => (
              <div key={col.title}>
                <p className="eyebrow mb-4 text-subtle">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-sm text-fg-soft transition-colors hover:text-brand">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-8 text-xs text-subtle sm:flex-row sm:justify-between">
          <p>Vitrine — projeto acadêmico de e-commerce (Next.js + NestJS).</p>
          <p>Feito com cuidado no Brasil.</p>
        </div>
      </Container>
    </footer>
  );
}
