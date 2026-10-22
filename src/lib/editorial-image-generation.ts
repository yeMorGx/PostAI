type VisualRole = "cover" | "content" | "final";

export function buildImageGenerationPrompt(visualRules: string, slide: { role: VisualRole; visual_direction: string }) {
  const requiredStyle = /`([^`]*photorealistic[^`]*)`/iu.exec(visualRules)?.[1];
  if (!requiredStyle) throw new Error("O manual Piersec não contém o sufixo visual obrigatório para fotografia.");
  return [
    "Generate one 4:5 photographic base from the English scene direction below. Use a relevant professional work, operations, or meeting context, with real people when the scene calls for them. Do not render words, numbers, logos, or readable interface content. Avoid hooded hackers, locks, shields, keys, green code on black screens, hands typing in darkness, and fear-based imagery. The slide copy and brand elements are applied separately.",
    `Slide role: ${slide.role}.\nScene direction: ${slide.visual_direction}`,
    requiredStyle,
  ].join("\n\n");
}
