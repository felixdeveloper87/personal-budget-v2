import { Box, Text, VStack } from '@chakra-ui/react'
import PagedGrid, { tileStyle } from './PagedGrid'
import MerchantLogo from '../../ui/MerchantLogo'
import { useI18n } from '../../../i18n'
import DescriptionInput from './DescriptionInput'

const CATEGORIES = [
  'Groceries',
  'Dining out',
  'Utilities',
  'Health',
  'Transport',
  'Shopping',
  'Subscriptions',
  'Entertainment',
  'Other',
] as const

type ExpenseCategory = typeof CATEGORIES[number]

interface MerchantSuggestion {
  domain?: string
  name: string
}

const MERCHANTS: Partial<Record<ExpenseCategory, readonly MerchantSuggestion[]>> = {
  Groceries: [
    { name: 'Tesco', domain: 'tesco.com' },
    { name: 'Lidl', domain: 'lidl.co.uk' },
    { name: 'Aldi', domain: 'aldi.co.uk' },
    { name: "Sainsbury's", domain: 'sainsburys.co.uk' },
    { name: 'Marks & Spencer', domain: 'marksandspencer.com' },
    { name: 'Asda', domain: 'asda.com' },
    { name: 'Costco', domain: 'costco.co.uk' },
    { name: 'Morrisons', domain: 'morrisons.com' },
    { name: 'Waitrose', domain: 'waitrose.com' },
    { name: 'Iceland', domain: 'iceland.co.uk' },
    { name: 'Co-op', domain: 'coop.co.uk' },
    { name: 'Off Licence' },
  ],
  'Dining out': [
    { name: "McDonald's", domain: 'mcdonalds.com' },
    { name: "Nando's", domain: 'nandos.co.uk' },
    { name: "Pepe's Piri Piri", domain: 'pepes.co.uk' },
    { name: 'KFC', domain: 'kfc.co.uk' },
    { name: 'Greggs', domain: 'greggs.co.uk' },
    { name: 'Costa Coffee', domain: 'costa.co.uk' },
    { name: 'Starbucks', domain: 'starbucks.co.uk' },
    { name: 'Pizza Hut', domain: 'pizzahut.co.uk' },
    { name: 'Burger King', domain: 'burgerking.co.uk' },
    { name: "Domino's", domain: 'dominos.co.uk' },
    { name: 'Subway', domain: 'subway.com' },
    { name: 'Kokoro', domain: 'kokorouk.com' },
    { name: 'Pret A Manger', domain: 'pret.co.uk' },
    { name: 'Wagamama', domain: 'wagamama.com' },
    { name: 'Pizza Pilgrims', domain: 'pizzapilgrims.co.uk' },
  ],
  Utilities: [
    { name: 'OVO Energy', domain: 'ovoenergy.com' },
    { name: '100Green', domain: '100green.com' },
    { name: 'Community Fibre', domain: 'communityfibre.co.uk' },
    { name: 'SES Water', domain: 'seswater.co.uk' },
    { name: 'British Gas', domain: 'britishgas.co.uk' },
    { name: 'Octopus Energy', domain: 'octopus.energy' },
    { name: 'EDF Energy', domain: 'edfenergy.com' },
    { name: 'Thames Water', domain: 'thameswater.co.uk' },
    { name: 'Sky', domain: 'sky.com' },
  ],
  Health: [
    { name: 'Boots', domain: 'boots.com' },
    { name: 'Superdrug', domain: 'superdrug.com' },
    { name: 'Holland & Barrett', domain: 'hollandandbarrett.com' },
    { name: 'Specsavers', domain: 'specsavers.co.uk' },
    { name: 'Bupa', domain: 'bupa.co.uk' },
    { name: 'Nuffield Health', domain: 'nuffieldhealth.com' },
  ],
  Transport: [
    { name: 'Oil change' },
    { name: 'Petrol' },
    { name: 'Front tyre' },
    { name: 'Front brake pad' },
    { name: 'Rear tyre' },
    { name: 'Rear brake pad' },
  ],
  Subscriptions: [
    { name: 'YouTube', domain: 'youtube.com' },
    { name: 'OpenAI', domain: 'openai.com' },
    { name: 'Claude', domain: 'claude.ai' },
    { name: 'iCloud', domain: 'icloud.com' },
    { name: 'Spotify', domain: 'spotify.com' },
    { name: 'Netflix', domain: 'netflix.com' },
    { name: 'Disney+', domain: 'disneyplus.com' },
    { name: 'Amazon Prime', domain: 'amazon.co.uk' },
    { name: 'Microsoft 365', domain: 'microsoft.com' },
  ],
  Entertainment: [
    { name: 'Cinema' },
    { name: 'Steam', domain: 'steampowered.com' },
    { name: 'Show' },
  ],
  Shopping: [
    { name: 'Amazon', domain: 'amazon.co.uk' },
    { name: 'Temu', domain: 'temu.com' },
    { name: 'Primark', domain: 'primark.com' },
    { name: 'Zara', domain: 'zara.com' },
    { name: 'eBay', domain: 'ebay.co.uk' },
    { name: 'Next', domain: 'next.co.uk' },
    { name: 'H&M', domain: 'hm.com' },
    { name: 'John Lewis', domain: 'johnlewis.com' },
    { name: 'Argos', domain: 'argos.co.uk' },
    { name: 'TK Maxx', domain: 'tkmaxx.com' },
    { name: 'Hollister', domain: 'hollisterco.com' },
    { name: 'Dunelm', domain: 'dunelm.com' },
    { name: 'UNIQLO', domain: 'uniqlo.com' },
  ],
}

