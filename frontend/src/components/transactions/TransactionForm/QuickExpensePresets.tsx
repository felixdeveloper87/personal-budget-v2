import {
  Box,
  Button,
  HStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { useState } from 'react'
import {
  Car,
  Coffee,
  Globe,
  Heart,
  ShoppingBag,
  ShoppingCart,
  Zap,
  type LucideIcon,
} from '../../ui/icons'

interface ExpensePreset {
  label: string
  category: string
  icon: LucideIcon
  domain?: string
}

const LOGO_DEV_TOKEN = import.meta.env.VITE_LOGO_DEV_TOKEN as string | undefined

function PresetLogo({ domain, FallbackIcon }: { domain?: string; FallbackIcon: LucideIcon }) {
  const [failed, setFailed] = useState(false)

  if (!domain || !LOGO_DEV_TOKEN || failed) {
    return <FallbackIcon size={15} aria-hidden />
  }

  const src = `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=32&format=png`

  return (
    <img
      src={src}
      alt=""
      width={15}
      height={15}
      style={{ objectFit: 'contain', display: 'block', borderRadius: '3px' }}
      onError={() => setFailed(true)}
    />
  )
}

const PRIMARY_PRESETS: ReadonlyArray<ExpensePreset> = [
  { label: 'Lidl',         category: 'Groceries', icon: ShoppingCart, domain: 'lidl.co.uk' },
  { label: "Sainsbury's",  category: 'Groceries', icon: ShoppingCart, domain: 'sainsburys.co.uk' },
  { label: 'Aldi',         category: 'Groceries', icon: ShoppingCart, domain: 'aldi.co.uk' },
  { label: 'Tesco',        category: 'Groceries', icon: ShoppingCart, domain: 'tesco.com' },
  { label: 'Off-licence',  category: 'Groceries', icon: Coffee },
  { label: 'Morrisons',    category: 'Groceries', icon: ShoppingCart, domain: 'morrisons.com' },
  { label: 'Asda',         category: 'Groceries', icon: ShoppingCart, domain: 'asda.com' },
  { label: 'Waitrose',     category: 'Groceries', icon: ShoppingCart, domain: 'waitrose.com' },
  { label: 'Co-op',        category: 'Groceries', icon: ShoppingCart, domain: 'coop.co.uk' },
  { label: 'Iceland',      category: 'Groceries', icon: ShoppingCart, domain: 'iceland.co.uk' },

  { label: 'Boots',            category: 'Health', icon: Heart, domain: 'boots.com' },
  { label: 'Holland & Barrett', category: 'Health', icon: Heart, domain: 'hollandandbarrett.com' },
  { label: 'Superdrug',        category: 'Health', icon: Heart, domain: 'superdrug.com' },

  { label: 'Petrol',             category: 'Transport', icon: Car },
  { label: 'Oil change',         category: 'Transport', icon: Car },
  { label: 'General Maintenance', category: 'Transport', icon: Car },

  { label: 'Primark',       category: 'Shopping', icon: ShoppingBag, domain: 'primark.com' },
  { label: 'Zara',          category: 'Shopping', icon: ShoppingBag, domain: 'zara.com' },
  { label: 'H&M',           category: 'Shopping', icon: ShoppingBag, domain: 'hm.com' },
  { label: 'Next',          category: 'Shopping', icon: ShoppingBag, domain: 'next.co.uk' },
  { label: 'New Look',      category: 'Shopping', icon: ShoppingBag, domain: 'newlook.com' },
  { label: 'River Island',  category: 'Shopping', icon: ShoppingBag, domain: 'riverisland.com' },
  { label: 'ASOS',          category: 'Shopping', icon: ShoppingBag, domain: 'asos.com' },

  { label: 'Gas',      category: 'Utilities', icon: Zap },
  { label: 'Energy',   category: 'Utilities', icon: Zap },
  { label: 'Water',    category: 'Utilities', icon: Zap },
  { label: 'Internet', category: 'Utilities', icon: Globe },

  { label: 'YouTube Premium', category: 'Subscriptions', icon: ShoppingBag, domain: 'youtube.com' },
  { label: 'Claude',          category: 'Subscriptions', icon: ShoppingBag, domain: 'claude.ai' },
  { label: 'ChatGPT Plus',    category: 'Subscriptions', icon: ShoppingBag, domain: 'openai.com' },
  { label: 'Apple Music',     category: 'Subscriptions', icon: ShoppingBag, domain: 'apple.com' },
  { label: 'Spotify',         category: 'Subscriptions', icon: ShoppingBag, domain: 'spotify.com' },
  { label: 'Netflix',         category: 'Subscriptions', icon: ShoppingBag, domain: 'netflix.com' },
  { label: 'Amazon Prime',    category: 'Subscriptions', icon: ShoppingBag, domain: 'amazon.co.uk' },
  { label: 'Disney+',         category: 'Subscriptions', icon: ShoppingBag, domain: 'disneyplus.com' },
]

interface QuickExpensePresetsProps {
  category: string
  onSelect: (preset: { description: string; category: string }) => void
}

export default function QuickExpensePresets({
  category,
  onSelect,
}: QuickExpensePresetsProps) {
  const labelColor = useColorModeValue('gray.500', 'gray.400')
  const chipBg = useColorModeValue('white', 'whiteAlpha.50')
  const chipBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const chipColor = useColorModeValue('gray.700', 'gray.200')
  const chipHoverBg = useColorModeValue('gray.50', 'whiteAlpha.100')

  const applyPreset = (preset: ExpensePreset) => {
    onSelect({
      description: preset.label,
      category: preset.category,
    })
  }

  const presets = PRIMARY_PRESETS.filter(
    preset => preset.category === category,
  )

  if (presets.length === 0) return null

  return (
    <Box>
      <Text
        mb={2}
        fontSize="xs"
        fontWeight={700}
        color={labelColor}
        textTransform="uppercase"
        letterSpacing="0.05em"
      >
        Quick add for {category}
      </Text>

      <HStack
        spacing={2}
        overflowX="auto"
        pb={1}
        sx={{
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {presets.map((preset) => {
          const PresetIcon = preset.icon

          return (
            <Button
              key={preset.label}
              size="sm"
              h="34px"
              px={3}
              flexShrink={0}
              borderRadius="full"
              border="1px solid"
              borderColor={chipBorder}
              bg={chipBg}
              color={chipColor}
              fontSize="xs"
              fontWeight={600}
              leftIcon={<PresetLogo domain={preset.domain} FallbackIcon={PresetIcon} />}
              onClick={() => applyPreset(preset)}
              _hover={{ bg: chipHoverBg, borderColor: 'red.200' }}
            >
              {preset.label}
            </Button>
          )
        })}
      </HStack>
    </Box>
  )
}
