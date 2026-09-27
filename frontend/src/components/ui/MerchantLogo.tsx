import { Box, Text } from '@chakra-ui/react'
import { CarFront, Fuel, ShoppingBag, ShoppingCart, Utensils } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface MerchantDomainEntry {
  keys: readonly string[]
  domain: string
}

const MERCHANT_DOMAINS: readonly MerchantDomainEntry[] = [
  { keys: ['costco'], domain: 'costco.co.uk' },
  { keys: ['lidl'], domain: 'lidl.co.uk' },
  { keys: ['sainsbury'], domain: 'sainsburys.co.uk' },
  { keys: ['morrisons'], domain: 'morrisons.com' },
  { keys: ['waitrose'], domain: 'waitrose.com' },
  { keys: ['iceland'], domain: 'iceland.co.uk' },
  { keys: ['tesco'], domain: 'tesco.com' },
  { keys: ['aldi'], domain: 'aldi.co.uk' },
  { keys: ['asda'], domain: 'asda.com' },
  { keys: ['co-op', 'co op', 'coop'], domain: 'coop.co.uk' },
  { keys: ['amazon'], domain: 'amazon.co.uk' },
  { keys: ['uber eats'], domain: 'ubereats.com' },
  { keys: ['deliveroo'], domain: 'deliveroo.co.uk' },
  { keys: ['just eat'], domain: 'just-eat.co.uk' },
  { keys: ['uber'], domain: 'uber.com' },
  { keys: ['bolt'], domain: 'bolt.eu' },
  { keys: ["mcdonald's", 'mcdonalds'], domain: 'mcdonalds.com' },
  { keys: ["nando's", 'nandos'], domain: 'nandos.co.uk' },
  { keys: ['burger king'], domain: 'burgerking.co.uk' },
  { keys: ['costa coffee', 'costa'], domain: 'costa.co.uk' },
  { keys: ["domino's", 'dominos'], domain: 'dominos.co.uk' },
  { keys: ['greggs'], domain: 'greggs.co.uk' },
  { keys: ['subway'], domain: 'subway.com' },
  { keys: ['kfc'], domain: 'kfc.co.uk' },
  { keys: ['boots'], domain: 'boots.com' },
  { keys: ['superdrug'], domain: 'superdrug.com' },
  { keys: ['primark'], domain: 'primark.com' },
  { keys: ['river island'], domain: 'riverisland.com' },
  { keys: ['new look'], domain: 'newlook.com' },
  { keys: ['zara'], domain: 'zara.com' },
  { keys: ['h&m'], domain: 'hm.com' },
  { keys: ['asos'], domain: 'asos.com' },
  { keys: ['spotify'], domain: 'spotify.com' },
  { keys: ['netflix'], domain: 'netflix.com' },
  { keys: ['youtube'], domain: 'youtube.com' },
  { keys: ['chatgpt', 'openai'], domain: 'openai.com' },
  { keys: ['claude'], domain: 'claude.ai' },
  { keys: ['disney+'], domain: 'disneyplus.com' },
  { keys: ['playstation'], domain: 'playstation.com' },
  { keys: ['xbox'], domain: 'xbox.com' },
  { keys: ['airbnb'], domain: 'airbnb.co.uk' },
  { keys: ['booking.com', 'booking'], domain: 'booking.com' },
  { keys: ['trainline'], domain: 'thetrainline.com' },
  { keys: ['tfl'], domain: 'tfl.gov.uk' },
  { keys: ['vinted'], domain: 'vinted.co.uk' },
  { keys: ['ebay'], domain: 'ebay.co.uk' },
  { keys: ['etsy'], domain: 'etsy.com' },
  { keys: ['royal mail', 'royalmail'], domain: 'royalmail.com' },
]

const LOGO_DEV_TOKEN = import.meta.env.VITE_LOGO_DEV_TOKEN as string | undefined

