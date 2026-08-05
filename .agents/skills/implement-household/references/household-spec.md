# Household Product and Engineering Specification

## 1. Product decisions

- Use `Household` as the feature name and `/household` as its authenticated browser URL.
- Keep all Household functionality on one responsive page.
- Give every member separate Personal Budget credentials.
- Show a Household shortcut beside search in the mobile header.
- Show Household as a normal desktop navigation item.
- Default a new expense to an equal split across every active member.
- Support choosing a subset of active members while retaining equal splitting for the first version.
- Do not hard-code a five-person limit. The initial real household has five members, but calculations must use the selected participant count.
- Use GBP as the initial household currency while storing an ISO currency code on the household.
- Design membership as a join model so a future version can support multiple households, even if the first UI exposes one current household per user.
- Invite only registered, approved users in the first version. Let the recipient accept or decline inside `/household`; do not require outbound email infrastructure.
- Allow up to five private JPEG, PNG, or WebP proof images on each expense or settlement, with a 5 MB limit per image.
- Retain each proof image for 90 days after upload, then delete the file while preserving expired attachment metadata and the financial record.

The initial version does not require recurring household bills, arbitrary percentages, multi-currency conversion, chat, or a globally minimized transfer plan.

### Proof image rules

- Store proof files outside PostgreSQL and outside the disposable container filesystem. Keep only private storage keys and audit metadata in the database.
- Require active Household membership to view an image.
- Let the expense payer or owner add images to an expense, and the settlement payer or owner add images to a settlement.
- Let the uploader or owner remove an available image.
- Validate both the declared media type and file signature. Do not serve the storage directory publicly.
- Serve available images through authenticated endpoints with inline, no-store, and no-sniff response headers.
- Expire each image independently 90 days after its upload. Keep the attachment row marked as expired so the UI can explain why the proof is unavailable.
- Images and their lifecycle never change expenses, shares, debts, settlements, or Personal Budget reporting.

## 2. Shared-expense rules

### Expense allocation

For an expense with total `T` and `N` selected participants:

1. Include the payer in the split by default.
2. Allocate one share to every selected participant.
3. Create an obligation from every selected non-payer to the payer for that participant's share.
4. Store every allocated share as a snapshot. Never infer old shares from the household's current members.

Perform allocation in integer minor units (pence) or with equivalent exact `BigDecimal` arithmetic. For a non-even split, distribute remainder pennies deterministically by stable member ID order, rotating or otherwise documenting the policy. The shares must always sum exactly to `T`.

Reject zero or negative amounts, fewer than two selected participants, a payer not in the household, selected inactive members, and a currency mismatch.

### Bilateral netting

Preserve obligations between each pair instead of globally rerouting debt.

For members `A` and `B`:

```text
B owes A =
  shares from expenses paid by A and assigned to B
  - shares from expenses paid by B and assigned to A
  - confirmed settlements paid by B to A
  + confirmed settlements paid by A to B
```

If the result is negative, reverse the direction. If it is zero, the pair is settled.

This bilateral rule is deliberate. A global creditor/debtor matching algorithm can reduce transfer count, but it changes the user's agreed example and is out of scope unless explicitly requested.

### Member balance

Calculate a member's aggregate position as the sum of all bilateral positions:

- positive: amount the member has to receive;
- negative: amount the member has to pay;
- zero: settled.

Equivalently, before settlements:

```text
member balance = total paid - total assigned shares
```

Apply a confirmed outgoing settlement as an increase toward zero for the debtor and a decrease toward zero for the creditor. The sum of all member balances must remain zero.

### Canonical example

Members: Leandro, A, B, C, and D.

1. Leandro pays £100 electricity, split among all five.
   - Every share is £20.
   - A, B, C, and D each owe Leandro £20.
2. A pays £50 cleaning supplies, split among all five.
   - Every share is £10.
   - Leandro, B, C, and D each owe A £10.
3. Net only the Leandro/A pair.
   - A owed Leandro £20.
   - Leandro now owes A £10.
   - A therefore owes Leandro £10.

Aggregate balances after both expenses:

| Member | Paid | Assigned share | Net balance |
| --- | ---: | ---: | ---: |
| Leandro | £100 | £30 | +£70 |
| A | £50 | £30 | +£20 |
| B | £0 | £30 | -£30 |
| C | £0 | £30 | -£30 |
| D | £0 | £30 | -£30 |

The pairwise settlement list can contain more transfer volume than a globally minimized plan. That is acceptable and required for this version.

## 3. Settlement rules

