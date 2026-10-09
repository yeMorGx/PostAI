# Logo animado

Derivado do vídeo `letras_animadas_nando.mp4` fornecido pelo usuário. O arquivo original em Downloads foi preservado.

- `logo-animated.webp`: versão animada usada na interface, com transparência.
- `logo-animated.webm`: vídeo VP9 com canal alfa, sem áudio.
- `logo-still.png`: primeiro quadro transparente para pausa e preferência por movimento reduzido.

Processamento: FFmpeg 7.1, `format=rgba,colorkey=0x00fe00:0.22:0.08,despill=type=green,crop=736:308:236:176`. WebP reduzido para 552 × 231, qualidade 85; WebM com `libvpx-vp9`, `yuva420p`, `auto-alt-ref=0`, CRF 24. As animações preservam a temporização variável do vídeo de origem.
