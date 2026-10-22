import { describe, expect, it, vi } from "vitest";
import { buildGeneratedDraft, buildGeneratedDraftWithRepair, buildGenerationRepairRequest, extractMarkdownSources, generationInstructions } from "./editorial-generation";
import { buildImageGenerationPrompt } from "./editorial-image-generation";

const sources = Array.from({ length: 4 }, (_, index) => ({
  label: `Relatório primário ${index + 1}`,
  url: `https://research.example/report-${index + 1}`,
}));
const urls = sources.map((source) => source.url);
const briefing = `## BASE\n\n[[Rota consultada]]\n\n## FONTES\n\n${sources.map((source) => `- [${source.label}](${source.url})`).join("\n")}`;
const context = { title: "Governança de acessos", knowledgeContext: "Rota consultada: governança, acesso privilegiado e continuidade operacional.", webUrls: urls, approvedArticleBody: briefing, appUrl: "https://app.example" };

function articleOutput() {
  const article = Array.from({ length: 900 }, (_, index) => index % 3 === 0 ? "Governança" : index % 3 === 1 ? "operacional" : "continuidade").join(" ");
  const meta = "Gestão de acessos apoia governança e continuidade operacional com responsabilidades claras, revisão periódica e controles proporcionais ao contexto de cada empresa. ".repeat(2).slice(0, 155);
  return {
    title: "Governança de acessos nas empresas",
    alternative_titles: ["Como rever os acessos corporativos", "Controles de acesso e continuidade operacional"],
    meta_description: meta,
    slug: "governanca-de-acessos",
    category: "Governança",
    tags: ["Acessos", "Risco", "Continuidade"],
    article,
    sources: structuredClone(sources),
    base_learning: "Os dados analisados relacionam governança de acessos à continuidade operacional.",
    base_data: sources.map((source, index) => ({ claim: `Dado de referência empresarial número ${index + 1}`, url: source.url, validity: index ? "datado" : "perene", reference_period: index ? "outubro de 2026" : "perene" })),
    open_questions: [],
    lesson: "A revisão precisa considerar escopo e data de cada fonte.",
  };
}

