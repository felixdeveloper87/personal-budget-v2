import { Button, HStack, useBreakpointValue } from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import SearchTrigger from './SearchTrigger'
import ThemeToggle from './ThemeToggle'
import UserMenu from './UserMenu'
import { BRAND } from './brand.config'

interface HeaderActionsProps {
  user?: any
  onSearchOpen: () => void
  onLogin?: () => void
  onOpenSettings?: () => void
  onLogout?: () => void
}

export default function HeaderActions({
  user,
  onSearchOpen,
  onLogin,
  onOpenSettings,
  onLogout,
}: HeaderActionsProps) {
  const ctaLabel =
    useBreakpointValue({
      base: BRAND.cta.headerCompact,
      sm: BRAND.cta.headerShort,
      lg: BRAND.cta.headerLong,
    }) ?? BRAND.cta.headerShort
  const showExpandedSearch = useBreakpointValue({ base: false, lg: true }) ?? false

  return (
    <HStack spacing={2} flexShrink={0}>
      {user && (
        showExpandedSearch ? (
          <SearchTrigger variant="expanded" onOpen={onSearchOpen} />
        ) : (
          <SearchTrigger variant="compact" onOpen={onSearchOpen} />
        )
      )}

      <ThemeToggle />

      {user && onLogout ? (
        <UserMenu user={user} onOpenSettings={onOpenSettings} onLogout={onLogout} />
      ) : (
        !user && (
          <Button
            onClick={onLogin}
            rightIcon={<ArrowForwardIcon transition="transform 0.25s ease" />}
            h="40px"
            px={{ base: 4, md: 5 }}
            borderRadius="xl"
            fontWeight={700}
            fontSize="sm"
            letterSpacing="0.01em"
            color="white"
            bg="linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)"
            backgroundSize="200% 200%"
            backgroundPosition="0% 50%"
            boxShadow="0 6px 18px rgba(37, 99, 235, 0.32), inset 0 1px 0 rgba(255,255,255,0.18)"
            position="relative"
            overflow="hidden"
            transition="background-position 0.6s ease, transform 0.2s ease, box-shadow 0.25s ease"
            sx={{
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-150%',
                width: '60%',
                height: '100%',
                background:
                  'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
                transform: 'skewX(-20deg)',
                transition: 'left 0.7s cubic-bezier(0.32, 0.72, 0, 1)',
                pointerEvents: 'none',
              },
              '&:hover::before': {
                left: '150%',
              },
              '& > .chakra-button__icon:last-of-type': {
                transition: 'transform 0.25s ease',
              },
              '&:hover > .chakra-button__icon:last-of-type': {
                transform: 'translateX(3px)',
              },
            }}
            _hover={{
              backgroundPosition: '100% 50%',
              transform: 'translateY(-1px)',
              boxShadow: '0 10px 26px rgba(37, 99, 235, 0.45), inset 0 1px 0 rgba(255,255,255,0.22)',
            }}
            _active={{ transform: 'translateY(0)' }}
            _focusVisible={{
              outline: 'none',
              boxShadow:
                '0 0 0 3px rgba(59, 130, 246, 0.45), 0 6px 18px rgba(37, 99, 235, 0.32)',
            }}
          >
            {ctaLabel}
          </Button>
        )
      )}
    </HStack>
  )
}
