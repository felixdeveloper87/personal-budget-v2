import { Box, Flex, Img, VisuallyHidden, usePrefersReducedMotion } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { THEME_COLOR } from '../../hooks/useThemeColorDimming'
import { useI18n } from '../../i18n'

const pulse = keyframes`
  0%, 80%, 100% { opacity: 0.35; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
`

/**
 * Launch screen while the session loads. It is the same picture as the
 * system splash (purple, centred mark — see scripts/generate-splash.mjs and
 * the boot markup in index.html), so opening the app reads as one continuous
 * launch instead of splash → white page → spinner.
 */
export default function AppSplash() {
  const { t } = useI18n()
  const reducedMotion = usePrefersReducedMotion()

  return (
    <Flex
      role="status"
      aria-live="polite"
      position="fixed"
      inset={0}
      zIndex={3000}
      bg={THEME_COLOR}
      direction="column"
      align="center"
      justify="center"
    >
      <Img src="/maskable-icon-512x512.png" alt="" w="128px" h="128px" draggable={false} />
      <Flex position="absolute" bottom="calc(env(safe-area-inset-bottom, 0px) + 56px)" gap="8px" aria-hidden>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            w="7px"
            h="7px"
            borderRadius="full"
            bg="white"
            opacity={0.6}
            animation={reducedMotion ? undefined : `${pulse} 1.2s ${i * 0.16}s infinite ease-in-out`}
          />
        ))}
      </Flex>
      <VisuallyHidden>{t('common.loadingDashboard')}</VisuallyHidden>
    </Flex>
  )
}
