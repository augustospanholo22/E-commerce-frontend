import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center py-24 text-center sm:py-32">
      <p className="font-display text-[7rem] leading-none font-bold text-brand sm:text-[10rem]">404</p>
      <h1 className="mt-6 font-display text-4xl">Esta página não está na vitrine</h1>
      <p className="mt-3 max-w-md text-muted">O endereço pode estar errado, ou o item foi removido pela loja.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href="/produtos">Ver produtos</LinkButton>
        <LinkButton href="/" variant="secondary">Página inicial</LinkButton>
      </div>
    </Container>
  );
}
