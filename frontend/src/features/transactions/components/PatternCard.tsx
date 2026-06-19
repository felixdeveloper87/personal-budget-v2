import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import type { LucideIcon } from '../../../components/ui/icons'

export interface PatternCardProps {
  icon: LucideIcon
  tileBg: string
  tileColor: string
  tag: string
  title: string
  value: string
  hint: string
  active: boolean
  onToggle: () => void
}

export default function PatternCard({
  icon,
  tileBg,
  tileColor,
  tag,
  title,
  value,
  hint,
  active,
  onToggle,
}: PatternCardProps) {
  return (
    <Box
      as="button"
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      textAlign="left"
      w="full"
      bg="var(--pb-surface)"
      border="1px solid"
      borderColor={active ? 'rgba(29,90,135,.4)' : 'var(--pb-hair)'}
      borderRadius="18px"
      p="1rem"
      boxShadow={active ? '0 0 0 1px rgba(29,90,135,.25), var(--pb-shadow)' : 'var(--pb-shadow)'}
      transition="transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
      cursor="pointer"
      sx={{ '&:hover .pb-hint': { opacity: 1 } }}
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'var(--pb-shadow-lift)' }}
      _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
    >
      <HStack spacing=".7rem" align="flex-start">
        <Box
          w="34px"
          h="34px"
          borderRadius="10px"
          display="grid"
          placeItems="center"
          bg={tileBg}
          color={tileColor}
          flexShrink={0}
        >
          <Icon as={icon} boxSize="17px" />
        </Box>
        <VStack align="stretch" spacing="0.3rem" minW={0}>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="9.5px"
            letterSpacing="0.18em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            {tag}
          </Text>
          <Text fontFamily="var(--pb-serif)" fontSize="1rem" fontWeight={500} color="var(--pb-ink)" lineHeight="1.25">
            {title}
          </Text>
        </VStack>
      </HStack>

      <Text
        mt=".6rem"
        fontFamily="var(--pb-mono)"
        fontSize="11px"
        color="var(--pb-ink-soft)"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Text>

      <Text
        className="pb-hint"
        mt=".55rem"
        fontFamily="var(--pb-mono)"
        fontSize="9.5px"
        letterSpacing="0.06em"
        textTransform="uppercase"
        color="var(--pb-forest-2)"
        opacity={active ? 1 : 0}
        transition="opacity 0.2s ease"
      >
        {hint}
      </Text>
    </Box>
  )
}
