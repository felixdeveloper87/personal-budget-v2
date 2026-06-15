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
  const iconBgBase = useColorModeValue('gray.100', 'whiteAlpha.100')
  const iconBg = ed ? ed.jadeSoft : iconBgBase
  const iconColorBase = useColorModeValue('gray.700', 'gray.200')
  const iconColor = ed ? ed.jade : iconColorBase
  const iconBorderBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const iconBorder = ed ? ed.line : iconBorderBase

  return (
    <Flex
      w="full"
      minW={0}
      align={{ base: 'stretch', sm: 'center' }}
      justify="space-between"
      direction={{ base: 'column', sm: 'row' }}
      gap={3}
      px={{ base: 1, sm: 2 }}
    >
      <HStack spacing={3} minW={0} align="center">
        <Box
          w={{ base: 9, md: 10 }}
          h={{ base: 9, md: 10 }}
          borderRadius="xl"
          bg={iconBg}
          color={iconColor}
          border="1px solid"
          borderColor={iconBorder}
          boxShadow={ed ? `inset 0 1px 0 rgba(255,255,255,0.36), 0 8px 20px -14px ${ed.jade}` : undefined}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={5} weight="duotone" />
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
          pl={{ base: 12, sm: 0 }}
        >
          {rightSlot}
        </Box>
      ) : null}
    </Flex>
  )
}
