import { Box, Text } from '@chakra-ui/react'
import { useState } from 'react'

interface BankMeta {
  abbr: string
  bg: string
  text: string
  domain: string
}

const BANK_REGISTRY = [
  { keys: ['natwest'],          meta: { abbr: 'NW',   bg: '#42145F', text: '#fff', domain: 'natwest.com' } },
  { keys: ['monzo'],            meta: { abbr: 'MO',   bg: '#FF3464', text: '#fff', domain: 'monzo.com' } },
  { keys: ['revolut'],          meta: { abbr: 'RV',   bg: '#191C1F', text: '#fff', domain: 'revolut.com' } },
  { keys: ['hsbc'],             meta: { abbr: 'HSBC', bg: '#DB0011', text: '#fff', domain: 'hsbc.co.uk' } },
  { keys: ['lloyds'],           meta: { abbr: 'LB',   bg: '#006A4D', text: '#fff', domain: 'lloydsbank.com' } },
  { keys: ['metro'],            meta: { abbr: 'MB',   bg: '#CA0028', text: '#fff', domain: 'metrobankonline.co.uk' } },
  { keys: ['barclays'],         meta: { abbr: 'BC',   bg: '#00AEEF', text: '#fff', domain: 'barclays.co.uk' } },
  { keys: ['santander'],        meta: { abbr: 'SAN',  bg: '#EC0000', text: '#fff', domain: 'santander.co.uk' } },
  { keys: ['halifax'],          meta: { abbr: 'HX',   bg: '#004A8F', text: '#fff', domain: 'halifax.co.uk' } },
  { keys: ['tsb'],              meta: { abbr: 'TSB',  bg: '#1D65A6', text: '#fff', domain: 'tsb.co.uk' } },
  { keys: ['starling'],         meta: { abbr: 'SB',   bg: '#6935D3', text: '#fff', domain: 'starlingbank.com' } },
  { keys: ['chase'],            meta: { abbr: 'CH',   bg: '#117ACA', text: '#fff', domain: 'chase.co.uk' } },
  { keys: ['first direct'],     meta: { abbr: 'FD',   bg: '#1A1A1A', text: '#fff', domain: 'firstdirect.com' } },
  { keys: ['nationwide'],       meta: { abbr: 'NBS',  bg: '#0B1A6C', text: '#fff', domain: 'nationwide.co.uk' } },
  { keys: ['virgin'],           meta: { abbr: 'VM',   bg: '#C8102E', text: '#fff', domain: 'virginmoney.com' } },
  { keys: ['co-op', 'co op', 'cooperative'], meta: { abbr: 'CB', bg: '#00853E', text: '#fff', domain: 'co-operativebank.co.uk' } },
  { keys: ['american express'], meta: { abbr: 'AX',   bg: '#006FCF', text: '#fff', domain: 'americanexpress.com' } },
  { keys: ['amex'],             meta: { abbr: 'AX',   bg: '#006FCF', text: '#fff', domain: 'americanexpress.com' } },
  { keys: ['visa'],             meta: { abbr: 'VISA', bg: '#1A1F71', text: '#fff', domain: 'visa.com' } },
  { keys: ['mastercard'],       meta: { abbr: 'MC',   bg: '#EB001B', text: '#fff', domain: 'mastercard.com' } },
  { keys: ['tesco'],            meta: { abbr: 'TB',   bg: '#EE1C2E', text: '#fff', domain: 'tescobank.com' } },
  { keys: ['post office'],      meta: { abbr: 'PO',   bg: '#DA2128', text: '#fff', domain: 'postoffice.co.uk' } },
  { keys: ['bank of scotland'], meta: { abbr: 'BOS',  bg: '#006747', text: '#fff', domain: 'bankofscotland.co.uk' } },
  { keys: ['royal bank', 'rbs'],meta: { abbr: 'RBS',  bg: '#002060', text: '#fff', domain: 'rbs.co.uk' } },
  { keys: ['clydesdale'],       meta: { abbr: 'CB',   bg: '#003087', text: '#fff', domain: 'virginmoney.com' } },
  { keys: ['vanquis'],          meta: { abbr: 'VQ',   bg: '#4B0082', text: '#fff', domain: 'vanquis.co.uk' } },
]

export function getBankMeta(issuer?: string | null): BankMeta | null {
  if (!issuer?.trim()) return null
  const lower = issuer.toLowerCase().trim()
  let best: { keyLen: number; meta: BankMeta } | null = null
  for (const entry of BANK_REGISTRY) {
    for (const key of entry.keys) {
      if (lower.includes(key) && (!best || key.length > best.keyLen)) {
        best = { keyLen: key.length, meta: entry.meta }
      }
    }
  }
  return best?.meta ?? null
}

export const UK_BANKS = [
  'NatWest', 'Monzo', 'Revolut', 'HSBC', 'Lloyds', 'Metro Bank',
  'Barclays', 'Santander', 'Halifax', 'TSB', 'Starling Bank',
  'Chase', 'First Direct', 'Nationwide', 'Virgin Money', 'Co-op Bank',
  'American Express', 'Visa', 'Mastercard', 'Tesco Bank', 'Post Office',
  'Bank of Scotland', 'Royal Bank of Scotland', 'Clydesdale Bank', 'Vanquis',
]

interface BankLogoProps {
  issuer?: string | null
  size?: number
  borderRadius?: string
}

export default function BankLogo({ issuer, size = 32, borderRadius = '10px' }: BankLogoProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const meta = getBankMeta(issuer)
  if (!meta) return null

  const { abbr, bg, text, domain } = meta
  const abbSize = abbr.length >= 4 ? '7px' : abbr.length === 3 ? '8.5px' : '10px'

  // Google's favicon cache — free, no API key, always 200 (returns generic icon if unknown).
  // sz=128 is the largest size Google serves reliably.
  const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`

  return (
    <Box
      w={`${size}px`}
      h={`${size}px`}
      borderRadius={borderRadius}
      bg={bg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      overflow="hidden"
      userSelect="none"
    >
      {!imgFailed ? (
        <img
          src={logoUrl}
          alt={issuer ?? ''}
          width={size}
          height={size}
          style={{ objectFit: 'contain', display: 'block' }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <Text
          as="span"
          style={{ fontSize: abbSize, lineHeight: 1 }}
          fontWeight={800}
          color={text}
          letterSpacing="-0.03em"
        >
          {abbr}
        </Text>
      )}
    </Box>
  )
}
