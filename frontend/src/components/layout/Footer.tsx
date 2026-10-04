import {
  Box,
  Flex,
  IconButton,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { ArrowUp } from '../ui/icons'
import BrandMark from '../brand/BrandMark'
import { useI18n } from '../../i18n'

/** Nubank-style app footer: logo, the brand statement, and a quiet legal row. */
export default function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <Box
      as="footer"
      role="contentinfo"
      mt="auto"
      bg="var(--pb-surface-2, #f5f5f8)"
      color="var(--pb-ink)"
    >
      <Box maxW="appContent" mx="auto" px={{ base: 4, md: 6, lg: 8 }} pt={{ base: 8, md: 10 }} pb={{ base: 6, md: 7 }}>
        <Flex align="center" justify="space-between" gap={4}>
          <Box w={{ base: '150px', md: '180px' }} flexShrink={0}>
            <BrandMark variant="title" size="100%" colorMode="light" />
          </Box>
          <Tooltip label={t('footer.backToTop')} hasArrow placement="top" openDelay={250}>
            <IconButton
              aria-label={t('footer.scrollToTop')}
              icon={<ArrowUp size={16} strokeWidth={2.2} />}
              w="40px"
              h="40px"
              minW="40px"
              borderRadius="full"
              bg="#f3e8fc"
              color="#820ad1"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              _hover={{ bg: '#ead6fa' }}
              _active={{ bg: '#e2c6f8' }}
            />
          </Tooltip>
        </Flex>

        <Text
          mt={{ base: 6, md: 7 }}
          maxW="640px"
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight={700}
          letterSpacing="-0.02em"
          lineHeight={1.2}
        >
          {t('footer.statement')}{' '}
          <Text as="span" color="#820ad1">{t('footer.statementAccent')}</Text>
        </Text>

        <Flex
          mt={{ base: 6, md: 8 }}
          pt={4}
          borderTop="1px solid var(--pb-hair-2, #dadae2)"
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          gap={{ base: 1.5, md: 4 }}
          fontSize="xs"
          color="var(--pb-ink-soft)"
        >
          <Text>
            {t('footer.copyright', { year })} · {t('footer.note')}
          </Text>
          <Text>{t('footer.tagline')}</Text>
        </Flex>
      </Box>
    </Box>
  )
}
