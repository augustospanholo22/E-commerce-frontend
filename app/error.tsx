"use client";

import { Container } from "@/components/ui/container";
import { Button, LinkButton } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="flex flex-col items-center py-24 text-center sm:py-32">
      <p className="eyebrow">Algo deu errado</p>
      <h1 className="mt-4 font-display text-4xl sm:text-5xl">Não conseguimos abrir esta página</h1>
      <p className="mt-3 max-w-md text-muted">{error.message || "Tente novamente em instantes."}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Tentar novamente</Button>
        <LinkButton href="/" variant="secondary">Página inicial</LinkButton>
      </div>
    </Container>
  );
}