const SUGGESTED_MERCHANT_NAMES = new Set(
  Object.values(MERCHANTS).flatMap((items) => items?.map((item) => item.name) ?? []),
)

const MERCHANT_DOMAIN_BY_NAME = new Map<string, string>(
  Object.values(MERCHANTS).flatMap((items) =>
    (items ?? []).filter((item) => item.domain).map((item) => [item.name.trim().toLowerCase(), item.domain as string] as const),
  ),
)

/** Domain of a suggested merchant (e.g. "Tesco" → tesco.com), or null when it isn't one. */
export function findMerchantDomain(name: string): string | null {
  return MERCHANT_DOMAIN_BY_NAME.get(name.trim().toLowerCase()) ?? null
}

interface ExpenseQuickAddProps {
  category: string
  description: string
  loading?: boolean
  onCategoryChange: (value: string) => void
  onDescriptionChange: (value: string) => void
}

export default function ExpenseQuickAdd({
  category,
  description,
  loading = false,
  onCategoryChange,
  onDescriptionChange,
}: ExpenseQuickAddProps) {
  const { t, categoryLabel } = useI18n()
  const selectedMerchants = MERCHANTS[category as ExpenseCategory] ?? []
  const hasSelectedMerchant = selectedMerchants.some((merchant) => merchant.name === description)
  const hideDescription = hasSelectedMerchant

  const selectCategory = (nextCategory: ExpenseCategory) => {
    if (SUGGESTED_MERCHANT_NAMES.has(description)) {
      onDescriptionChange('')
    }
    onCategoryChange(nextCategory)
  }

  return (
    <VStack align="stretch" spacing={3}>
      <Text color="var(--pb-ink-soft)" fontWeight={700}>
        {t('transactions.category')}
      </Text>
      <PagedGrid
        items={CATEGORIES}
        getKey={(item) => item}
        initialIndex={CATEGORIES.indexOf(category as ExpenseCategory)}
        label={t('transactions.category')}
        renderItem={(item) => {
          const selected = category === item
          const label = item === 'Entertainment' ? t('category.short.Entertainment') : categoryLabel(item)
          return (
            <Box
              as="button"
              type="button"
              aria-pressed={selected}
              onClick={() => selectCategory(item)}
              {...tileStyle(selected)}
              minH="42px"
              justifyContent="center"
              fontSize="sm"
              fontWeight={selected ? 800 : 650}
            >
              <Text as="span" noOfLines={2} lineHeight="1.15" textAlign="center" wordBreak="break-word">
                {label}
              </Text>
            </Box>
          )
        }}
      />

      {selectedMerchants.length > 0 && (
        <>
          <Text color="var(--pb-ink-soft)" fontWeight={700}>
            {t('dashboard.quickAdd')}
          </Text>
          <PagedGrid
            key={category}
            items={selectedMerchants}
            getKey={(merchant) => merchant.name}
            initialIndex={selectedMerchants.findIndex((merchant) => merchant.name === description)}
            label={t('dashboard.quickAdd')}
            renderItem={(merchant) => {
              const selected = description === merchant.name
              return (
                <Box
                  as="button"
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onDescriptionChange(selected ? '' : merchant.name)}
                  {...tileStyle(selected)}
                  fontSize="sm"
                >
                  <MerchantLogo category={category} domain={merchant.domain} name={merchant.name} size={32} />
                  <Text
                    as="span"
                    ml={2}
                    minW={0}
                    noOfLines={2}
                    lineHeight="1.15"
                    textAlign="left"
                    wordBreak="break-word"
                    fontWeight={800}
                  >
                    {merchant.name}
                  </Text>
                </Box>
              )
            }}
          />
        </>
      )}

      {!hideDescription && (
        <DescriptionInput
          value={description}
          onChange={onDescriptionChange}
          type="EXPENSE"
          loading={loading}
        />
      )}
    </VStack>
  )
}
