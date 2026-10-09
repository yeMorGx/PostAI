"use client";

import { Button } from "@heroui/react";
import Image from "next/image";
import { useState } from "react";
import { AppLink } from "@/components/ui";

export function BrandLogo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  const [playing, setPlaying] = useState(true);

  return (
    <div className={`brand-logo ${compact ? "brand-logo--compact" : ""}`} data-playing={playing}>
      <AppLink href={href} className="brand-logo__link">
        <span className="sr-only">PostAI — início</span>
        <Image src="/brand/logo-still.png" alt="" width={736} height={308} unoptimized className="brand-logo__still" loading="eager" />
        {playing && <Image src="/brand/logo-animated.webp" alt="" width={552} height={231} unoptimized className="brand-logo__animation" loading="eager" onError={() => setPlaying(false)} />}
      </AppLink>
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        className="brand-logo__control"
        aria-label={playing ? "Pausar animação do logo" : "Reproduzir animação do logo"}
        onPress={() => setPlaying((value) => !value)}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          {playing ? <path d="M4 3h3v10H4zm5 0h3v10H9z" /> : <path d="m5 2 8 6-8 6z" />}
        </svg>
      </Button>
    </div>
  );
}
