"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCw, WifiOff } from "lucide-react";
import { StatePanel } from "./states";
import { Button } from "./button";

/** Exibido quando um Server Component não consegue falar com a API. */
export function DataError({ message, className }: { message: string; className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <StatePanel
      tone="error"
      className={className}
      icon={<WifiOff className="size-5" strokeWidth={1.5} />}
      title="Não foi possível carregar"
      description={message}
      action={
        <Button variant="secondary" loading={pending} onClick={() => start(() => router.refresh())}>
          {!pending && <RotateCw className="size-4" strokeWidth={1.5} />}
          Tentar novamente
        </Button>
      }
    />
  );
}
