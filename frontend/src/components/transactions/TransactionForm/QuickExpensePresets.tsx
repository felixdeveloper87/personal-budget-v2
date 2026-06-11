import {
  Box,
  Button,
  HStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { useState } from 'react'
import {
  BookOpen,
  Briefcase,
  Building,
  Car,
  Coffee,
  DollarSign,
  Film,
  Gamepad2,
  Gift,
  Globe,
  GraduationCap,
  Heart,
  Home,
  Music,
  ReceiptText,
  Shield,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Zap,
  type LucideIcon,
} from '../../ui/icons'

interface ExpensePreset {
  label: string
  category: string
  icon: LucideIcon
  domain?: string
  transactionType?: 'INCOME' | 'EXPENSE'
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
  { label: 'Uber Eats',   category: 'Salary', icon: Car, domain: 'ubereats.com' },
  { label: 'Deliveroo',   category: 'Salary', icon: Car, domain: 'deliveroo.co.uk' },
  { label: 'Uber',        category: 'Salary', icon: Car, domain: 'uber.com' },
  { label: 'Just Eat',    category: 'Salary', icon: Car, domain: 'just-eat.co.uk' },
  { label: 'Bolt',        category: 'Salary', icon: Car, domain: 'bolt.eu' },
  { label: 'Amazon Flex', category: 'Salary', icon: ShoppingBag, domain: 'flex.amazon.co.uk' },
  { label: 'Stuart',      category: 'Salary', icon: Car, domain: 'stuart.com' },
  { label: 'Evri',        category: 'Salary', icon: Car, domain: 'evri.com' },

  { label: 'Upwork',       category: 'Freelance', icon: Briefcase, domain: 'upwork.com' },
  { label: 'Fiverr',       category: 'Freelance', icon: Briefcase, domain: 'fiverr.com' },
  { label: 'PeoplePerHour', category: 'Freelance', icon: Briefcase, domain: 'peopleperhour.com' },
  { label: 'Freelancer',   category: 'Freelance', icon: Briefcase, domain: 'freelancer.com' },
  { label: 'Toptal',       category: 'Freelance', icon: Briefcase, domain: 'toptal.com' },

  { label: 'Trading 212', category: 'Investments', icon: TrendingUp, domain: 'trading212.com' },
  { label: 'Vanguard',    category: 'Investments', icon: TrendingUp, domain: 'vanguardinvestor.co.uk' },
  { label: 'Freetrade',   category: 'Investments', icon: TrendingUp, domain: 'freetrade.io' },
  { label: 'Hargreaves Lansdown', category: 'Investments', icon: TrendingUp, domain: 'hl.co.uk' },
  { label: 'eToro',       category: 'Investments', icon: TrendingUp, domain: 'etoro.com' },

  { label: 'Tenant rent',     category: 'Rental', icon: Home },
  { label: 'Airbnb',          category: 'Rental', icon: Home, domain: 'airbnb.co.uk' },
  { label: 'Booking.com',     category: 'Rental', icon: Home, domain: 'booking.com' },
  { label: 'SpareRoom',       category: 'Rental', icon: Home, domain: 'spareroom.co.uk' },
  { label: 'OpenRent',        category: 'Rental', icon: Home, domain: 'openrent.co.uk' },

  { label: 'Annual bonus',      category: 'Bonus', icon: Gift },
  { label: 'Performance bonus', category: 'Bonus', icon: Gift },
  { label: 'Christmas bonus',   category: 'Bonus', icon: Gift },
  { label: 'Commission',        category: 'Bonus', icon: Gift },
  { label: 'Referral bonus',    category: 'Bonus', icon: Gift },

  { label: 'Client payment', category: 'Business', icon: Briefcase },
  { label: 'Product sales',  category: 'Business', icon: ShoppingBag },
  { label: 'Consulting',     category: 'Business', icon: Briefcase },
  { label: 'Service fee',    category: 'Business', icon: ReceiptText },
  { label: 'Royalties',      category: 'Business', icon: DollarSign },

  { label: 'Birthday gift',  category: 'Gifts', icon: Gift },
  { label: 'Christmas gift', category: 'Gifts', icon: Gift },
  { label: 'Wedding gift',   category: 'Gifts', icon: Gift },
  { label: 'Family gift',    category: 'Gifts', icon: Gift },
  { label: 'Cash gift',      category: 'Gifts', icon: Gift },

  { label: 'Universal Credit', category: 'Benefits', icon: Wallet, domain: 'gov.uk' },
  { label: 'Child Benefit',    category: 'Benefits', icon: Wallet, domain: 'gov.uk' },
  { label: 'Housing Benefit',  category: 'Benefits', icon: Home, domain: 'gov.uk' },
  { label: 'PIP',              category: 'Benefits', icon: Wallet, domain: 'gov.uk' },
  { label: 'State Pension',    category: 'Benefits', icon: Wallet, domain: 'gov.uk' },

  { label: 'Tax refund',      category: 'Refunds', icon: ReceiptText, domain: 'gov.uk' },
  { label: 'Amazon refund',   category: 'Refunds', icon: ReceiptText, domain: 'amazon.co.uk' },
  { label: 'Retail refund',   category: 'Refunds', icon: ReceiptText },
  { label: 'Travel refund',   category: 'Refunds', icon: ReceiptText },
  { label: 'Utility refund',  category: 'Refunds', icon: ReceiptText },

  { label: 'Etsy',         category: 'Side hustle', icon: Briefcase, domain: 'etsy.com' },
  { label: 'Vinted',       category: 'Side hustle', icon: ShoppingBag, domain: 'vinted.co.uk' },
  { label: 'eBay',         category: 'Side hustle', icon: ShoppingBag, domain: 'ebay.co.uk' },
  { label: 'Taskrabbit',   category: 'Side hustle', icon: Briefcase, domain: 'taskrabbit.co.uk' },
  { label: 'Rover',        category: 'Side hustle', icon: Briefcase, domain: 'rover.com' },

  { label: 'TopCashback', category: 'Cashback', icon: DollarSign, domain: 'topcashback.co.uk' },
  { label: 'Quidco',      category: 'Cashback', icon: DollarSign, domain: 'quidco.com' },
  { label: 'Airtime Rewards', category: 'Cashback', icon: DollarSign, domain: 'airtimerewards.co.uk' },
  { label: 'Chase rewards', category: 'Cashback', icon: DollarSign, domain: 'chase.co.uk' },
  { label: 'Amex rewards', category: 'Cashback', icon: DollarSign, domain: 'americanexpress.com' },

  { label: 'Bank interest', category: 'Others', icon: DollarSign, transactionType: 'INCOME' },
  { label: 'Cash deposit',  category: 'Others', icon: Wallet, transactionType: 'INCOME' },
  { label: 'Prize money',   category: 'Others', icon: Gift, transactionType: 'INCOME' },
  { label: 'Dividend',      category: 'Others', icon: TrendingUp, transactionType: 'INCOME' },
  { label: 'Reimbursement', category: 'Others', icon: ReceiptText, transactionType: 'INCOME' },

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

  { label: "McDonald's", category: 'Dining out', icon: Coffee, domain: 'mcdonalds.com' },
  { label: "Nando's",    category: 'Dining out', icon: Coffee, domain: 'nandos.co.uk' },
  { label: "Pepe's",     category: 'Dining out', icon: Coffee, domain: 'pepes.co.uk' },
  { label: 'KFC',         category: 'Dining out', icon: Coffee, domain: 'kfc.co.uk' },
  { label: 'Greggs',      category: 'Dining out', icon: Coffee, domain: 'greggs.co.uk' },
  { label: 'Burger King', category: 'Dining out', icon: Coffee, domain: 'burgerking.co.uk' },
  { label: 'Subway',      category: 'Dining out', icon: Coffee, domain: 'subway.com' },
  { label: 'Pizza Hut',   category: 'Dining out', icon: Coffee, domain: 'pizzahut.co.uk' },
  { label: "Domino's",   category: 'Dining out', icon: Coffee, domain: 'dominos.co.uk' },
  { label: 'Costa Coffee', category: 'Dining out', icon: Coffee, domain: 'costa.co.uk' },

  { label: 'Boots',            category: 'Health', icon: Heart, domain: 'boots.com' },
  { label: 'Holland & Barrett', category: 'Health', icon: Heart, domain: 'hollandandbarrett.com' },
  { label: 'Superdrug',        category: 'Health', icon: Heart, domain: 'superdrug.com' },
  { label: 'Pharmacy',         category: 'Health', icon: Heart },
  { label: 'Dentist',          category: 'Health', icon: Heart },

  { label: 'Petrol',             category: 'Transport', icon: Car },
  { label: 'Oil change',         category: 'Transport', icon: Car },
  { label: 'General Maintenance', category: 'Transport', icon: Car },
  { label: 'TfL',                category: 'Transport', icon: Car, domain: 'tfl.gov.uk' },
  { label: 'Trainline',          category: 'Transport', icon: Car, domain: 'thetrainline.com' },

  { label: 'Rent payment', category: 'Rent', icon: Home },
  { label: 'Service charge', category: 'Rent', icon: Building },
  { label: 'Ground rent', category: 'Rent', icon: Building },
  { label: 'Room rent', category: 'Rent', icon: Home },
  { label: 'Storage rent', category: 'Rent', icon: Building },

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
  { label: 'Council tax', category: 'Utilities', icon: Building },

  { label: 'YouTube Premium', category: 'Subscriptions', icon: ShoppingBag, domain: 'youtube.com' },
  { label: 'Claude',          category: 'Subscriptions', icon: ShoppingBag, domain: 'claude.ai' },
  { label: 'ChatGPT Plus',    category: 'Subscriptions', icon: ShoppingBag, domain: 'openai.com' },
  { label: 'Apple Music',     category: 'Subscriptions', icon: ShoppingBag, domain: 'apple.com' },
  { label: 'Spotify',         category: 'Subscriptions', icon: ShoppingBag, domain: 'spotify.com' },
  { label: 'Netflix',         category: 'Subscriptions', icon: ShoppingBag, domain: 'netflix.com' },
  { label: 'Amazon Prime',    category: 'Subscriptions', icon: ShoppingBag, domain: 'amazon.co.uk' },
  { label: 'Disney+',         category: 'Subscriptions', icon: ShoppingBag, domain: 'disneyplus.com' },

  { label: 'Cinema',       category: 'Entertainment', icon: Film },
  { label: 'PlayStation',  category: 'Entertainment', icon: Gamepad2, domain: 'playstation.com' },
  { label: 'Xbox',         category: 'Entertainment', icon: Gamepad2, domain: 'xbox.com' },
  { label: 'Concert',      category: 'Entertainment', icon: Music },
  { label: 'Bowling',      category: 'Entertainment', icon: Gamepad2 },

  { label: 'Car insurance',    category: 'Insurance', icon: Shield },
  { label: 'Home insurance',   category: 'Insurance', icon: Shield },
  { label: 'Life insurance',   category: 'Insurance', icon: Shield },
  { label: 'Travel insurance', category: 'Insurance', icon: Shield },
  { label: 'Pet insurance',    category: 'Insurance', icon: Shield },

  { label: 'Tuition fees', category: 'Education', icon: GraduationCap },
  { label: 'Udemy',        category: 'Education', icon: BookOpen, domain: 'udemy.com' },
  { label: 'Coursera',     category: 'Education', icon: BookOpen, domain: 'coursera.org' },
  { label: 'Books',        category: 'Education', icon: BookOpen },
  { label: 'School supplies', category: 'Education', icon: GraduationCap },

  { label: 'Bank fee',     category: 'Others', icon: ReceiptText, transactionType: 'EXPENSE' },
  { label: 'Donation',     category: 'Others', icon: Gift, transactionType: 'EXPENSE' },
  { label: 'Pet care',     category: 'Others', icon: Heart, transactionType: 'EXPENSE' },
  { label: 'Postage',      category: 'Others', icon: ReceiptText, transactionType: 'EXPENSE' },
  { label: 'Miscellaneous', category: 'Others', icon: ShoppingBag, transactionType: 'EXPENSE' },
]

interface QuickExpensePresetsProps {
  category: string
  transactionType: 'INCOME' | 'EXPENSE'
  onSelect: (preset: { description: string; category: string }) => void
}

export default function QuickExpensePresets({
  category,
  transactionType,
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
    preset =>
      preset.category === category &&
      (!preset.transactionType || preset.transactionType === transactionType),
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
