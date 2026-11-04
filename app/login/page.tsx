"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { useToast } from "@/context/toast";
import { AuthArt, AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/states";
import { errorMessage } from "@/lib/errors";
import { nextPath } from "@/lib/redirect";

export default function LoginPage() {
  const { login, user, ready } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // Já logado → segue para o destino
  useEffect(() => {
    if (ready && user && !loading) router.replace(nextPath("/conta"));
  }, [ready, user, loading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await login(email.trim(), senha);
      toast("Bem-vindo de volta!");
      router.replace(nextPath("/"));
    } catch (err) {
      setErro(errorMessage(err));
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Entrar"
      title="Bom te ver de novo"
      description="Acesse sua conta para finalizar compras, acompanhar pedidos e gerenciar sua loja."
      aside={<AuthArt quote="Compre de quem faz. Direto da loja." caption="Vitrine · lojas independentes" />}
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {erro && <Alert>{erro}</Alert>}
        <Field label="E-mail" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
        </Field>
        <Field label="Senha" htmlFor="senha">
          <PasswordInput id="senha" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading} disabled={!email || !senha}>
          Entrar
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-fg underline-offset-4 hover:underline">
          Criar conta
        </Link>
      </p>
    </AuthShell>
  );
}
