# Dashboard elevation — plan

Goal: bring the **Home / Dashboard** to the same editorial polish as the new
Transactions page, fix the "horrible" net-balance **seal**, and remove all dead
code left over from the old dashboard and old transactions page.

The dashboard already uses the shared design system (`pb-tokens.css`, `Panel`,
`Segmented`, `motion`, `format`, `PaperFooter`). So this is **refinement, not a
rebuild** — three focused workstreams.

---

## 1. Redesign `BalanceSeal` (the visual that looks bad)

**Problem.** The guilloché rosette uses `guilloche(58,19,62)` / `guilloche(58,27,44)`
where `d > R`, producing huge overlapping loops that cross the centre — a dense,
muddy "spirograph doily". The net figure is always coral, even on a surplus.

**Fix.**
- Replace the two heavy rings with **three concentric single-pass rosettes**
  (`r` divides `R` ⇒ `turns = 1` ⇒ crisp lines, no muddy overlap), nested in the
  annulus between the centre disc (r≈62) and the rim ring (r≈124):
  - `guilloche(102, 3, 17)` — 34 petals, band ≈ 82–116
  - `guilloche(90, 3, 15)` — 30 petals, band ≈ 72–102
  - `guilloche(78, 3, 12)` — 26 petals, band ≈ 63–87
  - Differing petal counts create a fine banknote moiré.
- Strokes **thin (0.5) and faint (opacity ≈ 0.3–0.45)** so it reads as a security
  texture, not the subject. Gentle **counter-rotation** of two layers (gated on
  `useReducedMotion`).
- **Sign-aware net colour:** surplus → `forest-2`, deficit → `coral`. Add a
  `negative` prop; `MonthHero` passes `net < 0` and a `−`-prefixed label.
- Refine the rim/ring stack (cleaner hairlines, calmer gold dashes).

Files: `features/dashboard/components/BalanceSeal.tsx`, `MonthHero.tsx`.

## 2. Parity polish with Transactions

- **Page header lockup** at the top of the dashboard: tile icon + "Overview"
  title + subtitle, identical pattern to the Transactions `PageHeader`. New
  component `features/dashboard/components/DashboardHeading.tsx`.
- **Section rhythm:** group the long scroll into labelled chapters with a small
  reusable mono eyebrow + hairline (`SectionLabel.tsx`): *This month*,
  *Balance & forecast*, *Cash flow*, *Commitments & insights*. Makes the page
  read as one editorial document like Transactions.
- Keep all existing data wiring untouched.

Files: new `DashboardHeading.tsx`, new `SectionLabel.tsx`, edit `Dashboard.tsx`.

## 3. Cleanup — remove dead old code

Confirmed unused (no imports anywhere):
- `src/components/dashboard/` → `DashboardHeader.tsx`, `DashboardSkeleton.tsx`,
  `index.ts` (old dashboard chrome).
- `src/components/charts/modal/TransactionsChart.tsx` (old Transactions chart —
  only the previous Transactions page consumed it).
- `src/sections/SummaryWithAnalysisSection.tsx` + its line in `sections/index.ts`
  (old overview section, dead export with no consumer).

Kept (still used elsewhere): `DateBasisToggle`, `PageHeader (ui)`,
`PeriodNavigator`, `SectionCard`, `SummaryContainer`.

## Verification
- `npx tsc --noEmit` clean after each workstream (catches any missed import).
- Manual: surplus shows green seal, deficit shows coral; reduced-motion stops the
  spin; dashboard scroll reads as labelled chapters.
