"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useToast } from "@/context/toast";
import { AuthArt, AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/states";
import { errorMessage } from "@/lib/errors";
import { nextPath } from "@/lib/redirect";
import { cn } from "@/lib/cn";

export default function CadastroPage() {
  const { register, user, ready } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmar: "" });
  const [erro, setErro] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user && !loading) router.replace(nextPath("/conta"));
  }, [ready, user, loading, router]);

  // Mesmas regras do CreateUsuarioDto no backend
  const errors = {
    nome: form.nome.trim() ? "" : "Informe seu nome.",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? "" : "Informe um e-mail válido.",
    senha: form.senha.length >= 6 ? "" : "Use pelo menos 6 caracteres.",
    confirmar: form.confirmar === form.senha ? "" : "As senhas não coincidem.",
  };
  const valid = Object.values(errors).every((e) => !e);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setErro("");
    setLoading(true);
    try {
      await register({ nome: form.nome.trim(), email: form.email.trim(), senha: form.senha });
      toast("Conta criada! Você já está conectado.");
      router.replace(nextPath("/"));
    } catch (err) {
      // E-mail duplicado → 409 "Este e-mail já está em uso." (mensagem da API)
      setErro(errorMessage(err));
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Criar conta"
      title="Comece em um minuto"
      description="Com uma conta você compra, acompanha pedidos e pode abrir sua própria loja."
      aside={<AuthArt quote="Sua conta. Seus pedidos. Sua loja." caption="Crie sua conta grátis" />}
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {erro && <Alert>{erro}</Alert>}
        <Field label="Nome completo" htmlFor="nome" error={touched ? errors.nome : ""}>
          <Input id="nome" autoComplete="name" value={form.nome} onChange={set("nome")} aria-invalid={touched && !!errors.nome} placeholder="Como devemos te chamar?" />
        </Field>
        <Field label="E-mail" htmlFor="email" error={touched ? errors.email : ""}>
          <Input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} aria-invalid={touched && !!errors.email} placeholder="voce@exemplo.com" />
        </Field>
        <Field label="Senha" htmlFor="senha" error={touched ? errors.senha : ""}>
          <PasswordInput id="senha" autoComplete="new-password" value={form.senha} onChange={set("senha")} aria-invalid={touched && !!errors.senha} placeholder="Mínimo de 6 caracteres" />
        </Field>
        <div className="-mt-2 flex items-center gap-2 text-xs">
          <span className={cn("flex size-4 items-center justify-center rounded-full transition-colors", form.senha.length >= 6 ? "bg-brand text-on-brand" : "bg-line-strong text-transparent")}>
            <Check className="size-2.5" strokeWidth={3} />
          </span>
          <span className={form.senha.length >= 6 ? "text-brand" : "text-muted"}>Pelo menos 6 caracteres</span>
        </div>
        <Field label="Confirmar senha" htmlFor="confirmar" error={touched ? errors.confirmar : ""}>
          <PasswordInput id="confirmar" autoComplete="new-password" value={form.confirmar} onChange={set("confirmar")} aria-invalid={touched && !!errors.confirmar} placeholder="Repita a senha" />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Criar conta
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-fg underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
