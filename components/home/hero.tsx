import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { HeroStage, HeroStageSkeleton, HeroStats } from "./hero-art";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <Container className="grid items-center gap-12 pt-8 pb-16 sm:pt-12 lg:grid-cols-12 lg:gap-14 lg:pt-16 lg:pb-24">
        <div className="lg:col-span-6">
          <p className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-line-strong px-3 py-1.5 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-brand" />
            Marketplace de lojas independentes
          </p>
          <h1
            className="mt-6 animate-fade-up font-display text-[2.6rem] leading-[1.02] font-bold tracking-[-0.035em] text-fg sm:text-[3.75rem] xl:text-[4.25rem]"
            style={{ animationDelay: "80ms" }}
          >
            Lojas independentes.
            <br />
            <span className="text-brand">Um só lugar.</span>
          </h1>
          <p className="mt-6 max-w-md animate-fade-up text-base leading-relaxed text-muted sm:text-lg" style={{ animationDelay: "160ms" }}>
            Pequenos negócios com catálogos próprios. Descubra, compre e acompanhe seus pedidos sem sair da Vitrine.
          </p>
          <div className="mt-9 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <LinkButton href="/produtos" size="lg">
              Explorar produtos <ArrowRight className="size-4" strokeWidth={2} />
            </LinkButton>
            <LinkButton href="/lojas" size="lg" variant="secondary">
              Conhecer as lojas
            </LinkButton>
          </div>
          <div className="mt-12 max-w-md">
            <Suspense fallback={<div className="skeleton h-20" />}>
              <HeroStats />
            </Suspense>
          </div>
        </div>

        <div className="lg:col-span-6">
          <Suspense fallback={<HeroStageSkeleton />}>
            <HeroStage />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
