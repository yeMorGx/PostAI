"use client";

import { Button } from "@heroui/react";
import { useState } from "react";
import { Notice } from "@/components/ui";
import data from "./reference-data.json";
import { useReferenceState } from "./reference-state";
import { FilterButtons, ReferenceBadge, ReferenceCard, ReferenceHeader, ReferenceNotice } from "./reference-ui";

export type DeliveryChannel = keyof typeof data.PK;
const channels: DeliveryChannel[] = ["blog", "lkart", "lkpost", "news", "carrossel"];

export function DeliveryPackage({ initialChannel = "carrossel" }: { initialChannel?: DeliveryChannel }) {
  const [channel, setChannel] = useState<DeliveryChannel>(initialChannel);
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [image, setImage] = useState(0);
  const [bankOpen, setBankOpen] = useState(false);
  const [bankImage, setBankImage] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [copyError, setCopyError] = useState("");
  const { published, setPublished } = useReferenceState();
  const pack = data.PK[channel];
  const automatic = channel === "blog" || channel === "news" || channel === "carrossel";
  const detection = channel === "blog" ? "O PostAI confere o WordPress da empresa e reconhece o artigo pelo slug definido ao lado." : channel === "news" ? "O PostAI lê as campanhas do Brevo e reconhece esta pelo nome indicado ao lado. Use o nome exato." : "O PostAI lê as publicações da conta e reconhece o carrossel pela legenda e pelo horário.";

  async function copy(key: string, text: string) {
    setCopyError("");
    try { await navigator.clipboard.writeText(text); setCopied((previous) => ({ ...previous, [key]: true })); }
    catch { setCopyError("Não foi possível copiar. Selecione o texto no bloco e copie manualmente."); }
  }

  return <div className="reference-page">
    <ReferenceHeader title="Pacote de entrega" description="Tudo pronto para copiar e colar. Textos, imagens e o passo a passo de cada canal."/>
    <div className="reference-filters" role="group" aria-label="Canais">{channels.map((key) => <Button key={key} variant={channel === key ? "primary" : "secondary"} aria-pressed={channel === key} className="reference-tab" onPress={() => { setChannel(key); setMessage(""); setBankOpen(false); setBankImage(null); }}>{data.PK[key].aba}{published[key] && <ReferenceBadge tone="p-teal">Publicada</ReferenceBadge>}</Button>)}</div>
    <ReferenceCard title="Conferência da marca" description="As regras de Piersec foram verificadas antes desta peça chegar ao pacote.">
      <div className="reference-between"><span className="muted text-sm">Conferência ilustrativa do protótipo</span><ReferenceBadge tone="p-teal">10 de 10 regras cumpridas</ReferenceBadge></div>
      <ul className="reference-checks">{data.conferencia.map((check) => <li key={check}><span className="reference-check">✓</span>{check}</li>)}</ul>
      <p className="muted text-sm mt-3">Se uma regra obrigatória falhar, o texto volta para ajuste automático e só chega aqui depois de cumprir todas. Falhando de novo, a equipe é avisada.</p>
    </ReferenceCard>
    {message && <Notice>{message}</Notice>}{copyError && <Notice status="danger">{copyError}</Notice>}
    <div className="reference-delivery-columns">
      <ReferenceCard><div className="reference-between"><h2 className="text-lg">{pack.imgTitulo}</h2><span className="muted text-sm">{pack.dims}</span></div>
        {pack.eCarrossel ? <><div className="reference-slides">{data.SL.map(([page, title, supporting, theme]) => <div key={page} className={`reference-slide ${theme === "cover" ? "is-dark" : ""}`}><p className="reference-slide-number">{page} / 07</p><h3>{title}</h3><p>{supporting}</p><footer><span className="reference-logo-placeholder">logo.png</span><span>@piersecurity</span></footer></div>)}</div><p className="muted text-sm mt-3">Mostrando 4 de 7 lâminas. Texto, logo e rodapé aplicados por layout, nunca pela IA.</p></> : <><div className="reference-image-preview" style={{ aspectRatio: channel === "lkpost" ? "4/5" : channel === "news" ? "600/180" : channel === "blog" ? "1200/630" : "16/9", background: bankImage === null ? data.GRAD[image % 3] : data.BANCO[bankImage][3] }}><span>{bankImage === null ? "Imagem gerada (exemplo)" : data.BANCO[bankImage][0]}</span><span>Variação {(image % 3) + 1} de 3</span></div><p className="muted text-sm mt-3">{pack.imgNota}</p></>}
        <div className="reference-actions mt-3"><Button variant="secondary" onPress={() => setMessage("O HTML contém prévias visuais, sem arquivos finais de imagem. A exportação será conectada à geração de artes.")}>{pack.baixar}</Button>{pack.eImagem && <><Button variant="secondary" onPress={() => { setImage((value) => value + 1); setBankImage(null); setMessage("Variação visual de exemplo. A API de geração de imagens ainda não foi executada."); }}>Gerar outra</Button><Button variant="secondary" onPress={() => setBankOpen((value) => !value)}>Usar do banco</Button></>}</div>
        {bankOpen && <div className="reference-image-bank mt-4">{data.BANCO.map(([name, origin, , background], index) => <Button key={name} variant="secondary" className="reference-bank-option" onPress={() => { setBankImage(index); setBankOpen(false); }}><span style={{ background }}/><span>{name}<small>{origin} · exemplo</small></span></Button>)}</div>}
      </ReferenceCard>
      <div className="space-y-3">{pack.blocos.map((block) => <ReferenceCard key={`${channel}-${block.k}`}><div className="reference-between"><h3 className="text-base font-semibold">{block.label}</h3><Button variant={copied[block.k] ? "tertiary" : "secondary"} onPress={() => { void copy(block.k, block.text); }}>{copied[block.k] ? "Copiado" : "Copiar"}</Button></div><div className="reference-copy-block">{block.text}</div></ReferenceCard>)}</div>
    </div>
    <ReferenceCard><div className="reference-two-columns"><div><h2>Como publicar em {pack.rotulo}</h2><p className="muted text-sm mt-1 mb-3">Destino: {pack.destino}</p><ol className="list-decimal pl-5 space-y-1">{pack.passos.map((step) => <li key={step}>{step}</li>)}</ol>{["lkpost", "lkart", "news"].includes(channel) && <p className="muted text-sm mt-3">Os links para o site já estão com rastreamento. Não remova o final do endereço: é ele que permite medir quantas visitas esta peça traz.</p>}</div>
      <div>{published[channel] ? <><div className="reference-publication-success"><h3>Publicada em 07/10/2026</h3><p className="mt-1">{automatic ? "Detectada na simulação às 10:02. O painel exibe resultados de exemplo." : "Registrada pela equipe nesta demonstração."}</p></div><Button variant="secondary" className="mt-3" onPress={() => setPublished(channel, false)}>Desfazer (só no protótipo)</Button></> : automatic ? <><h2>Publicação</h2><div className="reference-publication-status"><h3>Aguardando publicação</h3><p className="mt-1">{detection}</p><p className="muted text-sm mt-2">Você não precisa avisar nem colar link. Se a publicação sair com texto muito diferente, o PostAI mostra as publicações recentes para você escolher qual é.</p></div><Button variant="secondary" className="mt-3" onPress={() => setPublished(channel, true)}>Simular detecção (só no protótipo)</Button></> : <><h2>Depois de publicar</h2><p className="muted text-sm mt-2 mb-3">O LinkedIn não avisa o PostAI. Um clique registra a data e libera o painel para medir o tráfego que esta peça traz ao site.</p><Button variant="primary" onPress={() => setPublished(channel, true)}>Marcar como publicada</Button><p className="muted text-sm mt-2">Registro local de demonstração.</p></>}</div>
    </div></ReferenceCard><ReferenceNotice/>
  </div>;
}
