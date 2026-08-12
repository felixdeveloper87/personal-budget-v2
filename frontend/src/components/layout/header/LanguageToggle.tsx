import { IconButton, Tooltip, useColorModeValue } from '@chakra-ui/react'
import { useEd } from '../../../editorial'
import { useI18n } from '../../../i18n'

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

export default function LanguageToggle() {
  const { locale, toggleLocale, t } = useI18n()
  const ed = useEd()
  const switchToPortuguese = locale === 'en-GB'
  const label = switchToPortuguese
    ? t('header.language.switchToPortuguese')
    : t('header.language.switchToEnglish')

  const fallbackBg = useColorModeValue('rgba(255,255,255,0.65)', 'rgba(255,255,255,0.04)')
  const fallbackBorder = useColorModeValue('rgba(226,232,240,0.8)', 'rgba(255,255,255,0.08)')
  const fallbackHoverBg = useColorModeValue('white', 'rgba(255,255,255,0.09)')

  return (
    <Tooltip label={label} hasArrow openDelay={300}>
      <IconButton
        aria-label={label}
        icon={switchToPortuguese ? <BrazilFlag /> : <UnitedKingdomFlag />}
        onClick={toggleLocale}
        variant="ghost"
        h="40px"
        w="40px"
        minW="40px"
        borderRadius="full"
        border="1px solid"
        borderColor={ed?.line ?? fallbackBorder}
        bg={ed?.controlBg ?? fallbackBg}
        boxShadow="var(--pb-shadow, 0 1px 4px rgba(15, 23, 42, 0.08))"
        transition="background 0.2s ease, border-color 0.2s ease, transform 0.2s ease"
        sx={{
          '& > svg': {
            borderRadius: '2px',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.18)',
            transition: 'transform 0.2s ease',
          },
          '&:hover > svg': { transform: 'scale(1.08)' },
        }}
        _hover={{
          bg: ed?.controlHoverBg ?? fallbackHoverBg,
          borderColor: ed?.jade ?? 'blue.300',
          transform: 'translateY(-1px)',
        }}
        _active={{ transform: 'translateY(0)' }}
        _focusVisible={{
          outline: 'none',
          boxShadow: ed
            ? `0 0 0 2px ${ed.bg}, 0 0 0 5px ${ed.jade}`
            : '0 0 0 3px rgba(59, 130, 246, 0.35)',
        }}
      />
    </Tooltip>
  )
}
