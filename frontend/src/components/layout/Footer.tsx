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
import BrandMark from '../brand/BrandMark'
import { useI18n } from '../../i18n'

export default function Footer() {
  const { t } = useI18n()
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
      color={text}
    >
      <Flex
        maxW="appContent"
        mx="auto"
        px={{ base: 5, md: 8 }}
        py={{ base: 12, md: 16, lg: 20 }}
        align={{ base: 'flex-start', sm: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
        gap={{ base: 6, md: 10, lg: 14 }}
      >
        <Box
          flexShrink={0}
          w={{ base: 20, md: 24, lg: 28 }}
          h={{ base: 20, md: 24, lg: 28 }}
          sx={{ filter: 'drop-shadow(0 12px 18px rgba(0, 0, 0, 0.20))' }}
        >
          <BrandMark
            size="100%"
            cream="#f2f4f0"
            jade={jade}
            gold={ed?.gold ?? '#c18b35'}
          />
        </Box>

        <Text
          as="p"
          m={0}
          maxW="1100px"
          fontFamily={ed?.fontDisplay ?? "'Instrument Serif', Georgia, serif"}
          fontSize={{ base: '2.6rem', sm: 'clamp(3rem, 6vw, 6.2rem)' }}
          fontWeight={400}
          lineHeight={{ base: 0.98, md: 0.94 }}
          letterSpacing="-0.04em"
          color={text}
        >
          {t('footer.statement')}{' '}
          <Text as="span" color={jade} fontStyle="italic" fontWeight={400}>
            {t('footer.statementAccent')}
          </Text>
        </Text>
      </Flex>

      <Box borderTop="1px solid" borderColor={line} pt={{ base: 8, md: 12 }}>
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
            {t('footer.tagline', undefined, FOOTER.tagline)}
          </Text>

          <Flex
            align="center"
            gap={{ base: 3, md: 5 }}
            textStyle="mono"
            fontSize="xs"
            letterSpacing="0.04em"
            flexWrap="wrap"
          >
            <Text>{t('footer.note', undefined, FOOTER.note)}</Text>
            <Text>{t('footer.copyright', { year })}</Text>
            <Tooltip label={t('footer.backToTop')} hasArrow placement="top" openDelay={250}>
              <IconButton
                aria-label={t('footer.scrollToTop')}
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
    </Box>
  )
}
