import { Box, Flex, Grid, Icon, Text } from '@chakra-ui/react'
import { useState, type ReactNode } from 'react'

import { ChevronRight } from '../../../components/ui/icons'
import BankLogo, { getBankMeta } from '../../../components/ui/BankLogo'
import MerchantLogo from '../../../components/ui/MerchantLogo'

/** Row of key figures on a soft grey tile (Nubank "resumo" strip). */
export function NuStatStrip({ stats }: { stats: Array<{ label: string; value: string; tone?: 'positive' | 'negative' }> }) {
  return (
    <Grid
      templateColumns={`repeat(${stats.length}, minmax(0, 1fr))`}
      bg="var(--nu-surface)"
      borderRadius="16px"
      px={{ base: 3, md: 5 }}
      py={{ base: 3, md: 4 }}
      gap={{ base: 2, md: 4 }}
    >
      {stats.map((stat, index) => (
        <Box key={stat.label} minW={0} pl={index > 0 ? { base: 2, md: 4 } : 0} borderLeft={index > 0 ? '1px solid var(--pb-hair-2)' : undefined}>
          <Text fontSize={{ base: 'xs', md: 'sm' }} color="var(--pb-ink-soft)" noOfLines={1}>{stat.label}</Text>
          <Text
            mt={0.5}
            fontSize={{ base: 'md', md: 'lg' }}
            fontWeight={700}
            color={stat.tone === 'positive' ? 'var(--nu-positive)' : stat.tone === 'negative' ? 'var(--nu-negative)' : 'var(--pb-ink)'}
            noOfLines={1}
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {stat.value}
          </Text>
        </Box>
      ))}
    </Grid>
  )
}

interface NuListRowProps {
  leading: ReactNode
  title: ReactNode
  caption?: ReactNode
  amount: ReactNode
  amountColor?: string
  amountCaption?: ReactNode
  /** Extra content under the text (e.g. a progress bar). */
  footer?: ReactNode
  muted?: boolean
  onClick?: () => void
  ariaLabel?: string
}

/** Tappable list row on the white sheet: avatar · title/caption · amount · chevron. */
export function NuListRow({ leading, title, caption, amount, amountColor, amountCaption, footer, muted, onClick, ariaLabel }: NuListRowProps) {
  return (
    <Flex
      as="button"
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      align="center"
      gap={3}
      w="full"
      minH="72px"
      py={3}
      textAlign="left"
      bg="transparent"
      borderBottom="1px solid var(--pb-hair)"
      opacity={muted ? 0.62 : 1}
      transition="background-color .15s ease, opacity .15s ease"
      _last={{ borderBottom: 0 }}
      _hover={{ bg: 'rgba(130,10,209,.025)', opacity: 1 }}
      _focusVisible={{ outline: 'none', boxShadow: 'inset 3px 0 0 var(--nu-brand, #820ad1)' }}
    >
      <Box flexShrink={0}>{leading}</Box>

      <Box minW={0} flex={1}>
        <Text fontSize="15px" fontWeight={650} color="var(--pb-ink)" noOfLines={1}>{title}</Text>
        {caption && <Text mt="2px" fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>{caption}</Text>}
        {footer}
      </Box>

      <Box flexShrink={0} textAlign="right">
        <Text fontSize="15px" fontWeight={650} color={amountColor ?? 'var(--pb-ink)'} noOfLines={1} sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {amount}
        </Text>
        {amountCaption && <Text mt="2px" fontSize="10px" color="var(--pb-ink-faint)">{amountCaption}</Text>}
      </Box>

      <Icon as={ChevronRight} boxSize="16px" color="var(--nu-brand, #820ad1)" flexShrink={0} />
    </Flex>
  )
}

/** Thin brand-coloured progress bar for list rows. */
export function NuProgress({ value, label }: { value: number; label?: string }) {
  return (
    <Box
      mt={2}
      h="4px"
      maxW="260px"
      borderRadius="full"
      bg="var(--nu-track)"
      overflow="hidden"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label={label}
    >
      <Box h="full" w={`${value}%`} borderRadius="full" bg="var(--nu-brand)" transition="width .4s ease" />
    </Box>
  )
}

/** Centered empty message on a soft tile. */
export function NuEmpty({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <Flex direction="column" align="center" textAlign="center" bg="var(--nu-surface)" borderRadius="16px" px={4} py={9}>
      <Flex w="44px" h="44px" align="center" justify="center" borderRadius="full" bg="var(--nu-brand-tint)" color="var(--nu-brand)" mb={3}>
        {icon}
      </Flex>
      <Text fontWeight={650} color="var(--pb-ink)">{title}</Text>
      <Text mt={1} fontSize="sm" color="var(--pb-ink-soft)" maxW="420px">{body}</Text>
    </Flex>
  )
}

