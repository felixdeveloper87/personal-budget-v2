import type { ReactNode } from 'react'
import {
  Box,
  Flex,
  Text,
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
  subtitle,
  rightSlot,
}: PageHeaderProps) {
  const ed = useEd()
  const subtitleColorBase = useColorModeValue('gray.500', 'gray.400')
  const subtitleColor = ed ? ed.muted : subtitleColorBase

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
        <Text
          fontSize={{ base: 'sm', md: 'lg' }}
          color={subtitleColor}
          fontWeight={500}
          lineHeight="1.35"
          noOfLines={{ base: 2, md: 1 }}
        >
          {subtitle}
        </Text>

        {rightSlot ? (
          <Box flexShrink={0} alignSelf={{ base: 'stretch', sm: 'center' }}>
            {rightSlot}
          </Box>
        ) : null}
      </Flex>

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
