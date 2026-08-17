import { Box, HStack, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { useEd } from '../../../editorial'
import { useI18n } from '../../../i18n'
import BrandMark from '../../brand/BrandMark'
import { BRAND } from './brand.config'

interface LogoProps {
  user?: any
  onClick?: () => void
}

// Opção 1: Gráfico ondulado ascendente com micro-animação de desenho (Não deletado)
function LogoIconWavy() {
  const primaryColor = useColorModeValue('#2563eb', '#3b82f6')
  const secondaryColor = useColorModeValue('#7c3aed', '#8b5cf6')
  const accentColor = useColorModeValue('#db2777', '#ec4899')

  return (
    <Box
      as="svg"
      w={{ base: 7, md: 8 }}
      h={{ base: 7, md: 8 }}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      position="relative"
      zIndex={1}
      transition="transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      _groupHover={{ transform: 'scale(1.1) rotate(10deg)' }}
    >
      {/* Modern wavy line chart representing personal budget flow */}
      <path
        d="M6 24C6 24 10 15 14 15C18 15 19 21 23 17C27 13 26 8 26 8"
        stroke="url(#logoGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="40"
        strokeDashoffset="40"
        style={{
          animation: 'drawLogoLine 1.5s ease-out forwards',
        }}
      />
      {/* Node points / Data highlights */}
      <circle
        cx="14"
        cy="15"
        r="2"
        fill={primaryColor}
        style={{ transformOrigin: '14px 15px', animation: 'popLogoCircle 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.6s both' }}
      />
      <circle
        cx="23"
        cy="17"
        r="2"
        fill={secondaryColor}
        style={{ transformOrigin: '23px 17px', animation: 'popLogoCircle 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.9s both' }}
      />
      <circle
        cx="26"
        cy="8"
        r="3"
        fill={accentColor}
        style={{ transformOrigin: '26px 8px', animation: 'popLogoCircle 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.2s both' }}
      />

      <defs>
        <linearGradient id="logoGrad" x1="6" y1="24" x2="26" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor={primaryColor} />
          <stop offset="0.5" stopColor={secondaryColor} />
          <stop offset="1" stopColor={accentColor} />
        </linearGradient>
      </defs>

      <style>{`
        @keyframes drawLogoLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes popLogoCircle {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </Box>
  )
}

// Opção 2: Diamantes Geométricos Tridimensionais sobrepostos (Ativo por padrão)
function LogoIconGeometric() {
  const primaryColor = useColorModeValue('#2563eb', '#3b82f6')
  const secondaryColor = useColorModeValue('#7c3aed', '#8b5cf6')
  const accentColor = useColorModeValue('#db2777', '#ec4899')

  return (
    <Box
      as="svg"
      w={{ base: 7, md: 8 }}
      h={{ base: 7, md: 8 }}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      position="relative"
      zIndex={1}
      transition="transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      _groupHover={{ transform: 'scale(1.1) rotate(-8deg)' }}
    >
      {/* Back Diamond Fold - Gradient */}
      <path
        d="M16 4L26 14L16 24L6 14L16 4Z"
        fill="url(#logo2Grad1)"
        style={{
          transformOrigin: '16px 14px',
          animation: 'diamondFloat 3s ease-in-out infinite',
        }}
      />
      {/* Front Glassmorphic Fold */}
      <path
        d="M16 10L26 20L16 30L6 20L16 10Z"
        fill={useColorModeValue('rgba(255, 255, 255, 0.65)', 'rgba(15, 23, 42, 0.55)')}
        stroke="url(#logo2Grad2)"
        strokeWidth="1.5"
        style={{
          transformOrigin: '16px 20px',
          animation: 'diamondFloat 3s ease-in-out infinite alternate',
          animationDelay: '1.5s',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      />
      {/* Tiny glowing core representing money flow */}
      <circle
        cx="16"
        cy="17"
        r="2.5"
        fill={accentColor}
        style={{
          transformOrigin: '16px 17px',
          animation: 'pulseCore 2s ease-in-out infinite',
        }}
      />

      <defs>
        <linearGradient id="logo2Grad1" x1="6" y1="4" x2="26" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor={primaryColor} />
          <stop offset="1" stopColor={secondaryColor} />
        </linearGradient>
        <linearGradient id="logo2Grad2" x1="6" y1="10" x2="26" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.8" />
          <stop offset="1" stopColor="white" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <style>{`
        @keyframes diamondFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        @keyframes pulseCore {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </Box>
  )
}

// Opção 3: Carteira com moeda entrando (Estilo Financeiro / Ativo agora)
export function LogoIconWallet({ boxSize }: { boxSize?: number } = {}) {
  const primaryColor = useColorModeValue('#2563eb', '#7dd3fc')
  const secondaryColor = useColorModeValue('#3b82f6', '#a5b4fc')
  const accentColor = useColorModeValue('#c18b35', '#e8c477')

  return (
    <Box
      as="svg"
      w={boxSize ?? { base: 7, md: 8 }}
      h={boxSize ?? { base: 7, md: 8 }}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      position="relative"
      zIndex={1}
      transition="transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      _groupHover={{ transform: 'scale(1.1) rotate(5deg)' }}
    >
      {/* Coin / Money representation sliding down into the wallet */}
      <circle
        cx="16"
        cy="9"
        r="4.5"
        fill="url(#coinGrad)"
        style={{
          transformOrigin: '16px 9px',
          animation: 'coinSlide 2.5s ease-in-out infinite',
        }}
      />
      {/* Coin detail (inner dollar/growth sign) */}
      <path
        d="M16 7.5V10.5M14.5 8.5H17.5M14.5 9.5H17.5"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.8"
        style={{
          transformOrigin: '16px 9px',
          animation: 'coinSlide 2.5s ease-in-out infinite',
        }}
      />

      {/* Main Wallet Back Body */}
      <path
        d="M6 13C6 11.8954 6.89543 11 8 11H24C25.1046 11 26 11.8954 26 13V23C26 24.1046 25.1046 25 24 25H8C6.89543 25 6 24.1046 6 23V13Z"
        fill="url(#walletBodyGrad)"
      />

      {/* Wallet Front Flap (Glassmorphic) */}
      <path
        d="M6 16C6 14.8954 6.89543 14 8 14H24C25.1046 14 26 14.8954 26 16V23C26 24.1046 25.1046 25 24 25H8C6.89543 25 6 24.1046 6 23V16Z"
        fill={useColorModeValue('rgba(255, 255, 255, 0.65)', 'rgba(15, 23, 42, 0.55)')}
        stroke="url(#walletFlapBorder)"
        strokeWidth="1.5"
        style={{
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      />

      {/* Wallet Clasp / Lock (Gradient) */}
      <rect
        x="22"
        y="17"
        width="5"
        height="4"
        rx="1.5"
        fill={accentColor}
        style={{
          transformOrigin: '24.5px 19px',
          animation: 'claspJiggle 2.5s ease-in-out infinite',
        }}
      />

      <defs>
        <linearGradient id="coinGrad" x1="11.5" y1="4.5" x2="20.5" y2="13.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="walletBodyGrad" x1="6" y1="11" x2="26" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor={primaryColor} />
          <stop offset="1" stopColor={secondaryColor} />
        </linearGradient>
        <linearGradient id="walletFlapBorder" x1="6" y1="14" x2="26" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.8" />
          <stop offset="1" stopColor="white" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <style>{`
        @keyframes coinSlide {
          0% { transform: translateY(-5px); opacity: 0; }
          30% { transform: translateY(0px); opacity: 1; }
          70% { transform: translateY(4px); opacity: 1; }
          100% { transform: translateY(9px); opacity: 0; }
        }
        @keyframes claspJiggle {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
        }
      `}</style>
    </Box>
  )
}

export default function Logo({ user, onClick }: LogoProps) {
  const ed = useEd()
  const { t } = useI18n()
  const wordMutedBase = useColorModeValue('gray.700', 'gray.300')
  const wordMuted = ed ? ed.cream : wordMutedBase
  const wordBudgetGradientBase = useColorModeValue(
    'linear(to-r, #237a55, #1e5a41)',
    'linear(to-r, #7fe6b3, #e8c477)',
  )
  const wordBudgetGradient = ed
    ? `linear(to-r, ${ed.jade}, ${ed.gold})`
    : wordBudgetGradientBase
  const subtitleColorBase = useColorModeValue('gray.500', 'gray.500')
  const subtitleColor = ed ? ed.muted : subtitleColorBase

  const handleClick = () => {
    if (onClick) return onClick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const titleFontSize = { base: 'sm', sm: 'md', md: 'lg', lg: 'xl' } as const
  const edTitleFontSize = { base: 'md', sm: 'lg', md: 'xl', lg: '2xl' } as const
  return (
    <HStack
      as="button"
      type="button"
      aria-label={t('header.logo.goToTop')}
      onClick={handleClick}
      spacing={{ base: 2, md: 2.5 }}
      role="group"
      cursor="pointer"
      minW={0}
      flexShrink={1}
      transition="transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)"
      _hover={{ transform: 'translateY(-1px)' }}
      _active={{ transform: 'translateY(0)' }}
      _focusVisible={{ outline: 'none' }}
    >
      <Box
        flexShrink={0}
        w={{ base: 10, md: 11 }}
        h={{ base: 10, md: 11 }}
        transition="transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)"
        _groupHover={{
          transform: 'translateY(-1px) rotate(-2deg)',
        }}
      >
        <BrandMark
          size="100%"
          style={{ filter: 'drop-shadow(0 7px 12px rgba(0, 0, 0, 0.22))' }}
        />
      </Box>

      <VStack
        display={{ base: 'none', md: 'flex' }}
        align="flex-start"
        spacing={0}
        minW={0}
        flex={1}
        overflow="hidden"
        lineHeight="1.1"
      >
        <HStack
          align="baseline"
          spacing={1}
          minW={0}
          w="100%"
          flexWrap="nowrap"
        >
          <Text
            as="span"
            textStyle={ed ? 'display' : undefined}
            fontSize={ed ? edTitleFontSize : titleFontSize}
            fontWeight={ed ? 400 : 600}
            letterSpacing="-0.02em"
            color={wordMuted}
            noOfLines={1}
            minW={0}
            flexShrink={1}
          >
            {BRAND.nameFirst}
          </Text>

          <Text
            as="span"
            textStyle={ed ? 'display' : undefined}
            fontStyle={ed ? 'italic' : undefined}
            fontSize={ed ? edTitleFontSize : titleFontSize}
            fontWeight={ed ? 400 : 800}
            letterSpacing="-0.03em"
            bgGradient={wordBudgetGradient}
            bgClip="text"
            noOfLines={1}
            minW={0}
            flexShrink={1}
          >
            {BRAND.nameSecond}
          </Text>

        </HStack>

        <Text
          fontSize="2xs"
          fontWeight={500}
          color={subtitleColor}
          letterSpacing="0.04em"
          lineHeight="1.2"
          mt={0.5}
          noOfLines={2}
          display={{ base: 'none', lg: 'block' }}
          _dark={{ color: 'gray.500' }}
        >
          {t('brand.tagline')}
        </Text>
      </VStack>
    </HStack>
  )
}
