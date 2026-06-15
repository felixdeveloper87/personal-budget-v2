import {
  Box,
  Flex,
  IconButton,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { ArrowUp } from '../ui/icons'
import { useEd } from '../../editorial'
import { FOOTER } from '../../pages/landing-v3/landingV3.config'

export default function Footer() {
  const ed = useEd()
  const fallbackBg = useColorModeValue('#f5f1e8', '#070a08')
  const fallbackText = useColorModeValue('#16241c', '#efeae0')
  const fallbackMuted = useColorModeValue('#5f6d62', '#94a398')
  const fallbackLine = useColorModeValue(
    'rgba(20, 36, 28, 0.12)',
    'rgba(239, 234, 224, 0.10)',
  )
  const fallbackJade = useColorModeValue('#0e8f5e', '#7fe6b3')

  const bg = ed?.bg ?? fallbackBg
  const text = ed?.cream ?? fallbackText
  const muted = ed?.muted ?? fallbackMuted
  const line = ed?.line ?? fallbackLine
  const jade = ed?.jade ?? fallbackJade
  const year = new Date().getFullYear()

  return (
    <Box
      as="footer"
      role="contentinfo"
      position="relative"
      mt="auto"
      overflow="hidden"
      borderTop="1px solid"
      borderColor={line}
      bg={bg}
      pt={{ base: 8, md: 12 }}
      color={text}
    >
      <Text
        aria-hidden
        textStyle="display"
        fontSize={{ base: 'clamp(3.25rem, 15vw, 7rem)', md: 'clamp(5rem, 11vw, 11rem)' }}
        fontWeight={400}
        lineHeight={0.9}
        letterSpacing="-0.025em"
        textAlign="center"
        whiteSpace="nowrap"
        color="transparent"
        sx={{
          WebkitTextStroke: `1px ${line}`,
          background: `linear-gradient(100deg, transparent 30%, ${jade}8c 50%, transparent 70%)`,
          backgroundSize: '250% 100%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          animation: 'footerWordmarkSweep 6s linear infinite',
          '@keyframes footerWordmarkSweep': {
            to: { backgroundPosition: '-250% 0' },
          },
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            backgroundPosition: '50% 0',
          },
        }}
      >
        {FOOTER.wordmark}
      </Text>

      <Flex
        maxW="appContent"
        mx="auto"
        px={{ base: 4, md: 6 }}
        py={{ base: 6, md: 8 }}
        align={{ base: 'flex-start', md: 'center' }}
        justify="space-between"
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 4, md: 6 }}
        color={muted}
      >
        <Text fontSize={{ base: 'sm', md: 'md' }}>
          {FOOTER.tagline}
        </Text>

        <Flex
          align="center"
          gap={{ base: 3, md: 5 }}
          textStyle="mono"
          fontSize="xs"
          letterSpacing="0.04em"
          flexWrap="wrap"
        >
          <Text>{FOOTER.note}</Text>
          <Text>© {year} Personal Budget</Text>
          <Tooltip label="Back to top" hasArrow placement="top" openDelay={250}>
            <IconButton
              aria-label="Scroll to top"
              icon={<ArrowUp size={14} strokeWidth={2} />}
              size="sm"
              variant="ghost"
              borderRadius="full"
              color={jade}
              border="1px solid"
              borderColor={line}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              _hover={{ bg: ed?.jadeSoft ?? `${jade}1a`, transform: 'translateY(-2px)' }}
              _active={{ transform: 'translateY(0)' }}
              transition="background 0.2s ease, transform 0.2s ease"
            />
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  )
}
