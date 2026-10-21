import { describe, expect, it } from "vitest";
import { buildGeneratedDraft, extractMarkdownSources, imagePromptSuffix } from "./editorial-generation";

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

  it("gera newsletter responsiva com a conversa consultiva, WhatsApp e opt-out pendente", () => {
    const output = {
      subjects: ["Acesso e continuidade", "Uma revisão de acessos", "Governança de identidade", "Controles que acompanham mudanças", "Acesso privilegiado em pauta"],
      preheaders: ["Uma leitura para gestores", "Critérios para revisão periódica", "Governança conectada à operação"],
      headline: "Acesso *privilegiado* em pauta",
      body: Array.from({ length: 620 }, (_, index) => index % 2 ? "governança" : "continuidade").join(" "),
      cta_paragraph: "Converse com a equipe sobre como revisar responsabilidades, acessos e controles no contexto da sua operação.",
      button: "Falar com a Piersec",
    };
    const draft = buildGeneratedDraft("newsletter", output, context);
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

  it("exige a estrutura correta e o sufixo manual nos prompts fotográficos", () => {
    const caption = Array.from({ length: 90 }, (_, index) => index % 2 ? "governança" : "continuidade").join(" ");
    const slides = [
      { role: "cover", title: "Acesso seguro começa aqui", text: "Governança reduz riscos operacionais", visual_type: "photo", visual_direction: "Equipe analisando uma matriz de acessos em reunião.", image_prompt: `A real security team reviewing access governance in a modern office, natural light, ${imagePromptSuffix}`, source_attribution: "" },
      ...Array.from({ length: 4 }, (_, index) => ({ role: "content", title: `Revisão de acesso ${index + 1}`, text: "A equipe revisa privilégios e registra a decisão. O processo considera função, contexto e necessidade operacional.", visual_type: "graphic", visual_direction: "Diagrama sóbrio em navy, com hierarquia tipográfica clara.", image_prompt: "", source_attribution: sources[0].label })),
      { role: "final", title: "Compartilhe com a equipe", text: "Revise os acessos periodicamente.", visual_type: "graphic", visual_direction: "Síntese gráfica em navy com espaço para o rodapé da marca.", image_prompt: "", source_attribution: "" },
    ];
    const output = { caption, hashtags: ["#Cibersegurança", "#GestãoDeRisco", "#Governança", "#Continuidade", "#Piersec"], slides, alternative_hooks: ["Acesso também é uma decisão de negócio.", "Governança começa por saber quem tem acesso."], sources: [sources[0]], story: [] };
    const draft = buildGeneratedDraft("carousel", output, context);
    expect(draft.slides).toHaveLength(6);
    expect(draft.slides[0].image_prompt?.endsWith(imagePromptSuffix)).toBe(true);
    expect(draft.body).not.toContain("## STORY");

    const commercialFinal = structuredClone(output);
    commercialFinal.slides[5].text = "Fale conosco para agendar um diagnóstico.";
    expect(() => buildGeneratedDraft("carousel", commercialFinal, context)).toThrow(/chamada comercial/i);
  });
});
