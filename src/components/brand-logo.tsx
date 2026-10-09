"use client";

import Image from "next/image";
import { useState } from "react";
import { AppLink } from "@/components/ui";

export function BrandLogo({ href = "/", compact = false, inline = false }: { href?: string; compact?: boolean; inline?: boolean }) {
  const [playing, setPlaying] = useState(true);

  return (
    <span className={`brand-logo ${compact ? "brand-logo--compact" : ""} ${inline ? "brand-logo--inline" : ""}`} data-playing={playing}>
      <AppLink href={href} className="brand-logo__link">
        <span className="sr-only">{inline ? "PostAI" : "PostAI — início"}</span>
        <Image src="/brand/logo-still.png" alt="" width={736} height={308} unoptimized className="brand-logo__still" loading="eager" />
        {playing && <Image src="/brand/logo-animated.webp" alt="" width={552} height={231} unoptimized className="brand-logo__animation" loading="eager" onError={() => setPlaying(false)} />}
      </AppLink>
    </span>
  );
}
