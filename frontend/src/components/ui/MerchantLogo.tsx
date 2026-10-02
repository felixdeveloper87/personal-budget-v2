import { Box, Text } from '@chakra-ui/react'
import { CarFront, Fuel, ShoppingBag, ShoppingCart, Utensils } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const LOGO_DEV_TOKEN = import.meta.env.VITE_LOGO_DEV_TOKEN as string | undefined

function merchantInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '—'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

interface MerchantLogoProps {
  category?: string
  domain?: string | null
  name: string
  size?: number
  borderRadius?: string
  fallbackMode?: 'default' | 'none'
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

export default function MerchantLogo({ name, category, domain, size = 36, borderRadius = '10px', fallbackMode = 'default' }: MerchantLogoProps) {
  const [failed, setFailed] = useState(false)
  const fallback = useMemo(() => getFallback(name, category), [name, category])
  const FallbackIcon = fallback?.Icon
  const logoUrl = domain && LOGO_DEV_TOKEN
    ? `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=${Math.max(64, size * 2)}&format=png&fallback=404`
    : null

  useEffect(() => setFailed(false), [logoUrl])

  if (fallbackMode === 'none' && (!logoUrl || failed)) return null

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