- Record direction explicitly: `from_member` pays `to_member`.
- Require a strictly positive amount and active membership for both parties.
- Prevent self-settlements.
- Prevent confirming more than the current bilateral amount due unless the product explicitly adds credits/prepayments.
- Default to recipient confirmation: a payer creates a `PENDING` settlement and the recipient confirms or rejects it.
- Let only `CONFIRMED` settlements affect balances.
- Preserve rejected and cancelled settlement records for audit.
- Make confirmation idempotent and transactional.
- Never convert a settlement into ordinary income or expense for reports.

## 4. Membership and permissions

Use at least two roles:

- `OWNER`: rename the household, invite members, revoke pending invitations, and deactivate members.
- `MEMBER`: read the shared ledger, add their own expenses, edit or void allowed records, and create settlements they are paying.

Apply these baseline permissions:

- Allow every active member to read household summaries, members, expenses, shares, and settlements.
- Let a member create an expense only with themselves as payer. Supporting entry on behalf of another member requires owner permission or payer confirmation and is not part of the first version.
- Let the payer edit or void their expense. Let the owner moderate when necessary.
- Recalculate and replace share snapshots atomically when editing amount or participants.
- Soft-void financial records instead of hard-deleting them.
- Do not let removing a member erase or recalculate history. Deactivate membership only after handling any remaining bilateral balance.
- Never expose another household's IDs, records, member details, invitations, or balance existence through error differences.
- Derive the current user from the authenticated backend principal. Do not accept `userId`, `createdBy`, membership role, or settlement confirmation identity from the client as trusted authority.

## 5. Suggested persistence model

Follow repository naming and JPA conventions, but keep these concepts separate:

### `households`

- `id`
- `name`
- `currency` (`CHAR(3)` or equivalent, initially `GBP`)
- `created_by_user_id`
- `created_at`
- `updated_at`

### `household_members`

- `id`
- `household_id`
- `user_id`
- `role` (`OWNER`, `MEMBER`)
- `active`
- `joined_at`
- `deactivated_at`
- unique `(household_id, user_id)`

### `household_invitations`

- `id`
- `household_id`
- `target_user_id`
- `invited_by_user_id`
- `status` (`PENDING`, `ACCEPTED`, `DECLINED`, `REVOKED`)
- `created_at`
- `responded_at`
- prevent duplicate pending invitations for the same household and user

### `household_expenses`

- `id`
- `household_id`
- `payer_member_id`
- `created_by_user_id`
- `description`
- `category`
- `amount` as fixed-scale numeric
- `expense_date`
- optional `personal_transaction_id`
- `created_at`
- `updated_at`
- `voided_at`

### `household_expense_shares`

- `id`
- `expense_id`
- `member_id`
- `amount` as fixed-scale numeric
- unique `(expense_id, member_id)`

### `household_settlements`

- `id`
- `household_id`
- `from_member_id`
- `to_member_id`
- `amount` as fixed-scale numeric
- `settlement_date`
- `status` (`PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`)
- `created_by_user_id`
- `confirmed_by_user_id`
- `created_at`
- `confirmed_at`
- `cancelled_at`

Add foreign keys, membership-oriented indexes, expense-date indexes, settlement-status indexes, and deletion behavior that preserves financial history. Add a new Flyway migration after discovering the highest current version; never modify an applied migration.

## 6. API shape

Adapt names to existing controller conventions while keeping resources explicit. A coherent first version can expose:

```text
GET    /api/households/current
POST   /api/households
PATCH  /api/households/{householdId}

GET    /api/households/{householdId}/members
POST   /api/households/{householdId}/invitations
DELETE /api/households/{householdId}/invitations/{invitationId}
GET    /api/household-invitations/pending
POST   /api/household-invitations/{invitationId}/accept
POST   /api/household-invitations/{invitationId}/decline

GET    /api/households/{householdId}/dashboard
GET    /api/households/{householdId}/expenses
POST   /api/households/{householdId}/expenses
PUT    /api/households/{householdId}/expenses/{expenseId}
DELETE /api/households/{householdId}/expenses/{expenseId}

POST   /api/households/{householdId}/settlements
POST   /api/households/{householdId}/settlements/{settlementId}/confirm
POST   /api/households/{householdId}/settlements/{settlementId}/reject
```

Return a dashboard DTO assembled server-side with:

- household identity and currency;
- authenticated member identity and role;
- active members;
- current user's aggregate balance;
- all member aggregate balances;
- bilateral amounts due with direction;
- pending settlement actions;
- period spending total;
- paginated or capped recent activity.

Do not make the frontend download all history to compute authoritative balances. Avoid N+1 queries. Apply stable ordering and pagination to growing histories.

## 7. Personal-budget accounting boundary

Keep Household source records separate from ordinary personal transactions.

