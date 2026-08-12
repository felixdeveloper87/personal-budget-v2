import type { TranslationBundle, TranslationDictionary } from './types'
import { coreTranslations } from './locales/core'
import { domainTranslations } from './locales/domain'
import { reportTranslations } from './locales/reports'
import { landingTranslations } from './locales/landing'
import { shellTranslations } from './locales/shell'
import { dashboardTransactionsTranslations } from './locales/dashboardTransactions'
import { cashflowViewsTranslations } from './locales/cashflowViews'
import { accountsCardsTranslations } from './locales/accountsCards'
import { commonUiTranslations } from './locales/commonUi'
import { householdTranslations } from './locales/household'
import { categoriesRecurringTranslations } from './locales/categoriesRecurring'
import { planningGoalsTranslations } from './locales/planningGoals'

// Feature bundles are deliberately kept separate. This makes the gradual
// migration of the existing UI reviewable and avoids one enormous locale file.
const bundles: TranslationBundle[] = [
  coreTranslations,
  domainTranslations,
  shellTranslations,
  landingTranslations,
  dashboardTransactionsTranslations,
  cashflowViewsTranslations,
  accountsCardsTranslations,
  commonUiTranslations,
  householdTranslations,
  categoriesRecurringTranslations,
  planningGoalsTranslations,
  reportTranslations,
]

const mergeLocale = (locale: keyof TranslationBundle): TranslationDictionary =>
  Object.assign({}, ...bundles.map((bundle) => bundle[locale]))

export const resources: TranslationBundle = {
  'en-GB': mergeLocale('en-GB'),
  'pt-BR': mergeLocale('pt-BR'),
}
