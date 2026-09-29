import { Box, Button, Grid, Text, VStack } from '@chakra-ui/react'
import MerchantLogo from '../../ui/MerchantLogo'
import { useI18n } from '../../../i18n'
import DescriptionInput from './DescriptionInput'

const CATEGORIES = [
  'Groceries',
  'Dining out',
  'Utilities',
  'Health',
  'Rent',
  'Shopping',
  'Subscription',
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
  Subscription: [
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
  const hideDescription = hasSelectedMerchant || category === 'Rent'

  const selectCategory = (nextCategory: ExpenseCategory) => {
    if (nextCategory === 'Rent') {
      onDescriptionChange('Rent')
    } else if (category === 'Rent' || SUGGESTED_MERCHANT_NAMES.has(description)) {
      onDescriptionChange('')
    }
    onCategoryChange(nextCategory)
  }

  return (
    <VStack align="stretch" spacing={3}>
      <Text color="var(--pb-ink-soft)" fontWeight={700} textTransform="uppercase" letterSpacing="0.05em">
        {t('transactions.category')}
      </Text>
      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={2}>
        {CATEGORIES.map((item) => {
          const selected = category === item
          const label = item === 'Entertainment' ? 'Leisure' : categoryLabel(item)
          return (
            <Button
              key={item}
              minW={0}
              h="42px"
              px={2}
              borderRadius="14px"
              border="1px solid"
              borderColor={selected ? '#D05F5B' : 'var(--pb-hair)'}
              bg={selected ? '#F9E9E5' : 'var(--pb-surface)'}
              color={selected ? '#A45148' : 'var(--pb-ink)'}
              fontWeight={selected ? 800 : 650}
              onClick={() => selectCategory(item)}
              aria-pressed={selected}
              _hover={{ borderColor: '#D05F5B', bg: selected ? '#F9E9E5' : '#FBF1ED' }}
            >
              <Box as="span" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {label}
              </Box>
            </Button>
          )
        })}
      </Grid>

      {selectedMerchants.length > 0 && (
        <>
          <Text color="var(--pb-ink-soft)" fontWeight={700} textTransform="uppercase" letterSpacing="0.05em">
            {t('dashboard.quickAdd')}
          </Text>
          <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={2}>
            {selectedMerchants.map((merchant) => {
              const selected = description === merchant.name
              return (
                <Button
                  key={merchant.name}
                  h="54px"
                  minW={0}
                  px={2}
                  justifyContent="flex-start"
                  borderRadius="15px"
                  border="1px solid"
                  borderColor={selected ? '#D05F5B' : 'var(--pb-hair)'}
                  bg={selected ? '#F9E9E5' : 'var(--pb-surface)'}
                  color={selected ? '#A45148' : 'var(--pb-ink)'}
                  onClick={() => onDescriptionChange(selected ? '' : merchant.name)}
                  aria-pressed={selected}
                  _hover={{ borderColor: '#D05F5B', bg: selected ? '#F9E9E5' : '#FBF1ED' }}
                >
                  <MerchantLogo category={category} domain={merchant.domain} name={merchant.name} size={32} />
                  <Box as="span" ml={2} minW={0} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" fontWeight={800}>
                    {merchant.name}
                  </Box>
                </Button>
              )
            })}
          </Grid>
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