- The full amount paid is a real cash outflow for the payer, while only the payer's share is their economic household cost and the remainder is a receivable.
- A reimbursement is a settlement/transfer, not ordinary income.
- Do not add reimbursements to income KPIs or add the same household purchase twice to expense KPIs.
- Do not automatically create a personal transaction unless that behavior is explicitly included in the implementation scope.
- When personal posting is enabled, link the Household expense to exactly one payer-owned transaction or create one atomically. Offer an explicit account/payment-method choice and prevent duplicate linking.
- Represent settlement cash movement as a neutral account activity if account integration is added. Extend balance/activity logic deliberately rather than encoding it as `INCOME`/`EXPENSE`.
- Keep Household balance calculations based on Household expenses, shares, and confirmed settlements, not on mutable personal transaction descriptions or categories.

If the requested implementation does not include the necessary neutral account-movement model, ship the Household ledger without silent personal posting and state that boundary clearly.

## 8. Single-page experience

Keep all features inside `/household`; use responsive sections and overlays rather than Household subroutes.

Recommended order:

1. Household header with name, month spending, member count, and primary actions.
2. Current-user balance card: amount to receive, amount to pay, or settled.
3. `Who owes whom` bilateral list with settlement actions.
4. Member overview with paid, assigned share, and net balance.
5. Combined recent activity for expenses and settlements.
6. Compact settings/member-management entry for owners.

Use dialogs or mobile-friendly drawers for:

- create/edit expense;
- view expense and its share breakdown;
- add, view, and remove expense or settlement proof images;
- create/confirm/reject settlement;
- invite and manage members;
- household settings.

Handle these states:

- no household: create-household form plus pending invitations;
- loading skeleton;
- empty expenses;
- all settled;
- pending invitation;
- pending settlement confirmation;
- stale mutation/conflict;
- forbidden membership;
- API/network error with retry.

Use current Chakra UI and editorial tokens. Preserve keyboard access, focus return, accessible names, touch targets, light/dark mode, and reduced motion behavior.

## 9. Navigation and URL behavior

At the time this specification was written, `App.tsx` uses `currentPage` state and `PAGE_RENDERERS` rather than React Router. Reinspect before implementation.

Regardless of routing mechanism:

- Add `household` to the page/navigation type and renderer.
- Render a clear Household icon button beside the compact search button in the authenticated mobile header.
- Add Household to the desktop sidebar/navigation.
- Use the existing page-change abstraction rather than bypassing the shell.
- Synchronize `/household` with application state.
- Support direct authenticated entry, refresh, back, and forward.
- Preserve a requested `/household` location through login when practical.
- Return unauthenticated or expired sessions through the established authentication flow.
- Ensure Nginx/Vercel SPA fallback serves the app for `/household`.
- Do not migrate unrelated navigation solely to add this page unless a router migration is intentionally approved.

## 10. Required tests and acceptance cases

### Calculation

- £100 / 5 produces five £20 shares.
- Leandro's £100 expense makes each other member owe Leandro £20.
- A later £50 / 5 expense paid by A makes A owe Leandro £10 bilaterally.
- Aggregate balances for the canonical example are `+70`, `+20`, `-30`, `-30`, `-30`.
- A non-even split allocates every penny and shares sum to the original amount.
- Confirmed settlement reduces the exact pairwise debt and aggregate balances.
- Pending, rejected, cancelled, and voided records do not affect active balances.
- Adding, removing, or expiring proof images does not affect any balance.
- Editing an expense replaces shares atomically; removing a member later does not alter historical shares.

### Security

- A non-member cannot read or mutate a household by guessing IDs.
- A member cannot create an expense with another payer.
- A payer cannot select a member from another household.
- Only the intended recipient can confirm/reject a settlement.
- Only an owner can invite/deactivate members or change household settings.
- Request-supplied identity and role fields cannot override the JWT principal.
- A non-member cannot download a proof image by guessing its ID.
- Unsupported, oversized, or disguised non-image uploads are rejected.

### UI and navigation

- `/household` opens directly and survives refresh.
- Browser back/forward stays synchronized with the visible page.
- Mobile shows the Household shortcut beside search.
- Desktop shows Household in navigation.
- All feature workflows remain on the one page through dialogs/drawers.
- Empty, loading, failure, pending, and settled states are understandable.
- Multiple proof images can be selected from a mobile camera/gallery, reviewed, and removed.
- The page works in light/dark modes and at narrow mobile widths.

### Regression

- Existing personal transactions, summaries, reports, accounts, transfers, authentication, admin routing, and search continue to work.
- Household reimbursements do not inflate ordinary income.
- Personal posting, when enabled, does not duplicate expenses.
- Frontend type-check/build succeeds.
- Backend tests run through the repository-authorized environment; follow `CODEX_NOTES.md`.
