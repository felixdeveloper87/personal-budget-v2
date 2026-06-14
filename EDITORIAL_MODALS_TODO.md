# Editorial — aplicar o estilo aos modais + UserMenu (handoff)

Continuação do restyle editorial. O sistema já existe em `frontend/src/editorial.tsx`
(paletas `EDITORIAL_DARK` / `EDITORIAL_LIGHT`, hook `useEd()` que devolve a paleta do
color mode ativo ou `null`). Padrão de edição em todo componente:

```ts
const ed = useEd()
const xBase = useColorModeValue('valorLight', 'valorDark')
const x = ed ? ed.tokenEditorial : xBase   // nunca chamar hook condicionalmente
```

Modais/menus renderizam via Portal, mas **o React Context atravessa portais**, então
`useEd()` funciona normalmente dentro deles (estão na árvore do `EditorialProvider` do Layout).

---

## 0. PRÉ-REQUISITO (senão o build quebra)

Já adicionei `solid: '#0e0f0e'` em `EDITORIAL_DARK`. O tipo `EditorialTokens` exige a
mesma chave em **todas** as paletas. Adicionar em `EDITORIAL_LIGHT` (em `frontend/src/editorial.tsx`),
logo depois de `panelRaised`:

```ts
  /** Opaque surface for modals / dropdowns (no bleed-through). */
  solid: '#fbf8f1',
```

(`EDITORIAL_DARK.solid` = `#0e0f0e` near-black; `EDITORIAL_LIGHT.solid` = `#fbf8f1` papel claro.)

---

## 1. `frontend/src/theme.ts` — superfície global de Modal + Drawer (DRY: cobre TODOS os modais)

No topo do arquivo, importar as paletas:

```ts
import { EDITORIAL_DARK, EDITORIAL_LIGHT } from './editorial'
```

Substituir o bloco `Modal` atual (em `components`) por este, e adicionar `Drawer`:

```ts
    Modal: {
      baseStyle: (props: any) => {
        const ed = props.colorMode === 'dark' ? EDITORIAL_DARK : EDITORIAL_LIGHT
        return {
          dialog: {
            bg: ed.solid,
            color: ed.cream,
            borderRadius: '2xl',
            border: '1px solid',
            borderColor: ed.line,
          },
          overlay: {
            bg: props.colorMode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(20, 30, 25, 0.35)',
          },
        }
      },
    },
    Drawer: {
      baseStyle: (props: any) => {
        const ed = props.colorMode === 'dark' ? EDITORIAL_DARK : EDITORIAL_LIGHT
        return {
          dialog: { bg: ed.solid, color: ed.cream },
          overlay: {
            bg: props.colorMode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(20, 30, 25, 0.35)',
          },
        }
      },
    },
```

Notas:
- `ed.cream` é "texto primário" (creme no dark, tinta escura no light) — corpo do modal fica legível.
- Isto vale globalmente (inclui admin). O `AuthModal` tem estilo próprio e segue como está.
- Os corpos dos modais usam `useColorModeValue(light, dark)`; como editorial-light≈claro e
  editorial-dark≈preto, continuam legíveis sem mexer em cada um.

---

## 2. `frontend/src/components/ui/ModalHeader.tsx` — cabeçalho compartilhado (serifa + jade)

Import:
```ts
import { useEd } from '../../editorial'
```

No corpo, logo após `const tokens = ACCENT_TOKENS[accent]`:

```ts
  const ed = useEd()
  const surfaceBgBase = useColorModeValue('#ffffff', '#0a0a0a')
  const surfaceBg = ed ? ed.solid : surfaceBgBase
  const borderColorBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const borderColor = ed ? ed.line : borderColorBase
  const titleColorBase = useColorModeValue('gray.900', 'gray.50')
  const titleColor = ed ? ed.cream : titleColorBase
  const captionColorBase = useColorModeValue('gray.500', 'gray.400')
  const captionColor = ed ? ed.muted : captionColorBase
  const chipBgBase = useColorModeValue(tokens.bgLight, tokens.bgDark)
  const chipBg = ed ? ed.panel : chipBgBase
  const chipFgBase = useColorModeValue(tokens.fgLight, tokens.fgDark)
  const chipFg = ed ? ed.jade : chipFgBase
  const accentLine = ed ? `linear-gradient(90deg, ${ed.jade}, ${ed.gold})` : tokens.line
```

REMOVER as linhas antigas que estes substituem (`const surfaceBg = ...`, `borderColor`,
`titleColor`, `captionColor`, `chipBg`, `chipFg`) para não duplicar.

No JSX:
- a barra de 3px: trocar `bg={tokens.line}` por `bg={accentLine}`.
- no `<Text>` do título, adicionar para virar serifa:
  ```tsx
  fontFamily={ed ? ed.fontDisplay : undefined}
  fontWeight={ed ? 400 : 700}
  fontSize={ed ? { base: 'lg', sm: 'xl' } : { base: 'sm', sm: 'md' }}
  ```

