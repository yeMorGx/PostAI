"use client";

import { Button, Form, Input, Label, TextField } from "@heroui/react";
import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Notice } from "@/components/ui";
import data from "./reference-data.json";
import { FilterButtons, ReferenceBadge, ReferenceCard, ReferenceHeader, ReferenceNotice } from "./reference-ui";

type LocalFile = { name: string; size: number; preview?: string };

export function CompanyIdentity() {
  const [category, setCategory] = useState("todas");
  const [decision, setDecision] = useState<"a" | "b" | null>(null);
  const [logos, setLogos] = useState<LocalFile[]>([]);
  const [documents, setDocuments] = useState<LocalFile[]>([]);
  const [rules, setRules] = useState(data.REG);
  const [newRule, setNewRule] = useState("");
  const [addingRule, setAddingRule] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const logoInput = useRef<HTMLInputElement>(null);
  const documentInput = useRef<HTMLInputElement>(null);
  const objectUrls = useRef<string[]>([]);
  useEffect(() => () => { objectUrls.current.forEach((url) => URL.revokeObjectURL(url)); }, []);

  function selectFiles(event: ChangeEvent<HTMLInputElement>, kind: "logo" | "document") {
    setError("");
    const files = Array.from(event.target.files ?? []);
    const valid = files.every((file) => kind === "logo" ? file.type === "image/png" && file.size <= 5 * 1024 * 1024 : /\.(pdf|doc|docx|md|txt)$/i.test(file.name) && file.size <= 10 * 1024 * 1024);
    if (!valid) { setError(kind === "logo" ? "Escolha apenas PNGs de até 5 MB." : "Escolha PDF, Word, Markdown ou texto de até 10 MB."); event.target.value = ""; return; }
    const selected = files.map((file) => {
      const preview = kind === "logo" ? URL.createObjectURL(file) : undefined;
      if (preview) objectUrls.current.push(preview);
      return { name: file.name, size: file.size, preview };
    });
    if (kind === "logo") setLogos((previous) => [...previous, ...selected]);
    else setDocuments((previous) => [...previous, ...selected]);
    setMessage("Arquivos selecionados nesta prévia. Ainda não foram enviados ao servidor nem analisados pela IA.");
    event.target.value = "";
  }

  return <div className="reference-page">
    <ReferenceHeader title="Identidade da empresa" description="Tudo que os agentes leem antes de escrever e que a arte usa para montar as peças."/>
    {message && <Notice>{message}</Notice>}{error && <Notice status="danger">{error}</Notice>}
    <div className="reference-identity-columns"><div className="space-y-5">
      <ReferenceCard title="Logos e arquivos" description="PNG com fundo transparente. Cada versão é usada onde o fundo pede.">
        <div className="reference-logo-grid">{[["logo-claro.png", "Para fundo claro", "light"], ["logo-escuro.png", "Para fundo escuro", "dark"], ["icone.png", "Perfil e miniaturas", "icon"]].map(([name, note, theme]) => <div className="reference-logo-file" key={name}><div className={`reference-logo-preview ${theme}`}>{theme === "icon" ? <span>P</span> : "PIERSEC"}</div><div className="p-2"><p className="font-semibold text-sm">{name}</p><p className="muted text-sm">{note}</p></div></div>)}</div>
        <div className="reference-upload"><p className="font-semibold">Escolha arquivos PNG</p><p className="muted text-sm">Até 5 MB por arquivo. Só PNG nesta área.</p><Button variant="secondary" className="mt-2" onPress={() => logoInput.current?.click()}>Escolher arquivos</Button><input ref={logoInput} type="file" accept="image/png" multiple className="sr-only" tabIndex={-1} aria-label="Selecionar logos PNG" onChange={(event) => selectFiles(event, "logo")}/></div>
        {!!logos.length && <div className="reference-logo-grid mt-3">{logos.map((file, index) => <div className="reference-logo-file" key={`${file.name}-${index}`}><Image src={file.preview!} alt={file.name} width={160} height={84} unoptimized className="h-21 w-full object-contain"/><p className="text-sm break-all p-2">{file.name}</p></div>)}</div>}
      </ReferenceCard>
      <ReferenceCard title="Cores"><div className="reference-colors">{[["Navy", "#0A0F1E"], ["Ciano", "#33C3ED"], ["Destaque", "#43E3FA"], ["Fundo claro", "#EFF2F7"]].map(([name, color]) => <div key={name}><span style={{ background: color }}/><p><b>{name}</b><br/>{color}</p></div>)}</div></ReferenceCard>
      <ReferenceCard title="Banco de imagens" description="Fotos próprias, públicas (Pexels) e geradas. A origem de cada uma fica registrada."><div className="reference-image-bank">{data.BANCO.map(([name, origin, tone, background]) => <div key={name}><div className="reference-bank-preview" style={{ background }}/><p className="text-sm font-semibold mt-1">{name}</p><ReferenceBadge tone={tone}>{origin}</ReferenceBadge></div>)}</div></ReferenceCard>
    </div><div className="space-y-5">
      <ReferenceCard title="Documentos da marca" description="A fonte de verdade da empresa. Qualquer formato: a IA lê, extrai as regras e você confirma."><ul className="reference-list">{data.DOCS.map((document) => <li key={document.nome}><div><p className="font-semibold break-all">{document.nome}</p><p className="muted text-sm">{document.detalhe}</p></div><ReferenceBadge tone={document.pill}>{document.status}</ReferenceBadge></li>)}{documents.map((file, index) => <li key={`${file.name}-${index}`}><div><p className="font-semibold break-all">{file.name}</p><p className="muted text-sm">{Math.ceil(file.size / 1024)} KB · selecionado localmente</p></div><ReferenceBadge>Não enviado</ReferenceBadge></li>)}</ul>
        <div className="reference-upload"><p className="font-semibold">Enviar manual da marca ou guia de voz</p><p className="muted text-sm">PDF, Word, Markdown ou texto. Pode enviar vários.</p><Button variant="secondary" className="mt-2" onPress={() => documentInput.current?.click()}>Escolher documentos</Button><input ref={documentInput} type="file" accept=".pdf,.doc,.docx,.md,.txt" multiple className="sr-only" tabIndex={-1} aria-label="Selecionar documentos da marca" onChange={(event) => selectFiles(event, "document")}/></div>
      </ReferenceCard>
      <ReferenceCard><div className="reference-between"><div><h2>O que a IA entendeu da marca</h2><p className="muted text-sm mt-1">Cada regra aponta o trecho de origem. Regras confirmadas passam a valer em toda peça.</p></div><ReferenceBadge tone="p-teal">{rules.length} confirmadas</ReferenceBadge></div>
        {decision ? <div className="reference-publication-success mt-3">Decisão registrada nesta prévia: a assinatura {decision === "a" ? "não conta" : "conta"} como menção da empresa.</div> : <div className="reference-conflict"><h3>Os documentos pedem coisas diferentes</h3><p className="mt-1">A voz limita a empresa a uma menção por peça. O manual usa a assinatura “Segurança Digital Simplificada” em toda arte. Qual regra vale para a assinatura?</p><div className="reference-actions mt-3"><Button variant="primary" onPress={() => setDecision("a")}>A assinatura não conta como menção</Button><Button variant="secondary" onPress={() => setDecision("b")}>Conta como menção</Button></div></div>}
        <div className="my-4"><FilterButtons label="Categoria da regra" value={category} onChange={setCategory} options={["todas", "Proibido", "Obrigatório", "Tom", "Visual"].map((id) => ({ id, name: id === "todas" ? "Todas" : id }))}/></div>
        <ul>{rules.filter((rule) => category === "todas" || rule.cat === category).map((rule, index) => <li key={`${rule.texto}-${index}`} className="reference-rule"><div className="reference-actions"><ReferenceBadge tone={rule.pill}>{rule.cat}</ReferenceBadge><ReferenceBadge>{rule.verif}</ReferenceBadge></div><p className="font-semibold mt-2">{rule.texto}</p><p className="muted text-sm mt-1">Origem: {rule.origem}</p></li>)}</ul>
        <div className="reference-actions mt-4"><Button variant="secondary" onPress={() => setAddingRule((value) => !value)}>Adicionar regra</Button><Button variant="secondary" onPress={() => setMessage("A releitura automática será integrada à API. Os documentos e regras exibidos são os exemplos do HTML.")}>Reler documentos</Button></div>
        {addingRule && <Form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); const text = newRule.trim(); if (!text) return; setRules((previous) => [...previous, { cat: "Obrigatório", pill: "p-azul", verif: "Definida manualmente", texto: text, origem: "Equipe · demonstração local" }]); setNewRule(""); setAddingRule(false); setCategory("todas"); }}><TextField value={newRule} onChange={setNewRule} isRequired><Label>Texto da regra</Label><Input maxLength={1000}/></TextField><Button type="submit" variant="primary">Adicionar nesta prévia</Button></Form>}
      </ReferenceCard>
      <ReferenceCard title="Conexões" description="Usadas só para ler resultados. A publicação é manual."><ul className="reference-list">{data.conexoes.map((connection) => <li key={connection.nome}><div><p className="font-semibold">{connection.nome}</p><p className="muted text-sm">{connection.nome === "Brevo" ? "Lê campanhas da empresa" : connection.detalhe}</p></div><ReferenceBadge tone={connection.pill}>{connection.status}</ReferenceBadge></li>)}</ul><p className="muted text-sm mt-3">Estados ilustrativos do HTML. As contas ainda não foram conectadas.</p></ReferenceCard>
    </div></div><ReferenceNotice/>
  </div>;
}
