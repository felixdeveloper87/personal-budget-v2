---
name: implement-household
description: Implement or extend the end-to-end Household feature in the Personal Budget v2 repository, including shared expenses, equal member shares, bilateral debt netting, settlements, invitations, authorization, the single-page /household experience, navigation, persistence, and tests. Use when asked to build, modify, review, debug, or test Household-related frontend, backend, database, or accounting behavior in this project.
---

# Implement Household

Implement Household as a secure shared ledger without weakening the existing personal-budget behavior. Keep the public experience on one responsive `/household` page and preserve the bilateral debt behavior agreed with the user.

## Load the specification

Read [references/household-spec.md](references/household-spec.md) completely before planning or editing. Treat its product decisions, calculation examples, security rules, and acceptance cases as the baseline. If a later explicit user instruction conflicts with it, follow the user and update the reference when requested.

Read `CODEX_NOTES.md` and the relevant current source files before changing code. The repository can evolve after this skill is created, so verify rather than assume file names, migration numbers, APIs, or navigation structure.

## Follow the implementation workflow

1. Inspect the worktree and preserve unrelated user changes.
2. Trace the current authenticated-user, navigation, transaction, account-balance, controller/service/repository, exception, and Flyway patterns.
3. Identify the latest migration version. Add a new migration; never rewrite an applied migration.
4. Plan vertical slices in this order:
   - household membership and invitation lifecycle;
   - expenses and immutable share snapshots;
   - bilateral obligations, member balances, and settlements;
   - one-page frontend, mobile header shortcut, and desktop navigation;
   - personal-budget integration only under the accounting rules in the specification.
5. Implement server-side authorization and calculations before relying on frontend state.
6. Add backend tests for money math, membership isolation, permissions, mutation behavior, and settlement effects.
7. Add frontend types/API functions, loading and error states, empty states, responsive components, dialogs/drawers, and navigation behavior.
8. Validate the smallest relevant scope first, then the complete frontend build. Respect `CODEX_NOTES.md`: do not run a local backend build or verification command unless the user explicitly asks; use the project's Docker workflow when backend execution is authorized and necessary.
9. Review the final diff for accidental coupling, floating-point money math, missing ownership checks, duplicate personal transactions, stale balance calculations, and broken direct navigation.

## Preserve these invariants

- Derive the authenticated user on the backend. Never trust a request-supplied user ID as authority.
- Require active household membership for every household read or mutation.
- Use `BigDecimal` and fixed-scale PostgreSQL numeric columns. Make allocated shares sum exactly to the expense amount.
- Snapshot shares when an expense is created or edited. Do not recompute historical expenses when membership changes.
- Default each expense to all active members and an equal split; never hard-code five.
- Net debts bilaterally between each pair. Do not replace this with global transfer minimization unless the user explicitly changes the rule.
- Make only confirmed settlements affect balances.
- Keep reimbursements out of ordinary income/expense reporting. Never fake a reimbursement as normal income.
- Use a single `/household` page. Open creation, settlement, member-management, and detail flows in dialogs or drawers rather than adding Household subpages.
- Make `/household` a real browser location that survives refresh and supports back/forward navigation.
- Preserve the established Chakra/editorial theme, accessibility, dark mode, responsive behavior, and existing API error conventions.

## Stop for material ambiguity

Ask before coding only when a choice cannot be inferred safely and would materially change data or accounting behavior. In particular, confirm whether a requested scope includes automatic personal-transaction/account posting if the user has not stated it. The Household ledger itself must not silently create duplicate personal records.

## Report completion

Lead with the implemented outcome. Summarize database, API, UI, accounting, and test changes; list validations run and anything not run; call out deferred policy choices or migrations. Do not deploy or mutate production data unless the user explicitly requests it.
