import { Box, Flex, HStack, Text, VStack, Button } from '@chakra-ui/react'
import { useMemo } from 'react'
import { guilloche } from './guilloche'

export default function PaperFooter() {
  const rosette = useMemo(() => guilloche(118, 31, 80), [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <Box
      as="footer"
      bg="var(--pb-paper-2)"
      borderTop="1px solid var(--pb-hair)"
      borderRadius="22px"
      overflow="hidden"
      position="relative"
      mt={4}
    >
      {/* Decorative rosette background */}
      <Box
        position="absolute"
        inset={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        pointerEvents="none"
        aria-hidden="true"
      >
        <svg width="480" height="480" viewBox="-240 -240 480 480" opacity={0.05}>
          <path d={rosette} fill="none" stroke="var(--pb-ink)" strokeWidth="0.8" />
        </svg>
      </Box>

      {/* Content */}
      <VStack
        align="center"
        spacing={4}
        py={12}
        px="clamp(1.5rem, 4vw, 3rem)"
        position="relative"
        zIndex={1}
      >
        {/* Wordmark */}
        <Text
          fontFamily="var(--pb-serif)"
          fontSize="clamp(2rem, 6vw, 3.8rem)"
          fontWeight={300}
          color="var(--pb-ink)"
          letterSpacing="-0.01em"
          textAlign="center"
          opacity={0.85}
          lineHeight={1}
        >
          Personal Budget
        </Text>

        <Text
          fontFamily="var(--pb-serif)"
          fontSize="md"
          fontStyle="italic"
          color="var(--pb-ink-soft)"
          textAlign="center"
        >
          Clarity for your money.
        </Text>

        <Text
          fontFamily="var(--pb-mono)"
          fontSize="10px"
          letterSpacing="0.22em"
          textTransform="uppercase"
          color="var(--pb-ink-faint)"
          textAlign="center"
        >
          No ads · No trackers · No card on file
        </Text>

        {/* Bottom row */}
        <Flex
          w="full"
          justify="space-between"
          align="center"
          borderTop="1px solid var(--pb-hair)"
          pt={4}
          mt={2}
          flexWrap="wrap"
          gap={2}
        >
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10px"
            letterSpacing="0.12em"
            color="var(--pb-ink-faint)"
          >
            © {new Date().getFullYear()} Personal Budget
          </Text>

          <Button
            size="xs"
            h="26px"
            px={3}
            borderRadius="999px"
            fontFamily="var(--pb-mono)"
            fontSize="10px"
            fontWeight={500}
            letterSpacing="0.1em"
            textTransform="uppercase"
            bg="transparent"
            color="var(--pb-ink-faint)"
            border="1px solid var(--pb-hair)"
            _hover={{ bg: 'var(--pb-surface)', color: 'var(--pb-ink)' }}
            onClick={scrollToTop}
          >
            ↑ Back to top
          </Button>
        </Flex>
      </VStack>
    </Box>
  )
}
