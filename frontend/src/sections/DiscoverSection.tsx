import {
  Box,
  HStack,
  Icon,
  Link,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  ArrowUpRight,
  BarChart3,
  Layers,
  MessageSquare,
  Sparkles,
} from '../components/ui/icons'
import type { LucideIcon } from '../components/ui/icons'

import { SectionCard, SectionHeader } from '../components/ui'
import type { AppPage } from '../components/layout/header/navigation.config'

type Accent = 'violet' | 'blue' | 'amber'

interface NudgeItem {
  id: string
  title: string
  description: string
  icon: LucideIcon
  accent: Accent
  /** Internal navigation target. Mutually exclusive with `href`. */
  page?: AppPage
  /** External link (mailto:, https:, …). Mutually exclusive with `page`. */
  href?: string
  /** CTA label shown next to the arrow. */
  cta: string
}

const NUDGES: NudgeItem[] = [
  {
    id: 'categories',
    title: 'See your categories',
    description: 'Discover where your money goes with a clean breakdown.',
    icon: Layers,
    accent: 'violet',
    page: 'categories',
    cta: 'Open',
  },
  {
    id: 'charts',
    title: 'Visualize your money',
    description: 'Spot trends with day, week, month and year views.',
    icon: BarChart3,
    accent: 'blue',
    page: 'charts',
    cta: 'Explore',
  },
  {
    id: 'feedback',
    title: 'Help shape what comes next',
    description: 'Got an idea, a bug or feedback? We would love to hear it.',
    icon: MessageSquare,
    accent: 'amber',
    href: 'mailto:hello@personalbudget.app?subject=Personal%20Budget%20feedback',
    cta: 'Get in touch',
  },
]

interface AccentTokens {
  chipBgLight: string
  chipBgDark: string
  chipFgLight: string
  chipFgDark: string
  hoverBorderLight: string
  hoverBorderDark: string
  glowLight: string
  glowDark: string
}

const ACCENTS: Record<Accent, AccentTokens> = {
  violet: {
    chipBgLight: 'purple.50',
    chipBgDark: 'rgba(139,92,246,0.16)',
    chipFgLight: 'purple.600',
    chipFgDark: 'purple.300',
    hoverBorderLight: 'purple.200',
    hoverBorderDark: 'rgba(139,92,246,0.45)',
    glowLight: 'rgba(139,92,246,0.10)',
    glowDark: 'rgba(139,92,246,0.18)',
  },
  blue: {
    chipBgLight: 'blue.50',
    chipBgDark: 'rgba(59,130,246,0.16)',
    chipFgLight: 'blue.600',
    chipFgDark: 'blue.300',
    hoverBorderLight: 'blue.200',
    hoverBorderDark: 'rgba(59,130,246,0.45)',
    glowLight: 'rgba(59,130,246,0.10)',
    glowDark: 'rgba(59,130,246,0.18)',
  },
  amber: {
    chipBgLight: 'orange.50',
    chipBgDark: 'rgba(249,115,22,0.16)',
    chipFgLight: 'orange.600',
    chipFgDark: 'orange.300',
    hoverBorderLight: 'orange.200',
    hoverBorderDark: 'rgba(249,115,22,0.45)',
    glowLight: 'rgba(249,115,22,0.10)',
    glowDark: 'rgba(249,115,22,0.18)',
  },
}

interface NudgeCardProps {
  item: NudgeItem
  onPageChange?: (page: AppPage) => void
}

