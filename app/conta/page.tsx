"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { useToast } from "@/context/toast";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert, Skeleton } from "@/components/ui/states";
import { PasswordInput } from "@/components/auth/password-input";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import type { Profile, UpdateProfileDto, UpdateUsuarioDto, Usuario } from "@/lib/types";

export default function PerfilPage() {
  return (
    <div className="space-y-8">
      <DadosPessoaisKeyed />
      <Endereco />
    </div>
  );
}

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="animate-fade-up rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <div className="mt-7">{children}</div>
    </section>
  );
}

/** Recria o formulário quando os dados do usuário chegam/mudam */
function DadosPessoaisKeyed() {
  const { user } = useAuth();
  return <DadosPessoais key={`${user?.nome}|${user?.email}`} />;
}

/** PUT /users/:id — nome, e-mail e (opcionalmente) nova senha */
function DadosPessoais() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [nome, setNome] = useState(user?.nome ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [senha, setSenha] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [erro, setErro] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return null;
  const dirty = nome !== user.nome || email !== user.email || senha.length > 0;
  // O backend exige a senha atual para trocar e-mail ou senha
  const precisaSenhaAtual = email.trim() !== user.email || senha.length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (senha && senha.length < 6) return setErro("A nova senha precisa ter pelo menos 6 caracteres.");
    if (precisaSenhaAtual && !senhaAtual) return setErro("Informe sua senha atual para alterar e-mail ou senha.");
    setErro("");
    setSaving(true);
    try {
      const body: UpdateUsuarioDto = { nome: nome.trim(), email: email.trim() };
      if (senha) body.senha = senha;
      if (precisaSenhaAtual) body.senhaAtual = senhaAtual;
      await api<Usuario>(`/users/${user.id}`, { method: "PUT", body, auth: true });
      await refreshUser();
      setSenha("");
      setSenhaAtual("");
      toast("Dados atualizados.");
    } catch (err) {
      setErro(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Dados pessoais" description="Como você aparece na Vitrine e como acessa sua conta.">
      <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
        {erro && <Alert className="sm:col-span-2">{erro}</Alert>}
        <Field label="Nome" htmlFor="nome">
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </Field>
        <Field label="E-mail" htmlFor="email" hint="Usado para entrar na sua conta.">
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Nova senha" htmlFor="senha" hint="Deixe em branco para manter a atual." className="sm:col-span-2 sm:max-w-sm">
          <PasswordInput id="senha" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" placeholder="••••••" />
        </Field>
        {precisaSenhaAtual && (
          <Field label="Senha atual" htmlFor="senha-atual" hint="Necessária para confirmar a troca de e-mail ou senha." className="animate-fade-in sm:col-span-2 sm:max-w-sm">
            <PasswordInput id="senha-atual" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} autoComplete="current-password" required />
          </Field>
        )}
        <div className="sm:col-span-2">
          <Button type="submit" loading={saving} disabled={!dirty}>Salvar alterações</Button>
        </div>
      </form>
    </Card>
  );
}

/** Perfil do usuário logado: GET /profiles/me + PUT /profiles/me (cria ou atualiza) */
function Endereco() {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [erro, setErro] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    api<Profile | null>("/profiles/me", { auth: true })
      .then((mine) => {
        setProfile(mine);
        setTelefone(mine?.telefone ?? "");
        setEndereco(mine?.endereco ?? "");
      })
      .catch((e) => setErro(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErro("");
    setSaving(true);
    try {
      const body: UpdateProfileDto = { telefone: telefone.trim() || undefined, endereco: endereco.trim() || undefined };
      const saved = await api<Profile>("/profiles/me", { method: "PUT", body, auth: true });
      setProfile(saved);
      toast("Endereço salvo.");
    } catch (err) {
      setErro(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Contato e entrega" description="Usamos este endereço para preencher automaticamente o checkout.">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 max-w-sm" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          {erro && <Alert>{erro}</Alert>}
          <Field label="Telefone" htmlFor="telefone" className="sm:max-w-sm">
            <Input id="telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-0000" />
          </Field>
          <Field label="Endereço completo" htmlFor="endereco">
            <Textarea id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} rows={3} placeholder="Rua, número, complemento, bairro, cidade e CEP" />
          </Field>
          <Button type="submit" loading={saving}>{profile ? "Salvar endereço" : "Adicionar endereço"}</Button>
        </form>
      )}
    </Card>
  );
}
