import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";

export function AuthShell({ eyebrow, title, description, children, aside }: { eyebrow: string; title: string; description: string; children: React.ReactNode; aside: React.ReactNode }) {
  return (
    <Container className="py-8 sm:py-12">
      <div className="grid overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface lg:min-h-[40rem] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-12 sm:px-14 lg:px-16">
          <div className="mx-auto w-full max-w-sm animate-fade-up">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-[2.6rem]">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
            <div className="mt-10">{children}</div>
          </div>
        </div>
        <div className="relative hidden border-l border-line bg-canvas lg:block">{aside}</div>
      </div>
    </Container>
  );
}

/** Painel lateral das telas de autenticação: mensagem + benefícios reais da conta. */
export function AuthArt({ quote, caption }: { quote: string; caption: string }) {
  const perks = ["Finalize compras com seu endereço salvo", "Acompanhe o status de cada pedido", "Abra sua loja e publique produtos"];
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-12">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 text-xs text-muted">
          <span className="size-1.5 rounded-full bg-brand" /> {caption}
        </span>
        <p className="mt-6 max-w-md font-display text-[2.2rem] leading-[1.1] font-bold tracking-[-0.03em]">{quote}</p>
      </div>
      <ul className="relative space-y-4">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-3 text-sm text-fg-soft">
            <span className="flex size-6 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Check className="size-3.5" strokeWidth={2.5} />
            </span>
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
