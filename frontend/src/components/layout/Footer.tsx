import {
  Box,
  Container,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Link,
  SimpleGrid,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  ArrowUp,
  EyeOff,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from '../ui/icons'
import { BRAND } from './header/brand.config'
import { LANDING_SECTIONS } from './header/navigation.config'

/* -------------------------------------------------------------------------- */
/* Data                                                                        */
/* -------------------------------------------------------------------------- */

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

interface FooterSection {
  title: string
  links: ReadonlyArray<FooterLink>
}

/**
 * Explore links are derived from LANDING_SECTIONS (the same source the
 * header's LandingNav uses). Adding a section to the landing now updates
 * both nav surfaces in one place.
 */
const SECTIONS: ReadonlyArray<FooterSection> = [
  {
    title: 'Explore',
    links: LANDING_SECTIONS.map((s) => ({ label: s.label, href: `#${s.id}` })),
  },
  {
    title: 'Trust',
    links: [
      { label: 'What we promise', href: '#trust' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
]

interface TrustBadge {
  icon: LucideIcon
  label: string
  /** Tone: green / blue / violet — drives the accent palette */
  tone: 'green' | 'blue' | 'violet'
}

const TRUST_BADGES: ReadonlyArray<TrustBadge> = [
  { icon: Wallet, label: 'Free', tone: 'green' },
  { icon: ShieldCheck, label: 'Encrypted', tone: 'blue' },
  { icon: EyeOff, label: 'No tracking', tone: 'violet' },
]

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export default function Footer() {
  // Centralize all theme tokens — calling useColorModeValue inside .map() is a
  // Rules of Hooks violation. Pass colors down as props/strings instead.
  const surface = useColorModeValue('white', '#06080b')
  const surfaceTopBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const heading = useColorModeValue('gray.900', 'whiteAlpha.900')
  const body = useColorModeValue('gray.600', 'gray.400')
  const muted = useColorModeValue('gray.500', 'gray.500')
  const linkColor = useColorModeValue('gray.600', 'gray.400')
  const linkHover = useColorModeValue('gray.900', 'whiteAlpha.900')
  const logoBoxBg = useColorModeValue('blue.50', 'whiteAlpha.100')
  const logoBoxBorder = useColorModeValue('blue.100', 'whiteAlpha.200')
  const logoIconColor = useColorModeValue('blue.600', 'blue.300')
  const dividerColor = useColorModeValue('gray.100', 'whiteAlpha.100')
  const accentLineGradient = useColorModeValue(
    'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.5) 30%, rgba(139,92,246,0.5) 70%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, rgba(96,165,250,0.4) 30%, rgba(167,139,250,0.4) 70%, transparent 100%)',
  )
  const scrollBtnBg = useColorModeValue('white', 'rgba(255,255,255,0.04)')
  const scrollBtnBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const scrollBtnHoverBg = useColorModeValue('gray.50', 'whiteAlpha.100')

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const year = new Date().getFullYear()

  return (
    <Box
      as="footer"
      role="contentinfo"
      bg={surface}
      borderTop="1px solid"
      borderColor={surfaceTopBorder}
      position="relative"
      mt="auto"
    >
      {/* Top accent line — mirrors the gradient strip at the bottom of the header */}
      <Box
        aria-hidden
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="1px"
        background={accentLineGradient}
      />

      <Container
        maxW={{ base: '100%', xl: '1200px', '2xl': '1320px' }}
        px={{ base: 4, md: 8, lg: 12 }}
        py={{ base: 12, md: 16 }}
      >
        <SimpleGrid columns={{ base: 1, md: 12 }} spacing={{ base: 10, md: 8 }}>
          {/* Brand column — wider on desktop */}
          <BrandColumn
            heading={heading}
            body={body}
            logoBoxBg={logoBoxBg}
            logoBoxBorder={logoBoxBorder}
            logoIconColor={logoIconColor}
          />

          {/* Link columns */}
          <SimpleGrid
            gridColumn={{ md: 'span 7' }}
            columns={{ base: 2, sm: 2 }}
            spacing={{ base: 8, md: 6 }}
          >
            {SECTIONS.map((section) => (
              <LinkColumn
                key={section.title}
                section={section}
                heading={heading}
                linkColor={linkColor}
                linkHover={linkHover}
              />
            ))}
          </SimpleGrid>
        </SimpleGrid>

        {/* Hairline divider */}
        <Box mt={{ base: 12, md: 14 }} mb={{ base: 6, md: 8 }} h="1px" bg={dividerColor} />

        {/* Bottom bar */}
        <Flex
          direction={{ base: 'column-reverse', md: 'row' }}
          justify="space-between"
          align="center"
          gap={6}
        >
          <Text fontSize="xs" color={muted} fontWeight={500} textAlign={{ base: 'center', md: 'left' }}>
            © {year} {BRAND.nameFull} — built with care, kept free.
          </Text>

          <HStack spacing={3} flexWrap="wrap" justify="center">
            {TRUST_BADGES.map((b) => (
              <TrustBadgePill key={b.label} badge={b} />
            ))}
            <Tooltip label="Back to top" hasArrow placement="top" openDelay={250}>
              <IconButton
                aria-label="Scroll to top"
                icon={<ArrowUp size={14} strokeWidth={2.5} />}
                size="sm"
                variant="ghost"
                borderRadius="full"
                onClick={scrollToTop}
                color={muted}
                bg={scrollBtnBg}
                border="1px solid"
                borderColor={scrollBtnBorder}
                _hover={{ bg: scrollBtnHoverBg, color: heading, transform: 'translateY(-1px)' }}
                _active={{ transform: 'translateY(0)' }}
                transition="all 0.2s cubic-bezier(0.32, 0.72, 0, 1)"
              />
            </Tooltip>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                               */
/* -------------------------------------------------------------------------- */

interface BrandColumnProps {
  heading: string
  body: string
  logoBoxBg: string
  logoBoxBorder: string
  logoIconColor: string
}

function BrandColumn({ heading, body, logoBoxBg, logoBoxBorder, logoIconColor }: BrandColumnProps) {
  return (
    <VStack gridColumn={{ md: 'span 5' }} align="flex-start" spacing={5} maxW="420px">
      <HStack spacing={3}>
        <Box
          w="40px"
          h="40px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="xl"
          bg={logoBoxBg}
          border="1px solid"
          borderColor={logoBoxBorder}
          color={logoIconColor}
        >
          <Icon as={Wallet} boxSize={5} strokeWidth={2.25} />
        </Box>
        <VStack spacing={0} align="flex-start">
          <Heading
            as="span"
            fontSize="lg"
            fontWeight={800}
            color={heading}
            letterSpacing="-0.02em"
            lineHeight={1}
          >
            {BRAND.nameFull}
          </Heading>
          <Text fontSize="xs" color={body} fontWeight={500}>
            {BRAND.tagline}
          </Text>
        </VStack>
      </HStack>

      <Text fontSize="sm" color={body} lineHeight={1.65}>
        A small, focused budget app. No platform ambitions, no tracking, no upsell — just a calm dashboard you actually open.
      </Text>
    </VStack>
  )
}

interface ColumnTitleProps {
  heading: string
  children: React.ReactNode
}

function ColumnTitle({ heading, children }: ColumnTitleProps) {
  return (
    <Text
      fontSize="xs"
      fontWeight={700}
      color={heading}
      letterSpacing="0.1em"
      textTransform="uppercase"
    >
      {children}
    </Text>
  )
}

interface LinkColumnProps {
  section: FooterSection
  heading: string
  linkColor: string
  linkHover: string
}

function LinkColumn({ section, heading, linkColor, linkHover }: LinkColumnProps) {
  return (
    <VStack align="flex-start" spacing={4}>
      <ColumnTitle heading={heading}>{section.title}</ColumnTitle>
      <VStack as="ul" align="flex-start" spacing={2.5} listStyleType="none" m={0} p={0}>
        {section.links.map((link) => (
          <Box as="li" key={link.label}>
            <Link
              href={link.href}
              isExternal={link.external}
              fontSize="sm"
              color={linkColor}
              fontWeight={500}
              _hover={{ color: linkHover, textDecoration: 'none' }}
              transition="color 0.2s ease"
            >
              {link.label}
            </Link>
          </Box>
        ))}
      </VStack>
    </VStack>
  )
}

/* -------------------------------------------------------------------------- */
/* Trust badge pill                                                            */
/* -------------------------------------------------------------------------- */

function TrustBadgePill({ badge }: { badge: TrustBadge }) {
  const tones = useTrustToneTokens()
  const palette = tones[badge.tone]
  return (
    <HStack
      as="span"
      spacing={1.5}
      px={2.5}
      py={1}
      borderRadius="full"
      bg={palette.bg}
      color={palette.fg}
      border="1px solid"
      borderColor={palette.border}
      fontSize="2xs"
      fontWeight={600}
      letterSpacing="0.02em"
    >
      <Icon as={badge.icon} boxSize={3} strokeWidth={2.25} />
      <Text as="span">{badge.label}</Text>
    </HStack>
  )
}

/** Pre-resolves all tone palettes so .map() doesn't call hooks. */
function useTrustToneTokens() {
  const greenBg = useColorModeValue('green.50', 'rgba(34,197,94,0.10)')
  const greenFg = useColorModeValue('green.700', 'green.300')
  const greenBorder = useColorModeValue('green.100', 'rgba(34,197,94,0.25)')

  const blueBg = useColorModeValue('blue.50', 'rgba(59,130,246,0.10)')
  const blueFg = useColorModeValue('blue.700', 'blue.300')
  const blueBorder = useColorModeValue('blue.100', 'rgba(59,130,246,0.25)')

  const violetBg = useColorModeValue('purple.50', 'rgba(139,92,246,0.10)')
  const violetFg = useColorModeValue('purple.700', 'purple.300')
  const violetBorder = useColorModeValue('purple.100', 'rgba(139,92,246,0.25)')

  return {
    green: { bg: greenBg, fg: greenFg, border: greenBorder },
    blue: { bg: blueBg, fg: blueFg, border: blueBorder },
    violet: { bg: violetBg, fg: violetFg, border: violetBorder },
  }
}
