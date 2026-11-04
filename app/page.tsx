import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { LinkButton } from "@/components/ui/button";
import { ProductGridSkeleton } from "@/components/product/product-card";
import { StoreCardSkeleton } from "@/components/store/store-card";
import { Hero } from "@/components/home/hero";
import { FeaturedSection, HowItWorks, SellerBanner, StoresSection, ValueStrip } from "@/components/home/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueStrip />

      <section className="mt-20 sm:mt-28">
        <Container>
          <SectionHeading
            eyebrow="Selecionados"
            title="Destaques da vitrine"
            description="Produtos publicados pelas lojas, com preço e estoque atualizados."
            action={
              <LinkButton href="/produtos" variant="secondary">
                Ver catálogo <ArrowRight className="size-4" strokeWidth={1.75} />
              </LinkButton>
            }
          />
          <div className="mt-12">
            <Suspense fallback={<ProductGridSkeleton />}>
              <FeaturedSection />
            </Suspense>
          </div>
        </Container>
      </section>

      <section className="mt-24 sm:mt-32">
        <Container>
          <SectionHeading
            eyebrow="Quem vende"
            title="Lojas na Vitrine"
            description="Cada loja tem seu próprio catálogo. Conheça quem está por trás dos produtos."
            action={
              <LinkButton href="/lojas" variant="ghost">
                Todas as lojas <ArrowRight className="size-4" strokeWidth={1.75} />
              </LinkButton>
            }
          />
          <div className="mt-12">
            <Suspense
              fallback={
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <StoreCardSkeleton />
                  <StoreCardSkeleton />
                  <StoreCardSkeleton />
                </div>
              }
            >
              <StoresSection />
            </Suspense>
          </div>
        </Container>
      </section>

      <SellerBanner />
      <HowItWorks />
    </>
  );
}
