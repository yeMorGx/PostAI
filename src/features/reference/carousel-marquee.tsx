"use client";

import type { EditorialAsset } from "@/lib/editorial";

export function CarouselMarquee({ assets, slides }: { assets: EditorialAsset[]; slides: { title: string; text: string }[] }) {
  const ordered = [...assets].sort((a, b) => a.position - b.position);
  if (!ordered.length) return <p className="editorial-empty-assets">As lâminas aparecerão aqui quando as imagens forem anexadas ao ciclo da semana.</p>;
  const renderSlides = (copy: number) => <div className="reference-slides-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
    {ordered.map((asset, index) => {
      const match = /^slide-(\d{2})\.webp$/u.exec(asset.file_name);
      const slideIndex = match ? Number(match[1]) - 1 : index;
      const slide = slides[slideIndex];
      return <figure key={`${copy}-${asset.id}`} className="reference-slide-image">
        {asset.url && <img src={asset.url} alt={copy === 1 ? "" : `Lâmina ${slideIndex + 1}: ${slide?.title || asset.file_name}`} loading="lazy"/>}
        <figcaption><span>{slideIndex + 1} / {slides.length || ordered.length}</span><strong>{slide?.title || asset.file_name}</strong>{slide?.text && <small>{slide.text}</small>}</figcaption>
      </figure>;
    })}
  </div>;
  return <div className="reference-slides-marquee" role="region" aria-label="Prévia em movimento das lâminas do carrossel; mantenha o foco ou passe o mouse para pausar" tabIndex={0}>
    <div className="reference-slides-track">{renderSlides(0)}{renderSlides(1)}</div>
  </div>;
}
