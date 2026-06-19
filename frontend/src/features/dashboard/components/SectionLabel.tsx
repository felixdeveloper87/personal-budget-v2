import { Flex, Box, Text } from '@chakra-ui/react'

/** Mono eyebrow + hairline rule that chapters the dashboard's long scroll. */
export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Flex align="center" gap="0.9rem" aria-hidden="true">
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="10px"
        letterSpacing="0.2em"
        textTransform="uppercase"
        color="var(--pb-ink-faint)"
        whiteSpace="nowrap"
        flexShrink={0}
      >
        {children}
      </Text>
      <Box flex={1} h="1px" bg="var(--pb-hair)" />
    </Flex>
  )
}
