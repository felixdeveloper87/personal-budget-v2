# Personal Budget — Landing v2 (3D · animação completa)

> Documentação da versão "fintech premium escuro" com coreografia de animação de ponta a ponta.
> Arquivo de origem: `personal-budget-landing-3d-v2.html`

---

## Direção visual

**Conceito:** "private banking" em tema escuro — tinta-noturna com dourado champanhe, em vez do fintech escuro genérico.

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#070B14` | Fundo base |
| `--surface` / `--surface-2` | `#0E1422` / `#131B2E` | Cards e painéis |
| `--gold` | `#E8C57A` | Cor de marca / acentos |
| `--mint` | `#5EEAD4` | Valores positivos / "ao vivo" |
| `--text` / `--muted` | `#F5F2EA` / `#8B93A7` | Texto / texto secundário |

**Tipografia:** Fraunces (serifa display), Outfit (corpo), Spline Sans Mono (números e labels técnicos com `tabular-nums`).

---

## Estrutura da página

1. **Preloader** — logo revelado letra por letra + barra dourada; cortina sobe ao terminar.
2. **Nav sticky** — ganha blur e borda ao rolar; links com underline animado.
3. **Hero** — headline com revelação linha por linha (máscara overflow); cartão 3D + pills flutuantes.
4. **Ticker** — marquee infinito de categorias com fade nas bordas.
5. **Features** — 3 cards com tilt 3D, borda em gradiente girando e ícones que se desenham.
6. **Dashboard preview** — barras que crescem + donut que se desenha segmento a segmento.
7. **Stats** — 3 contadores animados.
8. **CTA** — glow pulsante + botão com anel de pulso.
9. **Footer** — wordmark gigante em marquee.

---

## Catálogo de animações

### Abertura (sequência única no load)
- Preloader: letras sobem (`riseIn`), barra `loadBar`, cortina `translateY(-101%)`.
- Nav: itens caem em cascata (`dropIn`, delays 0.25–0.49s).
- Headline: linhas sobem com máscara (`riseIn`, delays 0.55–0.79s).
- Cartão 3D: voa pra dentro girando (`cardIn`).
- Pills: `popIn` escalonado.

### Autônomas (rodam sozinhas — funcionam no mobile)
- **Cartão:** balanço 3D infinito (`sway`, alternate).
- **Varredura holográfica:** faixa de luz cruza o cartão a cada 6s (`holoSweep`).
- **Feed ao vivo:** transação nova entra a cada 2.8s via `setInterval` + `prepend`.
- **Partículas de poeira dourada:** `<canvas>` com ~42 partículas subindo + cintilando.
- **Shimmer** no texto dourado (`shimmer`).
- **Glint** no chip do cartão a cada 5s.
- Ticker e footer marquee infinitos.

### Reação ao scroll
- Barra de progresso (`scaleX` proporcional ao scroll).
- Nav `.scrolled` com blur.
- Reveals com `blur(6px) → 0` + translate.
- Parallax dos blobs de luz e das pills.
- Counters disparados por `IntersectionObserver`.
- Donut: `stroke-dashoffset` animado por segmento.

### Hover (desktop)
- Tilt 3D no cartão e nos feature cards (rotateX/Y por posição do mouse).
- **Botões magnéticos** que seguem o cursor (`.magnetic`).
- Brilho varrendo dentro dos botões (`i` com skew).

---

## Notas técnicas

- **Acessibilidade:** bloco `@media (prefers-reduced-motion: reduce)` desativa tudo, remove o loader e mostra estados finais.
- **Performance:** `will-change` nos elementos animados; scroll listeners com `{passive:true}`; canvas em `requestAnimationFrame`.
- **Counter genérico:** função `animateNum(el, target, fmt, dur)` com easing cúbico (`1 - (1-p)³`).
- **Zero dependências** — HTML/CSS/JS puro, uma única página.

---

## Para portar pro stack (React 18 + TS + Chakra + Framer Motion)

- Preloader / reveals → `AnimatePresence` + `motion.div` com `variants`.
- Tilt → `useMotionValue` + `useTransform` no `onMouseMove`, ou `framer-motion-3d`.
- Botão magnético → hook `useMagnetic()` reutilizável com `useSpring`.
- Feed ao vivo / counters → `useEffect` + `useReducer`.
- Tokens de cor → `extendTheme` do Chakra (`colors.gold`, `colors.mint`, etc.).
- Respeitar `useReducedMotion()` do Framer Motion para o fallback.