function NudgeCard({ item, onPageChange }: NudgeCardProps) {
  const tokens = ACCENTS[item.accent]
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const hoverBorderColor = useColorModeValue(
    tokens.hoverBorderLight,
    tokens.hoverBorderDark,
  )
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const descriptionColor = useColorModeValue('gray.500', 'gray.400')
  const ctaColor = useColorModeValue('gray.600', 'gray.300')
  const chipBg = useColorModeValue(tokens.chipBgLight, tokens.chipBgDark)
  const chipFg = useColorModeValue(tokens.chipFgLight, tokens.chipFgDark)
  const glowColor = useColorModeValue(tokens.glowLight, tokens.glowDark)

  const isInternal = Boolean(item.page)

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isInternal && item.page && onPageChange) {
      event.preventDefault()
      onPageChange(item.page)
    }
  }

  return (
    <Link
      href={isInternal ? '#' : item.href}
      onClick={handleClick}
      isExternal={!isInternal}
      role="group"
      _hover={{ textDecoration: 'none' }}
      _focusVisible={{ outline: 'none' }}
      display="block"
      h="full"
    >
      <Box
        position="relative"
        h="full"
        p={{ base: 4, md: 5 }}
        borderRadius="xl"
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        transition="border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease"
        _groupHover={{
          borderColor: hoverBorderColor,
          transform: 'translateY(-2px)',
          boxShadow: `0 12px 32px -16px ${glowColor}`,
        }}
        _focusWithin={{
          borderColor: hoverBorderColor,
          boxShadow: `0 0 0 3px ${glowColor}`,
        }}
      >
        {/* Subtle radial glow that lifts on hover */}
        <Box
          position="absolute"
          top="-30%"
          right="-20%"
          w="160px"
          h="160px"
          borderRadius="full"
          bg={glowColor}
          filter="blur(40px)"
          opacity={0}
          transition="opacity 0.25s ease"
          _groupHover={{ opacity: 1 }}
          pointerEvents="none"
          aria-hidden
        />

        <VStack
          align="flex-start"
          spacing={3}
          position="relative"
          h="full"
        >
          <Box
            w={9}
            h={9}
            borderRadius="lg"
            bg={chipBg}
            color={chipFg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Icon as={item.icon} boxSize={4} strokeWidth={2.25} />
          </Box>

          <VStack align="flex-start" spacing={1} flex={1}>
            <Text
              fontWeight={700}
              fontSize="md"
              color={titleColor}
              lineHeight="1.25"
            >
              {item.title}
            </Text>
            <Text fontSize="sm" color={descriptionColor} lineHeight="1.45">
              {item.description}
            </Text>
          </VStack>

          <HStack
            spacing={1}
            color={ctaColor}
            fontSize="xs"
            fontWeight={600}
            letterSpacing="0.02em"
            transition="color 0.2s ease, transform 0.2s ease"
            _groupHover={{
              color: chipFg,
              transform: 'translateX(2px)',
            }}
          >
            <Text>{item.cta}</Text>
            <Icon as={ArrowUpRight} boxSize={3.5} strokeWidth={2.5} />
          </HStack>
        </VStack>
      </Box>
    </Link>
  )
}

export interface DiscoverSectionProps {
  /**
   * Optional handler used to switch between in-app pages without a real
   * router. When omitted, internal nudges fall back to noop links.
   */
  onPageChange?: (page: AppPage) => void
}

/**
 * Lightweight "explore the rest of the app + stay in touch" strip rendered
 * on the dashboard. Replaces the now-decoupled Category Analytics block
 * with quick links to the dedicated pages plus a contact CTA.
 */
export default function DiscoverSection({ onPageChange }: DiscoverSectionProps) {
  return (
    <SectionCard staticOnHover>
      <Box p={{ base: 4, sm: 5, md: 6 }}>
        <VStack spacing={{ base: 4, md: 5 }} align="stretch">
          <SectionHeader
            icon={Sparkles}
            title="Discover more"
            caption="Quick links to the rest of your dashboard — and a way to reach us."
            accent="violet"
          />

          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            spacing={{ base: 3, md: 4 }}
          >
            {NUDGES.map((item) => (
              <NudgeCard
                key={item.id}
                item={item}
                onPageChange={onPageChange}
              />
            ))}
          </SimpleGrid>
        </VStack>
      </Box>
    </SectionCard>
  )
}