/** Small count/total pill used in section headers. */
export function NuPill({ children }: { children: ReactNode }) {
  return (
    <Text
      flexShrink={0} px={3} py={1} borderRadius="full" bg="var(--nu-brand-tint)" color="var(--nu-brand)"
      fontSize="sm" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {children}
    </Text>
  )
}

/** Common subscription / payment brands → domain, matched as whole words in the row name. */
const KNOWN_BRANDS: Array<{ keys: string[]; domain: string }> = [
  { keys: ['paypal'], domain: 'paypal.com' },
  { keys: ['youtube'], domain: 'youtube.com' },
  { keys: ['netflix'], domain: 'netflix.com' },
  { keys: ['spotify'], domain: 'spotify.com' },
  { keys: ['disney'], domain: 'disneyplus.com' },
  { keys: ['prime video', 'amazon prime', 'amazon'], domain: 'amazon.co.uk' },
  { keys: ['apple', 'icloud'], domain: 'apple.com' },
  { keys: ['google'], domain: 'google.com' },
  { keys: ['microsoft', 'office 365', 'xbox'], domain: 'microsoft.com' },
  { keys: ['playstation', 'psn'], domain: 'playstation.com' },
  { keys: ['nintendo'], domain: 'nintendo.com' },
  { keys: ['adobe'], domain: 'adobe.com' },
  { keys: ['chatgpt', 'openai'], domain: 'openai.com' },
  { keys: ['claude', 'anthropic'], domain: 'anthropic.com' },
  { keys: ['github'], domain: 'github.com' },
  { keys: ['dropbox'], domain: 'dropbox.com' },
  { keys: ['canva'], domain: 'canva.com' },
  { keys: ['duolingo'], domain: 'duolingo.com' },
  { keys: ['uber'], domain: 'uber.com' },
  { keys: ['deliveroo'], domain: 'deliveroo.co.uk' },
  { keys: ['klarna'], domain: 'klarna.com' },
  { keys: ['clearpay'], domain: 'clearpay.co.uk' },
  { keys: ['now tv', 'nowtv'], domain: 'nowtv.com' },
  { keys: ['sky'], domain: 'sky.com' },
  { keys: ['bt'], domain: 'bt.com' },
  { keys: ['vodafone'], domain: 'vodafone.co.uk' },
  { keys: ['ee'], domain: 'ee.co.uk' },
  { keys: ['o2'], domain: 'o2.co.uk' },
  { keys: ['three'], domain: 'three.co.uk' },
  { keys: ['giffgaff'], domain: 'giffgaff.com' },
  { keys: ['virgin media'], domain: 'virginmedia.com' },
  { keys: ['puregym', 'pure gym'], domain: 'puregym.com' },
  { keys: ['gym group'], domain: 'thegymgroup.com' },
  { keys: ['tv licence', 'tv license'], domain: 'tvlicensing.co.uk' },
]

function brandDomain(name: string): string | null {
  const words = ` ${name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `
  let best: { len: number; domain: string } | null = null
  for (const brand of KNOWN_BRANDS) {
    for (const key of brand.keys) {
      if (words.includes(` ${key} `) && (!best || key.length > best.len)) best = { len: key.length, domain: brand.domain }
    }
  }
  return best?.domain ?? null
}

/** Brand favicon in a white circle; falls back to MerchantLogo if the image fails. */
function BrandLogo({ domain, name, category, size }: { domain: string; name: string; category?: string; size: number }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <MerchantLogo name={name} category={category} size={size} borderRadius="50%" />
  return (
    <Box
      aria-hidden="true"
      w={`${size}px`}
      h={`${size}px`}
      display="grid"
      placeItems="center"
      flexShrink={0}
      overflow="hidden"
      borderRadius="50%"
      bg="#ffffff"
      border="1px solid var(--pb-hair)"
      boxShadow="0 1px 2px rgba(0,0,0,0.08)"
    >
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
        alt=""
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        decoding="async"
        style={{ objectFit: 'contain', display: 'block' }}
        onError={() => setFailed(true)}
      />
    </Box>
  )
}

/**
 * Round logo for a commitment row. Bank/card products (e.g. "Monzo Max") show the
 * issuer's logo, known brands (PayPal, YouTube…) their favicon; everything else
 * falls back to MerchantLogo.
 */
export function CommitmentLogo({ name, category, size = 42 }: { name: string; category?: string; size?: number }) {
  if (getBankMeta(name)) return <BankLogo issuer={name} size={size} borderRadius="50%" />
  const domain = brandDomain(name)
  if (domain) return <BrandLogo key={domain} domain={domain} name={name} category={category} size={size} />
  return <MerchantLogo name={name} category={category} size={size} borderRadius="50%" />
}
