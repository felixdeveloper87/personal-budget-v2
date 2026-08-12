export type AppLocale = 'en-GB' | 'pt-BR'

export type TranslationValues = Record<string, string | number>
export type TranslationDictionary = Record<string, string>

export interface TranslationBundle {
  'en-GB': TranslationDictionary
  'pt-BR': TranslationDictionary
}
