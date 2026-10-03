import {
  Box,
  Button,
  HStack,
  IconButton,
  Icon,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { Search } from '../../ui/icons'
import { useI18n } from '../../../i18n'
import { ON_BRAND, useOnBrand } from './onBrand'

interface SearchTriggerProps {
  onOpen: () => void
  /**
   * `compact` — square icon button. Mobile/tablet.
   * `expanded` — full pill with hint and shortcut. Desktop (lg+).
   */
  variant: 'compact' | 'expanded'
}

/**
 * Editorial search pill — hairline border, mono ledger voice. Only rendered in
 * the logged-in editorial shell, so it reads the pb-* CSS vars directly (they
 * flip with the color mode).
 */
export default function SearchTrigger({ onOpen, variant }: SearchTriggerProps) {
  const { t } = useI18n()
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')
  const shortcut = isMac ? '⌘K' : 'Ctrl K'

  const onBrand = useOnBrand()
  const pillProps = onBrand
    ? {
        bg: ON_BRAND.controlBg,
        border: `1px solid ${ON_BRAND.line}`,
        color: ON_BRAND.ink,
        boxShadow: 'none',
        transition: 'all 0.2s ease',
        _hover: { bg: ON_BRAND.controlHoverBg, borderColor: ON_BRAND.lineStrong, transform: 'translateY(-1px)' },
        _active: { transform: 'translateY(0)' },
        _focusVisible: { outline: 'none', boxShadow: ON_BRAND.focus },
      }
    : {
        bg: 'var(--pb-surface)',
        border: '1px solid var(--pb-hair)',
        color: 'var(--pb-ink-faint)',
        boxShadow: 'var(--pb-shadow)',
        transition: 'all 0.2s ease',
        _hover: {
          borderColor: 'var(--pb-hair-2)',
          color: 'var(--pb-ink)',
          transform: 'translateY(-1px)',
          boxShadow: 'var(--pb-shadow-lift)',
        },
        _active: { transform: 'translateY(0)' },
        _focusVisible: { outline: 'none', boxShadow: '0 0 0 2px var(--pb-forest)' },
      }

  if (variant === 'compact') {
    return (
      <Tooltip label={t('header.search.tooltip', { shortcut })} hasArrow openDelay={300}>
        <IconButton
          aria-label={t('header.search.open')}
          icon={<Icon as={Search} boxSize={4} weight="bold" />}
          onClick={onOpen}
          variant="ghost"
          h="40px"
          w="40px"
          minW="40px"
          borderRadius="999px"
          {...pillProps}
        />
      </Tooltip>
    )
  }

  return (
    <Box flexShrink={1} minW={0}>
      <Button
        onClick={onOpen}
        leftIcon={<Icon as={Search} boxSize={3.5} weight="bold" />}
        variant="ghost"
        h="40px"
        px={4}
        borderRadius="999px"
        fontWeight={400}
        w={{ lg: '230px', xl: '270px' }}
        justifyContent="flex-start"
        {...pillProps}
      >
        <HStack w="full" justify="space-between" spacing={3}>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="11px"
            letterSpacing="0.04em"
            color="inherit"
          >
            {t('header.search.transactions')}
          </Text>
          <Box
            display="inline-flex"
            alignItems="center"
            px={1.5}
            py="1px"
            borderRadius="6px"
            border={onBrand ? `1px solid ${ON_BRAND.line}` : '1px solid var(--pb-hair)'}
            flexShrink={0}
          >
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="9px"
              fontWeight={500}
              color={onBrand ? ON_BRAND.inkSoft : 'var(--pb-ink-faint)'}
              letterSpacing="0.06em"
            >
              {shortcut}
            </Text>
          </Box>
        </HStack>
      </Button>
    </Box>
  )
}
