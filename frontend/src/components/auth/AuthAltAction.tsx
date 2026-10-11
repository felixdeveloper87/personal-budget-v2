import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { AUTH_COLORS as C, AUTH_FONTS as F } from './authTheme'
import { useI18n } from '../../i18n'

interface AuthAltActionProps {
  label: string
  onClick: () => void
}

/** Mobile-only "— or —" divider + outline pill that switches sign in ⇄ sign up. */
export default function AuthAltAction({ label, onClick }: AuthAltActionProps) {
  const { t } = useI18n()

  return (
    <Box display={{ base: 'block', md: 'none' }}>
      <HStack spacing={3} color={C.inkFaint} aria-hidden="true">
        <Box flex={1} h="1px" bg={C.line} />
        <Text fontFamily={F.body} fontSize="xs">
          {t('auth.or')}
        </Text>
        <Box flex={1} h="1px" bg={C.line} />
      </HStack>
      <Button
        type="button"
        onClick={onClick}
        mt={3}
        w="full"
        h="52px"
        border="1.5px solid"
        borderColor={C.lineStrong}
        borderRadius="999px"
        bg="transparent"
        color={C.ink}
        fontFamily={F.body}
        fontSize="sm"
        fontWeight={700}
        _hover={{ bg: C.surface }}
        _active={{ bg: C.surfaceHover }}
        _focusVisible={{ boxShadow: `0 0 0 3px ${C.brand}28` }}
      >
        {label}
      </Button>
    </Box>
  )
}