---

## 3. `frontend/src/components/ui/AppCloseButton.tsx`

Import:
```ts
import { useEd } from './editorial'  // AJUSTAR caminho: de components/ui → '../../editorial'
```
(caminho correto: `import { useEd } from '../../editorial'`)

Após a primeira linha do componente, transformar os tokens (mantendo o vermelho no hover,
que é semântica de "fechar"):

```ts
  const ed = useEd()
  const bgBase = useColorModeValue('gray.100', 'whiteAlpha.100')
  const bg = ed ? ed.controlBg : bgBase
  const borderColorBase = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const borderColor = ed ? ed.line : borderColorBase
  const iconColorBase = useColorModeValue('gray.800', 'gray.50')
  const iconColor = ed ? ed.cream : iconColorBase
```
(deixar `hoverBg`, `activeBg`, `hoverBorderColor`, `hoverColor`, `focusRing`, `shadow` como estão —
o hover vermelho funciona nos dois modos.)

---

## 4. `frontend/src/components/layout/header/UserMenu.tsx` — dropdown (MenuList + itens)

O gatilho já está editorial. Falta o **conteúdo** do dropdown. Hoje há um comentário
dizendo que `textColor`/`subTextColor`/`menuListBg` ficam claros de propósito — agora o
usuário quer editorial. Editorializar:

```ts
  // (ed já existe no componente)
  const menuListBgBase = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(15, 15, 17, 0.85)')
  const menuListBg = ed ? ed.solid : menuListBgBase
  const borderColorBase = useColorModeValue('rgba(226, 232, 240, 0.8)', 'rgba(255, 255, 255, 0.08)')
  const borderColor = ed ? ed.line : borderColorBase
  const textColorBase = useColorModeValue('gray.800', 'gray.100')
  const textColor = ed ? ed.cream : textColorBase
  const subTextColorBase = useColorModeValue('gray.500', 'gray.400')
  const subTextColor = ed ? ed.muted : subTextColorBase
  const itemHoverBgBase = useColorModeValue('rgba(59, 130, 246, 0.05)', 'rgba(255, 255, 255, 0.05)')
  const itemHoverBg = ed ? ed.hoverBg : itemHoverBgBase
  const itemHoverColorBase = useColorModeValue('blue.600', 'blue.300')
  const itemHoverColor = ed ? ed.jade : itemHoverColorBase
  const sectionLabelColorBase = useColorModeValue('gray.400', 'gray.500')
  const sectionLabelColor = ed ? ed.muted : sectionLabelColorBase
  const headerBgBase = useColorModeValue('rgba(248, 250, 252, 0.65)', 'rgba(255, 255, 255, 0.015)')
  const headerBg = ed ? ed.panelRaised : headerBgBase
  const accentBarBase = useColorModeValue('linear-gradient(90deg, #3b82f6, #8b5cf6)', 'linear-gradient(90deg, #60a5fa, #a78bfa)')
  const accentBar = ed ? `linear-gradient(90deg, ${ed.jade}, ${ed.gold})` : accentBarBase
  const avatarRingBase = useColorModeValue('linear-gradient(135deg, #3b82f6, #8b5cf6)', 'linear-gradient(135deg, #60a5fa, #a78bfa)')
  const avatarRing = ed ? `linear-gradient(135deg, ${ed.jade}, ${ed.gold})` : avatarRingBase
```

Substituir as declarações antigas correspondentes (`menuListBg`, `borderColor`, `textColor`,
`subTextColor`, `itemHoverBg`, `itemHoverColor`, `sectionLabelColor`, `headerBg`, `accentBar`,
`avatarRing`) por estas. Remover o comentário "NOTE: textColor/subTextColor ... light surface".

Os 2 `Avatar` (`bg="blue.500"`) podem virar `bg={ed ? ed.bg2 : 'blue.500'}` `color={ed ? ed.jade : 'white'}`.
O item "Sign Out" usa `useColorModeValue('red.500','red.400')` inline — pode deixar (vermelho lê nos dois).

---

## 5. Verificar

```bash
cd frontend && npx tsc --noEmit && npm run build
```

Build local roda no Windows via Git Bash. (Backend é via Docker, irrelevante aqui.)

---

## Resumo do que cobre
- **theme.ts (Modal + Drawer)** → superfície de TODOS os modais/drawers, DRY.
- **ModalHeader + AppCloseButton** → cabeçalho/fechar de todos os modais que usam o primitivo.
- **UserMenu** → dropdown do usuário.
- Corpos bespoke dos modais continuam no tema claro/escuro normal (legível porque
  editorial-light≈claro, editorial-dark≈preto); editorializar token a token só se quiser
  jade/serifa também dentro deles.

Memória do projeto: ver `editorial-dashboard-theme.md` no diretório de memórias.
```
