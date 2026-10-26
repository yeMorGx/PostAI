"use client";

import { Button, Modal } from "@heroui/react";
import { formatCostRange, PRICING_URL, type CostRange, type GenerationEstimate } from "@/lib/generation-cost";

export function GenerationConfirmationDialog({
  isOpen,
  estimate,
  cost,
  description,
  imageCount = estimate.images?.max_count ?? 0,
  imageCountIsMaximum = true,
  showText = true,
  replacementWarning,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  estimate: GenerationEstimate;
  cost: CostRange;
  description: string;
  imageCount?: number;
  imageCountIsMaximum?: boolean;
  showText?: boolean;
  replacementWarning?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const imageRate = estimate.images?.per_image;

  return <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }} isDismissable>
    <Modal.Container size="sm">
      <Modal.Dialog className="editorial-generation-confirm">
        <Modal.Header>
          <Modal.Heading>Confirmar geração</Modal.Heading>
        </Modal.Header>
        <Modal.Body>
          <p>{description}</p>
          <div className="editorial-generation-confirm__price" aria-label={`Custo estimado entre ${formatCostRange(cost)}`}>
            <span>Faixa estimada em dólares</span>
            <strong>{formatCostRange(cost)}</strong>
          </div>
          {replacementWarning && <p className="editorial-generation-confirm__warning">{replacementWarning}</p>}
          <p className="editorial-muted">O custo final pode variar. Valores em dólar, antes de câmbio e impostos.</p>
          <details className="editorial-generation-confirm__details">
            <summary>Detalhes do custo</summary>
            {showText && estimate.text && <p>Texto e pesquisa: {formatCostRange(estimate.text)} · {estimate.text_model}.</p>}
            {imageCount > 0 && imageRate && <p>Fotos: {imageCountIsMaximum ? `até ${imageCount}` : imageCount}, estimadas em {formatCostRange({ min: imageRate.min * imageCount, max: imageRate.max * imageCount })} · {estimate.image_model}.</p>}
            <p>A previsão inclui respostas, buscas e correções automáticas. Não é um limite de cobrança. O consumo informado pela OpenAI inclui as etapas concluídas mesmo se uma etapa posterior falhar.</p>
            <p>Preços conferidos em {new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${estimate.pricing_date}T12:00:00Z`))}. Valores antes de câmbio e impostos.</p>
            <p><a href={PRICING_URL} target="_blank" rel="noreferrer">Consultar preços oficiais da OpenAI</a>.</p>
          </details>
        </Modal.Body>
        <Modal.Footer className="editorial-generation-confirm__actions">
          <Button variant="secondary" autoFocus onPress={onClose}>Voltar</Button>
          <Button variant="primary" onPress={onConfirm}>Confirmar e gerar</Button>
        </Modal.Footer>
      </Modal.Dialog>
    </Modal.Container>
  </Modal.Backdrop>;
}
