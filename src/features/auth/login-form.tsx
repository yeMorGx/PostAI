"use client";

import { useState } from "react";
import { Button, Description, Form, Input, Label, TextField } from "@heroui/react";
import { Notice } from "@/components/ui";
import { loginSchema } from "@/lib/schemas";
import { fetchJson } from "@/lib/api-client";

export function LoginForm({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    const input = loginSchema.safeParse({ email: email.trim() });
    if (!input.success) { setError("Informe um e-mail válido."); return; }
    setPending(true);
    try { const result = await fetchJson<{ message: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(input.data) }); setMessage(result.message); }
    catch (error) { setError(error instanceof Error ? error.message : "Não foi possível enviar o link."); }
    finally { setPending(false); }
  }
  return <Form onSubmit={submit} className="mt-8 space-y-5">
    <TextField type="email" name="email" value={email} onChange={setEmail} isRequired isDisabled={!configured || pending}><Label>E-mail de acesso</Label><Input autoComplete="email" placeholder="seu.email@empresa.com.br"/><Description>Use o e-mail que recebeu o convite da equipe Piersec.</Description></TextField>
    {error && <Notice status="danger">{error}</Notice>}{message && <Notice status="success">{message}</Notice>}
    <Button type="submit" variant="primary" className="w-full" isDisabled={!configured} isPending={pending}>{pending ? "Enviando link…" : "Receber link de entrada"}</Button>
  </Form>;
}
