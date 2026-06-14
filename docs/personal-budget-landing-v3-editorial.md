# Personal Budget — Landing v3 (Editorial · guilloché)

> Documentação da versão "gravura de cédula encontra fintech editorial".
> Arquivo de origem: `personal-budget-landing-v3-editorial.html`

---

## Direção visual

**Conceito:** o padrão **guilloché** — as linhas entrelaçadas de segurança impressas em cédulas — como assinatura de marca, gerado por código e girando lentamente. Verde-tinta profundo + jade luminoso + serifa editorial gigante.

| Token | Valor | Uso |
|---|---|---|
| `--bg` / `--bg2` | `#070A08` / `#0B100D` | Fundo (verde quase preto) |
| `--jade` | `#7FE6B3` | Cor de marca / acentos |
| `--gold` | `#D9B36A` | Acento secundário (linhas guilloché) |
| `--cream` | `#EFEAE0` | Texto |
| `--muted` | `#94A398` | Texto secundário |
| `--panel` | `rgba(18,26,21,.6)` | Cards (com `backdrop-filter`) |

**Tipografia:** Instrument Serif (display editorial, com itálico expressivo), Schibsted Grotesk (corpo), Spline Sans Mono (técnico).

---

## Estrutura da página

1. **Cursor customizado** — ponto + anel com inércia que "engole" elementos e mostra rótulos.
2. **Preloader** — contador 0→100 + barra + "carregando clareza…".
3. **Hero** — tipografia massiva "Clareza é riqueza." + guilloché girando ao fundo.
4. **Mockup scroll-scrubbed** — dashboard completo deitado em 3D que se levanta ao rolar.
5. **Ticker** — stats em marquee que entorta com a velocidade do scroll.
6. **Bento grid** — 6 células com **micro-demos funcionais** (não ícones).
7. **Manifesto** — seção fixa onde o texto acende palavra por palavra.
8. **Depoimentos** — duas fileiras em sentidos opostos, reativas ao scroll.
9. **CTA** — tipografia gigante + guilloché + botão com pulso.
10. **Footer** — wordmark em contorno com varredura de luz jade.

---

## Assinatura: guilloché gerado por código

Função `guilloche(svg, n, rx, ry, op)` cria `n` elipses rotacionadas em torno do centro, alternadas entre dois `<g>` que giram em sentidos opostos (`spin` 140s / `spinR` 200s). Cada 5ª linha usa dourado em vez de jade. Máscara radial suaviza as bordas. Usado em 3 escalas: hero, CTA e dentro de uma célula do bento.

---

## Catálogo de animações

### Mockup com scroll-scrubbing (destaque)
- Estado inicial: `rotateX(24deg) translateY(70px) scale(.94)` (deitado).
- Conforme o mockup sobe na viewport, `scrub` (0→1) interpola até o estado plano.
- Suavizado com `lerp(scrub, prog, .1)` no loop — inércia real, não step.
- Dentro: ponto luminoso viaja pelo gráfico (`getPointAtLength`), transações entram ao vivo, barras de orçamento preenchem.

### Bento — micro-demos vivas
- **Busca:** digita "posto" sozinha (`setInterval`), resultados aparecem em cascata + "3 resultados · 41ms". Loop infinito.
- **PDF:** linhas (`.pl`) crescem em `scaleX` escalonado, montando o documento.
- **Recorrentes:** chip cicla JUN→JUL→AGO… com check `stroke-dashoffset` animado.
- **Export:** formato cicla `.csv → .pdf → .xlsx`.
- **Segurança:** mini-guilloché + cadeado.

### Manifesto scroll-lit
- Texto dividido em `<span class="mw">` por palavra (palavras-chave marcadas com `*` no fonte → `.key`).
- Progresso da seção fixa (`-top / (height - innerHeight)`) define quantas palavras estão `.lit`.
- Palavras-chave acendem em jade itálico com `text-shadow` (glow).

### Reativo à velocidade do scroll
- `vel = sy - lastSy`, suavizado em `velS`.
- Ticker: `skewX(velS * -.25)` — entorta ao rolar rápido.
- Fileiras de depoimentos: velocidade base + componente de `velS`, sentidos opostos.

### Física de cursor / botões
- Cursor: anel segue com `lerp(rx, mx, .18)`; em hover vira pílula jade com rótulo (`data-cursor`).
- Botões magnéticos: alvo no `mousemove`, posição com mola via `lerp(cx, tx, .16)`.

---

## Notas técnicas

- **Master loop único:** um só `requestAnimationFrame(master)` cuida de cursor, scrub, ticker, depoimentos, manifesto, gráfico e molas — evita múltiplos rAF concorrentes.
- **Cursor nativo escondido** só em `pointer:fine` e `body.ready` (CSS `cursor:none`).
- **Acessibilidade:** `prefers-reduced-motion` desativa animações, remove cursor/loader, mostra mockup plano e todas as palavras do manifesto acesas.
- **Performance:** `will-change` nos elementos com transform contínuo; scroll só atualiza `sy` (cálculos no rAF).
- **Zero dependências** — HTML/CSS/JS puro.

---

## Para portar pro stack (React 18 + TS + Chakra + Framer Motion)

- Guilloché → componente `<Guilloche n rx ry />` que monta o SVG; animação por CSS mantém leve.
- Scroll-scrubbing do mockup → `useScroll` + `useTransform` do Framer Motion (`scrollYProgress` da seção).
- Manifesto → `useScroll` mapeando progresso para índice de palavra acesa.
- Cursor / magnético / velocidade → hooks isolados (`useCursor`, `useMagnetic`, `useScrollVelocity`) com `useSpring`.
- Bento demos → componentes pequenos com `useEffect` + timers; pausar quando fora da viewport (`useInView`).
- Tokens → `extendTheme` (`colors.jade`, `colors.gold`, `colors.cream`).
- `@property --angle` não tem suporte universal; no React/Framer prefira animar via `useMotionValue`.
