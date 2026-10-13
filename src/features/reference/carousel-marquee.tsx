"use client";

import type { EditorialAsset } from "@/lib/editorial";

export function CarouselMarquee({ assets, slides }: { assets: EditorialAsset[]; slides: { title: string; text: string }[] }) {
  const ordered = [...assets].sort((a, b) => a.position - b.position);
  if (!ordered.length) return <p className="editorial-empty-assets">As lâminas aparecerão aqui quando as imagens forem anexadas ao ciclo da semana.</p>;
  const renderSlides = (copy: number) => <div className="reference-slides-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
    {ordered.map((asset, index) => <figure key={`${copy}-${asset.id}`} className="reference-slide-image">
      {asset.url && <img src={asset.url} alt={copy === 1 ? "" : `Lâmina ${index + 1}`} loading="lazy"/>}
      <figcaption><span>{index + 1} / {ordered.length}</span><strong>{slides[index]?.title || asset.file_name}</strong>{slides[index]?.text && <small>{slides[index].text}</small>}</figcaption>
    </figure>)}
  </div>;
  return <div className="reference-slides-marquee" role="region" aria-label="Prévia em movimento das lâminas do carrossel; mantenha o foco ou passe o mouse para pausar" tabIndex={0}>
    <div className="reference-slides-track">{renderSlides(0)}{renderSlides(1)}</div>
  </div>;
}
