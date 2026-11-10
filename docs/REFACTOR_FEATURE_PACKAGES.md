# Refatoração: pacotes por funcionalidade (backend)

> **Para retomar numa sessão nova do Claude:** "Leia `docs/REFACTOR_FEATURE_PACKAGES.md` e continue de onde parou."
> O progresso está na seção [Checklist](#checklist). Marque `[x]` ao concluir cada item.

## Objetivo

Hoje o backend (`backend/src/main/java/com/example/budget/`) está organizado **por camada**:

```
controller/  service/  repository/  model/  dto/  mapper/  exception/ ...
```

A ideia é passar a organizar **por funcionalidade**, com tudo de um assunto numa pasta só:

```
household/   transaction/   account/   auth/ ...
```

**Por quê:**
- Mudar uma funcionalidade exige abrir uma pasta, não cinco.
- Classes auxiliares podem ser package-private (invisíveis para o resto do sistema).
- `dto/` (cerca de 70 arquivos) e `service/` (cerca de 40) deixam de ser listas enormes e misturadas.

**O que NÃO muda:** rotas da API, comportamento, banco de dados, migrations do Flyway. É só mover arquivos e ajustar `package`/`import`.

---

## Regras (para poder parar a qualquer momento sem quebrar nada)

1. **Trabalhar numa branch:** `refactor/feature-packages`. O `main` não é tocado até o fim.
2. **Uma funcionalidade por vez.** Ao terminar cada uma:
   - `./mvnw test` compila e passa. Os únicos testes que podem falhar são os 7 do `£`, por causa de encoding no Windows, e eles já falhavam antes.
   - Commit: `refactor: move <funcionalidade> to feature package`.
3. **Mover com `git mv`** (não copiar e apagar), para o git mostrar como renomeação e o histórico continuar.
4. **Só mover.** Nada de refatorar lógica no mesmo commit, para o diff ser fácil de revisar.
5. Os testes acompanham a classe: `src/test/java/.../<funcionalidade>/`.
6. **Subpastas por camada dentro de cada funcionalidade** (decisão tomada em 2026-11-10, depois do piloto): `household/controller/`, `household/service/`, `household/model/`, `household/repository/`, `household/dto/`. Cada arquivo vai para a subpasta de mesmo nome da pasta de onde veio. Crie só as subpastas que tiverem arquivos. Os testes seguem a mesma regra (ex.: `src/test/.../household/service/`).

Se parar no meio de uma funcionalidade: `git checkout . && git clean -fd` volta ao último commit, que está funcionando.

---

## Checklist

Ordem sugerida: da funcionalidade mais isolada para a mais compartilhada.

- [x] 0. Criar a branch `refactor/feature-packages`
- [x] 1. `household`, o piloto: 51 arquivos + 15 testes movidos (2026-11-10) e testado no Docker. Depois reorganizado em subpastas `controller/ dto/ model/ repository/ service/` (regra 6).
- [x] 2. `business` (5 arquivos + 1 teste, nenhum ajuste de import)
- [x] 3. `goals` (9 arquivos + 1 teste)
- [x] 4. `push` (7 arquivos + 3 testes)
- [x] 5. `report` (9 arquivos + 5 testes)
- [x] 6. `planning` (10 arquivos + 1 teste)
- [x] 7. `paymentmethod` (8 arquivos)
- [ ] 8. `installment`
- [ ] 9. `recurring`
- [ ] 10. `account`
- [ ] 11. `transaction`
- [ ] 12. `user` + `admin`
- [ ] 13. `auth`
- [ ] 14. `shared` (exception, cache, util) e apagar as pastas antigas vazias
- [ ] 15. Rodar o app no Docker e testar as telas principais
- [ ] 16. Merge da branch no `main`

**Depois do item 1, pare e avalie** se o formato agradou antes de seguir com o resto.

---

## Mapeamento: para onde vai cada classe

Base: `com.example.budget`. Os nomes são das classes atuais.

### `household/`
**Regra simples:** todo arquivo cujo nome começa com `Household`, em qualquer pasta:
- controller: `HouseholdController`
- service: `HouseholdService`, `HouseholdDashboardService`, `HouseholdExpenseService`, `HouseholdSettlementService`, `HouseholdInvitationService`, `HouseholdDebtCalculator`, `HouseholdAccess`, `HouseholdLedgerLoader`, `HouseholdValues`, `HouseholdAttachmentService`, `HouseholdAttachmentStorage`, `HouseholdCleaningService`, `HouseholdCleaningReminderService`, `HouseholdNotificationService`, `HouseholdPaymentReminderService`, `HouseholdPushMessages`
- model: `Household`, `HouseholdAttachment`, `HouseholdAttachmentStatus`, `HouseholdCleaning*` (4), `HouseholdExpense`, `HouseholdExpenseShare`, `HouseholdInvitation`, `HouseholdInvitationStatus`, `HouseholdMember`, `HouseholdNotification`, `HouseholdNotificationType`, `HouseholdRole`, `HouseholdSettlement`, `HouseholdSettlementStatus`
- repository: todos os `Household*Repository`
- dto: `HouseholdExpenseHistoryDTO`, `HouseholdPageDTO`, `HouseholdPaymentHistoryDTO`, `HouseholdRecordCreatedDTO`, `HouseholdRequests`
- testes: todos os `Household*Test`, mais `HouseholdMemberTest` (está em `model/`)

### `transaction/`
- `TransactionController`, `SummaryController`
- `TransactionService`, `ScheduledTransactionSettlementService`
- `Transaction`, `TransactionStatus`, `TransactionType`
- `TransactionRepository`, `TransactionSpecifications` (pasta `specification/`)
- `TransactionMapper`, `TransactionTypeConverter` (pasta `util/`)
- `CreateTransactionRequest`, `UpdateTransactionRequest`, `TransactionDTO`, `TransactionSearchDTO`, `ImportResultDTO`, `ImportTransactionRow`, `ImportTransactionsRequest`, `MonthlySummary`
- `CachedTransactionList` (pasta `cache/`)
- `merchant/MerchantBrand`, `merchant/MerchantBrandCatalog`, que só são usadas pelo `TransactionMapper`. Podem virar `transaction/merchant/` ou ficar onde estão.

### `recurring/`
- `RecurringTransactionController`, `RecurringTransactionService`, `RecurringTransaction`, `RecurringFrequency`, `RecurringTransactionRepository`, `RecurringTransactionMapper`
- `CreateRecurringTransactionRequest`, `UpdateRecurringTransactionRequest`, `UpdateRecurringTransactionAmountRequest`, `RecurringTransactionDTO`, `RecurringUpdateScope`
- `CachedRecurringList`

### `installment/`
- `InstallmentPlanController`, `InstallmentPlanService`, `InstallmentPlan`, `InstallmentPlanRepository`, `InstallmentPlanMapper`
- `CreateInstallmentPlanRequest`, `UpdateInstallmentPlanRequest`, `InstallmentPlanDTO`
- `CachedInstallmentPlanList`

### `account/`
- `FinancialAccountController`, `FinancialAccountService`, `CreditCardBillingService`
- `FinancialAccount`, `AccountType`, `AccountTransfer`
- `FinancialAccountRepository`, `AccountTransferRepository`
- `FinancialAccountDTO`, `FinancialAccountRequest`, `AccountActivityItemDTO`, `AccountActivityPageDTO`, `AccountDetailsDTO`, `AccountSummaryDTO`, `AccountTransferDTO`, `AccountTransferRequest`, `AssignAccountRequest`
- ⚠️ `AssignAccountRequest` é usado por `installment` e `recurring`; fica em `account/` e precisa ser `public`. `CreditCardBillingService` é usado por `transaction`, `recurring` e `planning`, e também fica público.

### `paymentmethod/`
- `PaymentMethodController`, `PaymentMethodService`, `PaymentMethod`, `PaymentMethodType`, `PaymentMethodRepository`, `PaymentMethodMapper`, `PaymentMethodDTO`, `PaymentMethodRequest`

### `planning/`
- `PlanningController`, `CategoryBudgetService`, `CashFlowForecastService`
- `CategoryBudget`, `CategoryBudgetRepository`
- `CategoryBudgetDTO`, `CategoryBudgetRequest`, `CashFlowForecastDTO`, `IncomePlanRequest`, `VariableExpensePlanRequest`

### `goals/`
- `SavingsGoalController`, `SavingsGoalService`, `SavingsGoal`, `SavingsGoalContribution`, `SavingsGoalRepository`, `SavingsGoalContributionRepository`, `SavingsGoalDTO`, `SavingsGoalRequest`, `SavingsGoalContributionRequest`

### `report/`
- `ReportController`, `ReportService`, `ReportCalculator`, `ReportInsightService`, `ReportMoneyFormatter`, `ReportTransactionMapper`
- `ReportPeriod`, `PeriodRange`, `ReportResponse`

### `business/`
- `BusinessController`, `BusinessService`, `BusinessDTOs`, `WorkSession`, `WorkSessionRepository`

### `push/`
- `PushController`, `PushNotificationService`, `WebPushCrypto`, `BillsDueReminderService`
- `PushSubscription`, `PushSubscriptionRepository`, `PushSubscriptionRequest`

### `user/`
- `User`, `UserPlan`, `UserRepository`, `UserMapper`
- `UserDataController`, `UserDataService`, `UserDataExportService`
- `AdminUserController`, `AdminUserService`, `AdminUserResponse`, `UpdateUserPlanRequest`. Podem ficar em `user/` ou num `admin/` separado.

### `auth/`
- `AuthController`, `AuthService`, `PasswordResetService`
- `JwtUtil` (pasta `util/`), `JwtAuthenticationFilter` (pasta `security/`)
- `LoginRequest`, `RegisterRequest`, `ResetPasswordRequest`, `AuthResponse`
- `InvalidCredentialsException`, `EmailAlreadyExistsException`, `AccountPendingApprovalException`

### `shared/` (o que é usado por todos)
- `exception/`: `GlobalExceptionHandler`, `EntityNotFoundException`, `AccessDeniedException`
- `cache/`: `BaseCachedList`, `CacheInvalidationService`, `RedisCacheSafety`

### Fica onde está
- `PersonalBudgetApplication` (raiz, precisa continuar acima de todos os pacotes)
- `config/` (`SecurityConfig`, `RedisCacheConfig`, `JacksonConfig`)
- `HealthController`, que pode ficar em `controller/` sozinho ou ir para `shared/`

### Possível código morto: verificar e, se confirmado, apagar num commit separado
Não há nenhuma referência a estas classes no código (verificado em 2026-11-10):
- `dto/PeriodSummary`
- `dto/SearchTransactionRequest`
- `validator/TransactionValidator` (conferir se não é um `@Component` usado via injeção ou por reflexão)

---

## Passo a passo de uma funcionalidade (com subpastas, regra 6)

Rodar no **Git Bash**, dentro de `backend/`. Preencha `F` e a lista `FILES` com os caminhos atuais (main **e** testes) a partir do [mapeamento](#mapeamento-para-onde-vai-cada-classe):

```bash
F=business   # nome da funcionalidade
FILES="src/main/java/com/example/budget/controller/BusinessController.java
src/main/java/com/example/budget/service/BusinessService.java
src/test/java/com/example/budget/service/BusinessServiceTest.java"   # etc.

for old in $FILES; do
  layer=$(basename "$(dirname "$old")")             # controller, service, model...
  root=${old%%/com/example/budget/*}/com/example/budget   # src/main/java/... ou src/test/java/...
  dest="$root/$F/$layer"; mkdir -p "$dest"
  git mv "$old" "$dest/"
  # 1. package do arquivo movido
  sed -i -E "s/^package com\.example\.budget\.$layer;/package com.example.budget.$F.$layer;/" "$dest/$(basename "$old")"
  # 2. imports em TODO o projeto (classes de teste não são importadas, mas não faz mal)
  c=$(basename "$old" .java)
  grep -rlE "com\.example\.budget\.$layer\.$c\b" src | xargs -r sed -i -E "s/com\.example\.budget\.$layer\.$c\b/com.example.budget.$F.$layer.$c/g"
done

# 3. compilar e corrigir o que sobrar
./mvnw -q test-compile
```

Para listar os símbolos que faltam, por arquivo:
```bash
./mvnw -q test-compile 2>&1 | grep -A2 "cannot find symbol" | grep -E "ERROR.*\.java|symbol:" | paste - -
```

**Erros esperados no passo 3:**
- **Import faltando.** Classes que estavam na mesma pasta (ex.: `service/`) não precisavam de import entre si. Depois de mover, quem ficou para trás precisa importar quem saiu, e vice-versa. No household foram só `User` (8 entidades) e `PushNotificationService` (1 serviço, 1 teste).
- **Imports entre funcionalidades já migradas:** se `transaction/service/X` usa `account/service/Y`, precisa de import explícito, porque são pacotes diferentes.
- **Imports com curinga** (`import com.example.budget.model.*;`, `import com.example.budget.repository.*;`): não são corrigidos pelo script. Adicione imports explícitos.
- **Membros package-private:** algo que era visível por estar no mesmo pacote deixa de ser. Torne `public` só se for usado fora da funcionalidade.

Depois: `./mvnw test`, revisar `git status` (deve mostrar quase só `renamed:`) e fazer o commit.

---

## Riscos e observações

- **Spring, JPA e Flyway:** sem impacto. `@SpringBootApplication` está em `com.example.budget` e encontra componentes e entidades em todos os subpacotes. As migrations não dependem de pacotes Java.
- **Cache no Redis (confirmado):** o `RedisCacheConfig` usa `GenericJackson2JsonRedisSerializer`, que grava o nome completo da classe em cada valor (ex.: `"@class": "com.example.budget.dto.MonthlySummary"`). Depois da mudança, os itens antigos não conseguem ser lidos. As entradas expiram em 10 minutos (`app.cache.*-ttl-seconds=600`), mas o mais seguro é **limpar o Redis em cada deploy dessa refatoração**, já que é só cache:
  ```bash
  docker compose -f docker-compose.dev.yml exec redis redis-cli FLUSHALL
  ```
  Vale conferir também se o `RedisCacheSafety` captura erros de leitura (se capturar, o pior caso é só um cache miss).
- **`git blame`:** use `git log --follow <arquivo>` para ver o histórico de antes da mudança.
- **Frontend e mobile:** nenhum impacto, porque as rotas não mudam.
