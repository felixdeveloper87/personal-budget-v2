import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { Check, Languages } from '../../ui/icons'
import { useEd } from '../../../editorial'
import { useI18n } from '../../../i18n'
import type { AppLocale } from '../../../i18n/types'
import { ON_BRAND, useOnBrand } from './onBrand'

function BrazilFlag() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 60 42"
      width="24"
      height="17"
    >
      <rect width="60" height="42" fill="#009B3A" />
      <path d="M30 5 54 21 30 37 6 21Z" fill="#FFDF00" />
      <circle cx="30" cy="21" r="9" fill="#002776" />
      <path
        d="M21.7 18.2c5.7-1.2 12.1.4 16.4 4"
        fill="none"
        stroke="#fff"
        strokeWidth="1.45"
      />
    </svg>
  )
}

function UnitedKingdomFlag() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 60 36"
      width="24"
      height="17"
    >
      <rect width="60" height="36" fill="#012169" />
      <path d="M0 0 60 36M60 0 0 36" stroke="#fff" strokeWidth="8" />
      <path d="M0 0 60 36M60 0 0 36" stroke="#C8102E" strokeWidth="3" />
      <path d="M30 0v36M0 18h60" stroke="#fff" strokeWidth="12" />
      <path d="M30 0v36M0 18h60" stroke="#C8102E" strokeWidth="7" />
    </svg>
  )
}

const LANGUAGES: ReadonlyArray<{ locale: AppLocale; label: string; Flag: () => JSX.Element }> = [
  { locale: 'pt-BR', label: 'Português (Brasil)', Flag: BrazilFlag },
  { locale: 'en-GB', label: 'English (UK)', Flag: UnitedKingdomFlag },
]

const MENU = {
  ink: '#1f1f24',
  brand: '#820ad1',
  brandSoft: '#f3e8fc',
  hover: '#f5f5f8',
} as const

export default function LanguageToggle() {
  const { locale, setLocale, t } = useI18n()
  const ed = useEd()
  const label = t('header.language.label')

  const fallbackBg = useColorModeValue('rgba(255,255,255,0.65)', 'rgba(255,255,255,0.04)')
  const fallbackBorder = useColorModeValue('rgba(226,232,240,0.8)', 'rgba(255,255,255,0.08)')
  const fallbackHoverBg = useColorModeValue('white', 'rgba(255,255,255,0.09)')
  const fallbackInk = useColorModeValue('gray.700', 'whiteAlpha.900')
  const onBrand = useOnBrand()
  const border = onBrand ? ON_BRAND.line : ed?.line ?? fallbackBorder
  const bg = onBrand ? ON_BRAND.controlBg : ed?.controlBg ?? fallbackBg
  const hoverBg = onBrand ? ON_BRAND.controlHoverBg : ed?.controlHoverBg ?? fallbackHoverBg
  const hoverBorder = onBrand ? ON_BRAND.lineStrong : ed?.jade ?? 'blue.300'
  const ink = onBrand ? ON_BRAND.ink : ed?.cream ?? fallbackInk

  return (
    <Menu placement="bottom-end" autoSelect={false} isLazy>
      <Tooltip label={label} hasArrow openDelay={300}>
        <MenuButton
          as={IconButton}
          aria-label={label}
          icon={<Languages size={20} weight="bold" aria-hidden />}
          variant="ghost"
          h="40px"
          w="40px"
          minW="40px"
          borderRadius="full"
          border="1px solid"
          borderColor={border}
          bg={bg}
          color={ink}
          boxShadow={onBrand ? 'none' : 'var(--pb-shadow, 0 1px 4px rgba(15, 23, 42, 0.08))'}
          transition="background 0.2s ease, border-color 0.2s ease, transform 0.2s ease"
          _hover={{
            bg: hoverBg,
            borderColor: hoverBorder,
            transform: 'translateY(-1px)',
          }}
          _active={{ transform: 'translateY(0)', bg: hoverBg }}
          _focusVisible={{
            outline: 'none',
            boxShadow: onBrand
              ? ON_BRAND.focus
              : ed
              ? `0 0 0 2px ${ed.bg}, 0 0 0 5px ${ed.jade}`
              : '0 0 0 3px rgba(59, 130, 246, 0.35)',
          }}
        />
      </Tooltip>
      {/* Portalled so it escapes overflow-hidden headers (mobile splash). */}
      <Portal>
        <MenuList
          zIndex="popover"
          minW="220px"
          p={1.5}
          border="0"
          borderRadius="18px"
          bg="white"
          boxShadow="0 24px 60px -24px rgba(40, 0, 70, 0.4), 0 0 0 1px rgba(31, 31, 36, 0.06)"
        >
          {LANGUAGES.map(({ locale: option, label: optionLabel, Flag }) => {
            const active = option === locale
            return (
              <MenuItem
                key={option}
                onClick={() => setLocale(option)}
                aria-current={active ? 'true' : undefined}
                h="48px"
                px={3}
                gap={3}
                borderRadius="12px"
                bg={active ? MENU.brandSoft : 'transparent'}
                color={active ? MENU.brand : MENU.ink}
                fontSize="sm"
                fontWeight={active ? 700 : 600}
                _hover={{ bg: active ? MENU.brandSoft : MENU.hover }}
                _focus={{ bg: active ? MENU.brandSoft : MENU.hover }}
              >
                <Box
                  as="span"
                  display="inline-flex"
                  flexShrink={0}
                  borderRadius="3px"
                  overflow="hidden"
                  boxShadow="0 0 0 1px rgba(0,0,0,0.12)"
                >
                  <Flag />
                </Box>
                <Box as="span" flex={1}>
                  {optionLabel}
                </Box>
                {active && <Check size={16} weight="bold" color={MENU.brand} aria-hidden />}
              </MenuItem>
            )
          })}
        </MenuList>
      </Portal>
    </Menu>
  )
}
