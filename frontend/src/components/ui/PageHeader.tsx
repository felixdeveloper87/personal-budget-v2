import type { ReactNode } from 'react'
import {
  Box,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useEd } from '../../editorial'
import type { LucideIcon } from './icons'

export interface PageHeaderProps {
  icon: LucideIcon
  title: string
  subtitle: string
  rightSlot?: ReactNode
}

export default function PageHeader({
  icon,
  title,
  subtitle,
  rightSlot,
}: PageHeaderProps) {
  const ed = useEd()
  const titleColorBase = useColorModeValue('gray.900', 'gray.50')
  const titleColor = ed ? ed.cream : titleColorBase
  const subtitleColorBase = useColorModeValue('gray.500', 'gray.400')
  const subtitleColor = ed ? ed.muted : subtitleColorBase

  // The icon now lives on a brand-gradient glass tile that glows softly.
  const iconGradientBase = useColorModeValue(
    'linear-gradient(135deg, #2563eb 0%, #6d28d9 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  )
  const iconGradient = ed
    ? `linear-gradient(135deg, ${ed.jade} 0%, ${ed.gold} 100%)`
    : iconGradientBase
  const iconColorBase = 'white'
  const iconColor = ed ? ed.onAccent : iconColorBase
  const iconGlowBase = useColorModeValue(
    '0 12px 26px -10px rgba(37, 99, 235, 0.55), inset 0 1px 0 rgba(255,255,255,0.55)',
    '0 14px 30px -12px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255,255,255,0.16)',
  )
  const iconGlow = ed
    ? `0 14px 30px -12px ${ed.jade}, inset 0 1px 0 rgba(255,255,255,0.36)`
    : iconGlowBase
  const iconHoverGlowBase = useColorModeValue(
    '0 16px 32px -8px rgba(37, 99, 235, 0.65), inset 0 1px 0 rgba(255,255,255,0.6)',
    '0 18px 38px -10px rgba(59, 130, 246, 0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
  )
  const iconHoverGlow = ed
    ? `0 18px 38px -10px ${ed.gold}, inset 0 1px 0 rgba(255,255,255,0.4)`
    : iconHoverGlowBase
  const iconBorderBase = useColorModeValue('rgba(255,255,255,0.5)', 'whiteAlpha.200')
  const iconBorder = ed ? 'rgba(255,255,255,0.18)' : iconBorderBase

  // A faint radial halo sitting behind the icon adds depth without a hard edge.
  const haloBase = useColorModeValue(
    'radial-gradient(circle, rgba(91, 33, 182, 0.22) 0%, rgba(91, 33, 182, 0) 70%)',
    'radial-gradient(circle, rgba(139, 92, 246, 0.28) 0%, rgba(139, 92, 246, 0) 70%)',
  )
  const halo = ed
    ? `radial-gradient(circle, ${ed.jadeSoftHover} 0%, transparent 70%)`
    : haloBase

  // Masthead accent rule beneath the header — echoes the global header border.
  const accentRuleBase = useColorModeValue(
    'linear-gradient(90deg, transparent 0%, rgba(37, 99, 235, 0.55) 28%, rgba(124, 58, 237, 0.55) 72%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, rgba(96, 165, 250, 0.6) 28%, rgba(167, 139, 250, 0.6) 72%, transparent 100%)',
  )
  const accentRule = ed
    ? `linear-gradient(90deg, transparent 0%, ${ed.jade} 30%, ${ed.gold} 70%, transparent 100%)`
    : accentRuleBase

  return (
    <Box role="group" w="full" minW={0}>
      <Flex
        w="full"
        minW={0}
        align={{ base: 'stretch', sm: 'center' }}
        justify="space-between"
        direction={{ base: 'column', sm: 'row' }}
        gap={3}
        px={{ base: 1, sm: 2 }}
      >
        <HStack spacing={{ base: 3, md: 4 }} minW={0} align="center">
          <Box position="relative" flexShrink={0}>
            {/* Soft radial halo bleeding out behind the tile */}
            <Box
              aria-hidden
              position="absolute"
              inset="-40%"
              background={halo}
              filter="blur(6px)"
              opacity={0.9}
              pointerEvents="none"
              transition="opacity 0.4s ease"
              _groupHover={{ opacity: 1 }}
            />
            <Box
              position="relative"
              w={{ base: 11, md: 12 }}
              h={{ base: 11, md: 12 }}
              borderRadius="2xl"
              background={iconGradient}
              color={iconColor}
              border="1px solid"
              borderColor={iconBorder}
              boxShadow={iconGlow}
              display="flex"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
              transition="transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.35s ease"
              _groupHover={{
                transform: 'translateY(-2px) rotate(-3deg) scale(1.04)',
                boxShadow: iconHoverGlow,
              }}
              sx={{
                // Glossy top highlight for the glass-tile feel.
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 58%)',
                  pointerEvents: 'none',
                },
              }}
            >
              <Icon as={icon} boxSize={{ base: 5, md: 6 }} weight="duotone" position="relative" zIndex={1} />
            </Box>
          </Box>

          <VStack align="flex-start" spacing={0.5} minW={0}>
            <Text
              as="h1"
              textStyle={ed ? 'display' : undefined}
              fontSize={ed ? { base: '3xl', md: '4xl' } : { base: 'xl', md: '2xl' }}
              fontWeight={ed ? 400 : 800}
              color={titleColor}
              letterSpacing="-0.025em"
              lineHeight={ed ? '1.0' : '1.1'}
              noOfLines={{ base: 2, md: 1 }}
            >
              {title}
            </Text>
            <Text
              fontSize={{ base: 'xs', md: 'sm' }}
              color={subtitleColor}
              fontWeight={500}
              lineHeight="1.35"
              noOfLines={{ base: 2, md: 1 }}
            >
              {subtitle}
            </Text>
          </VStack>
        </HStack>

        {rightSlot ? (
          <Box
            flexShrink={0}
            alignSelf={{ base: 'stretch', sm: 'center' }}
            pl={{ base: 14, sm: 0 }}
          >
            {rightSlot}
          </Box>
        ) : null}
      </Flex>

      {/* Drifting masthead accent rule */}
      <Box
        aria-hidden
        mt={{ base: 3, md: 4 }}
        mx={{ base: 1, sm: 2 }}
        h="2px"
        borderRadius="full"
        background={accentRule}
        backgroundSize="200% 100%"
        backgroundPosition="50% 0"
        opacity={0.75}
        transition="opacity 0.3s ease"
        pointerEvents="none"
        _groupHover={{ opacity: 1 }}
        sx={{
          '@media (prefers-reduced-motion: no-preference)': {
            animation: 'pageHeaderRuleShimmer 9s ease-in-out infinite',
          },
          '@keyframes pageHeaderRuleShimmer': {
            '0%, 100%': { backgroundPosition: '0% 0' },
            '50%': { backgroundPosition: '100% 0' },
          },
        }}
      />
    </Box>
  )
}