function normaliseMerchantName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function getMerchantLogoDomain(name: string): string | null {
  const normalised = normaliseMerchantName(name)
  let match: { length: number; domain: string } | null = null

  for (const entry of MERCHANT_DOMAINS) {
    for (const key of entry.keys) {
      if (normalised.includes(key) && (!match || key.length > match.length)) {
        match = { length: key.length, domain: entry.domain }
      }
    }
  }

  return match?.domain ?? null
}

function merchantInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '—'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

interface MerchantLogoProps {
  category?: string
  name: string
  size?: number
  borderRadius?: string
}

function getFallback(name: string, category?: string) {
  const normalise = (value: string) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
  const merchant = normalise(name)
  const group = normalise(category ?? '')
  if (['fuel', 'petrol', 'gas', 'combustivel'].some((word) => group.includes(word))
    || ['petrol', 'fuel', 'gas station', 'shell', 'esso', 'texaco'].some((word) => merchant.includes(word))
    || /\bbp\b/.test(merchant)) {
    return { Icon: Fuel, background: '#f1dea5', color: '#6f5012' }
  }
  if (['dining', 'restaurant', 'food', 'restaurante'].some((word) => group.includes(word))
    || ['restaurant', 'restaurante', 'cafe', 'bistro', 'grill'].some((word) => merchant.includes(word))) {
    return { Icon: Utensils, background: '#f2e0d4', color: '#a65f40' }
  }
  if (['groceries', 'grocery', 'supermarket', 'supermercado'].some((word) => group.includes(word))) {
    return { Icon: ShoppingCart, background: '#d9ece2', color: '#2d8062' }
  }
  if (['transport', 'transporte', 'travel'].some((word) => group.includes(word))) {
    return { Icon: CarFront, background: '#d9e9ea', color: '#397780' }
  }
  if (['shopping', 'compras', 'retail'].some((word) => group.includes(word))) {
    return { Icon: ShoppingBag, background: '#e7dfe9', color: '#705e78' }
  }
  return null
}

export default function MerchantLogo({ name, category, size = 36, borderRadius = '10px' }: MerchantLogoProps) {
  const [failed, setFailed] = useState(false)
  const domain = useMemo(() => getMerchantLogoDomain(name), [name])
  const fallback = useMemo(() => getFallback(name, category), [name, category])
  const FallbackIcon = fallback?.Icon
  const logoUrl = domain && LOGO_DEV_TOKEN
    ? `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=${Math.max(64, size * 2)}&format=png`
    : null

  useEffect(() => setFailed(false), [logoUrl])

  return (
    <Box
      aria-hidden="true"
      w={`${size}px`}
      h={`${size}px`}
      display="grid"
      placeItems="center"
      flexShrink={0}
      overflow="hidden"
      borderRadius={borderRadius}
      bg={logoUrl && !failed ? '#ffffff' : fallback?.background ?? 'var(--pb-surface-2)'}
      border="1px solid var(--pb-hair)"
      boxShadow="0 1px 2px rgba(0,0,0,0.08)"
      userSelect="none"
    >
      {logoUrl && !failed ? (
        <img
          src={logoUrl}
          alt=""
          width={size}
          height={size}
          decoding="async"
          style={{ objectFit: 'contain', display: 'block', padding: '3px' }}
          onError={() => setFailed(true)}
        />
      ) : fallback && FallbackIcon ? (
        <FallbackIcon size={Math.round(size * 0.62)} strokeWidth={2.3} color={fallback.color} />
      ) : (
        <Text
          as="span"
          fontFamily="var(--pb-mono)"
          fontSize={size <= 28 ? '8px' : `${Math.max(9, Math.round(size * 0.22))}px`}
          fontWeight={600}
          lineHeight={1}
          letterSpacing="0.02em"
          color="var(--pb-forest-2)"
        >
          {merchantInitials(name)}
        </Text>
      )}
    </Box>
  )
}