describe("geração editorial alinhada ao manual Piersec", () => {
  it("corrige a descrição SEO curta sem gerar novamente o artigo completo", async () => {
    const invalid = { ...articleOutput(), meta_description: "Descrição curta retornada pela IA." };
    const repair = vi.fn(async (value: unknown, feedback: string) => {
      const request = buildGenerationRepairRequest("article", { instructions: "manual oficial", tools: [{ type: "web_search" }], tool_choice: "required", max_tool_calls: 4 }, context, value, feedback);
      expect(feedback).toContain("entre 150 e 160 caracteres");
      expect(request.metadataOnly).toBe(true);
      expect(request.body).not.toHaveProperty("tools");
      expect(request.body).not.toHaveProperty("tool_choice");
      expect(request.body).not.toHaveProperty("max_tool_calls");
      expect(request.body.max_output_tokens).toBe(1000);
      expect(JSON.parse(String(request.body.input)).article).toBe(invalid.article);
      return { ...invalid, meta_description: articleOutput().meta_description };
    });
    const draft = await buildGeneratedDraftWithRepair("article", invalid, context, repair);
    expect(repair).toHaveBeenCalledTimes(1);
    expect(draft.body).toContain(invalid.article);
    expect(draft.body).toContain(articleOutput().meta_description);
    expect(draft.sources).toEqual(sources);
  });

  it("não faz correções pagas quando a primeira saída está válida", async () => {
    const repair = vi.fn();
    await buildGeneratedDraftWithRepair("article", articleOutput(), context, repair);
    expect(repair).not.toHaveBeenCalled();
  });

  it("limita a correção a uma tentativa e apresenta uma mensagem legível se ela falhar", async () => {
    const invalid = { ...articleOutput(), meta_description: "Descrição curta." };
    const repair = vi.fn().mockResolvedValue(invalid);
    await expect(buildGeneratedDraftWithRepair("article", invalid, context, repair)).rejects.toThrow(/correção automática.*descrição SEO/u);
    expect(repair).toHaveBeenCalledTimes(1);
  });

  it("preserva dados, validade, lacunas e lição no bloco para a base", () => {
    const draft = buildGeneratedDraft("article", articleOutput(), context);
    expect(draft.content_type).toBe("article");
    expect(draft.body).toContain("## PARA A BASE");
    expect(draft.body).toContain("datado (outubro de 2026)");
    expect(draft.body).toContain("Lacunas:");
    expect(draft.body).toContain("Lição do ciclo:");
  });

  it("recusa antíteses e URLs de artigo ausentes do briefing aprovado", () => {
    const withAntithesis = articleOutput();
    withAntithesis.article = `A gestão não é apenas técnica, mas também operacional. ${withAntithesis.article}`;
    expect(() => buildGeneratedDraft("article", withAntithesis, context)).toThrow(/antítese/i);

    const withNewSource = articleOutput();
    withNewSource.sources[0] = { label: "Fonte não aprovada", url: "https://other.example/new" };
    expect(() => buildGeneratedDraft("article", withNewSource, context)).toThrow(/material aprovado/i);
  });

  it("gera newsletter responsiva com conversa consultiva automática, WhatsApp e opt-out pendente", () => {
    const output = {
      subjects: ["Acesso e continuidade", "Uma revisão de acessos", "Governança de identidade", "Controles que acompanham mudanças", "Acesso privilegiado em pauta"],
      preheaders: ["Uma leitura para gestores", "Critérios para revisão periódica", "Governança conectada à operação"],
      headline: "Acesso *privilegiado* em pauta",
      body: Array.from({ length: 620 }, (_, index) => index % 2 ? "governança" : "continuidade").join(" "),
      cta_paragraph: "Converse com a equipe sobre como revisar responsabilidades, acessos e controles no contexto da sua operação.",
      button: "Falar com a Piersec",
    };
    const draft = buildGeneratedDraft("newsletter", output, context);
    expect(generationInstructions("newsletter", "manual oficial")).toContain("Derive do artigo aprovado um convite consultivo geral");
    expect(generationInstructions("newsletter", "manual oficial")).toContain("sem inventar serviços, diagnósticos, avaliações ou compromissos");
    expect(draft.body).toContain("width:600px");
    expect(draft.body).toContain("{{unsubscribe_url}}");
    expect(draft.body).toContain("551332192277");
    expect(draft.body.length).toBeLessThan(30000);
  });

  it("gera post LinkedIn dentro da faixa e vincula a fonte a uma URL do artigo", () => {
    expect(extractMarkdownSources(briefing)).toHaveLength(4);
    const post = Array.from({ length: 5 }, (_, paragraph) => Array.from({ length: 54 }, (_, index) => (paragraph + index) % 2 ? "governança" : "continuidade").join(" ")).join("\n\n");
    const draft = buildGeneratedDraft("linkedin_post", {
      post,
      alternative_hooks: ["Acesso também é uma decisão de negócio.", "Governança começa por saber quem tem acesso."],
      data_point: "Revisões periódicas apoiam a gestão de acessos corporativos.",
      source: sources[0],
      hashtags: ["#Cibersegurança", "#GestãoDeRisco", "#ContinuidadeOperacional"],
    }, context);
    expect(draft.content_type).toBe("linkedin_post");
    expect(draft.sources).toHaveLength(1);
    expect(draft.body).toContain(sources[0].url);
  });

  it("usa apenas a direção visual e não devolve prompts de imagem inventados", () => {
    const caption = Array.from({ length: 90 }, (_, index) => index % 2 ? "governança" : "continuidade").join(" ");
    const slides = [
      { role: "cover", title: "Acesso seguro começa aqui", text: "Governança reduz riscos operacionais", visual_type: "photo", visual_direction: "A real security team reviewing access governance in a modern office, with natural light and a clear focal person.", source_attribution: "" },
      ...Array.from({ length: 4 }, (_, index) => ({ role: "content", title: `Revisão de acesso ${index + 1}`, text: "A equipe revisa privilégios e registra a decisão. O processo considera função, contexto e necessidade operacional.", visual_type: "graphic", visual_direction: "Diagrama sóbrio em navy, com hierarquia tipográfica clara.", source_attribution: sources[0].label })),
      { role: "final", title: "Compartilhe com a equipe", text: "Revise os acessos periodicamente.", visual_type: "graphic", visual_direction: "Síntese gráfica em navy com espaço para o rodapé da marca.", source_attribution: "" },
    ];
    const output = { caption, hashtags: ["#Cibersegurança", "#GestãoDeRisco", "#Governança", "#Continuidade", "#Piersec"], slides, alternative_hooks: ["Acesso também é uma decisão de negócio.", "Governança começa por saber quem tem acesso."], sources: [sources[0]], story: [] };
    const draft = buildGeneratedDraft("carousel", output, context);
    expect(draft.slides).toHaveLength(6);
    expect(draft.slides[0].visual_direction).toContain("real security team");
    expect("image_prompt" in draft.slides[0]).toBe(false);
    expect(draft.body).not.toContain("## STORY");

    const commercialFinal = structuredClone(output);
    commercialFinal.slides[5].text = "Fale conosco para agendar um diagnóstico.";
    expect(() => buildGeneratedDraft("carousel", commercialFinal, context)).toThrow(/chamada comercial/i);
  });

  it("usa o manual específico na geração textual e na composição da solicitação de imagem", () => {
    const manual = "## Voz da marca\n\nRegra canônica Piersec.";
    expect(generationInstructions("carousel", manual)).toContain(manual);
    expect(generationInstructions("carousel", manual)).toContain("Agente de carrossel");

    const imagePrompt = buildImageGenerationPrompt("Fotos: `photorealistic, editorial, no text, no logos, navy and cyan tones, soft cinematic light`.", {
      role: "cover",
      visual_direction: "A business leader reviewing access permissions in a natural office setting.",
    });
    expect(imagePrompt).toContain("A business leader reviewing access permissions");
    expect(imagePrompt).toContain("photorealistic, editorial, no text, no logos, navy and cyan tones, soft cinematic light");
    expect(imagePrompt).toContain("Do not render words, numbers, logos");
  });
});
