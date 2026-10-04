import { type FormEvent, type ReactNode } from 'react'
import {
  Box,
  type BoxProps,
  Button,
  type ButtonProps,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  acceptHouseholdInvitation,
  createHousehold,
  declineHouseholdInvitation,
} from '../../../api'
import { useI18n } from '../../../i18n'
import type { HouseholdPageState } from '../../../types'
import { Home, Plus, RefreshCw } from '../../../components/ui/icons'
import NuHero from '../../dashboard/components/NuHero'
import { HouseLineArt } from '../HouseholdHeader'
import type { ApplyHouseholdAction } from '../hooks/useHouseholdPageController'
import { NU_SHEET_PB, NU_SHEET_WRAP } from '../../dashboard/components/nu'

/* Same frame as the loaded page: purple hero, then a white sheet tucked over it. */
function HouseholdStateFrame({ hero, children }: { hero: ReactNode; children: ReactNode }) {
  const { t } = useI18n()
  return (
    <Box>
      <NuHero
        decoration={<HouseLineArt />}
        title={(
          <Box minW={0}>
            <Text fontSize="sm" color="rgba(255,255,255,0.8)">{t('household.header.ourHome')}</Text>
            <Text as="h1" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} letterSpacing="-0.01em" color="white">
              {t('dashboard.shortcutHousehold')}
            </Text>
          </Box>
        )}
      >
        {hero}
      </NuHero>
      <Box {...NU_SHEET_WRAP}>
        <Box
          className="nu-dashboard" pb={NU_SHEET_PB}
          bg="var(--nu-page)"
          borderTopRadius="24px"
          borderBottomRadius={{ base: 0, md: '24px' }}
          px={{ base: 4, md: 6 }}
          py={{ base: 6, md: 8 }}
          boxShadow={{ base: 'none', md: '0 1px 2px rgba(31,31,36,0.04), 0 18px 48px -24px rgba(31,31,36,0.18)' }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

/** Flat grey Nubank card. */
function NuCard({ children, ...props }: BoxProps) {
  return (
    <Box bg="var(--nu-surface)" borderRadius="16px" p={{ base: 5, md: 6 }} {...props}>
      {children}
    </Box>
  )
}

const pillPrimary: ButtonProps = {
  bg: 'var(--nu-brand)',
  color: 'white',
  borderRadius: 'full',
  fontWeight: 600,
  px: 5,
  _hover: { bg: 'var(--nu-brand-deep)' },
  _active: { bg: 'var(--nu-brand-deep)' },
}

export function HouseholdLoadingState() {
  const { t } = useI18n()
  return (
    <HouseholdStateFrame hero={null}>
      <VStack spacing={3} py={10}>
        <Spinner color="var(--nu-brand)" thickness="3px" />
        <Text color="var(--pb-ink-soft)" fontSize="sm">{t('household.loading')}</Text>
      </VStack>
    </HouseholdStateFrame>
  )
}

export function HouseholdLoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n()
  return (
    <HouseholdStateFrame hero={null}>
      <NuCard maxW="560px" mx="auto" textAlign="center">
        <VStack spacing={3}>
          <Box display="grid" placeItems="center" w="44px" h="44px" borderRadius="full" bg="var(--nu-negative-tint)" color="var(--nu-negative)">
            <Icon as={Home} boxSize={5} weight="bold" />
          </Box>
          <Text fontSize="lg" fontWeight={700} color="var(--pb-ink)">{t('household.load.failedTitle')}</Text>
          <Text color="var(--pb-ink-soft)" fontSize="sm">{t('household.load.failedDescription')}</Text>
          <Button {...pillPrimary} mt={1} leftIcon={<Icon as={RefreshCw} boxSize={4} />} onClick={onRetry}>
            {t('household.load.retry')}
          </Button>
        </VStack>
      </NuCard>
    </HouseholdStateFrame>
  )
}

export function HouseholdOnboarding({
  page,
  householdName,
  busyAction,
  setHouseholdName,
  applyAction,
}: {
  page: HouseholdPageState
  householdName: string
  busyAction: string | null
  setHouseholdName: (name: string) => void
  applyAction: ApplyHouseholdAction
}) {
  const { t } = useI18n()
  return (
    <HouseholdStateFrame
      hero={(
        <Box mt={{ base: 4, md: 5 }} maxW="620px">
          <Text fontSize="sm" fontWeight={600} color="#e2c2fb">{t('household.create.eyebrow')}</Text>
          <Text mt={1} fontSize={{ base: '2xl', md: '3xl' }} fontWeight={700} letterSpacing="-0.02em" lineHeight={1.1} color="white">
            {t('household.create.title')}
          </Text>
          <Text mt={2} fontSize="sm" lineHeight={1.6} color="rgba(255,255,255,0.84)">
            {t('household.create.description')}
          </Text>
        </Box>
      )}
    >
      <VStack align="stretch" spacing={4} maxW="760px" mx="auto">
        {page.pendingInvitations.length > 0 && (
          <Box>
            <Text mb={3} fontSize="md" fontWeight={700} color="var(--pb-ink)">
              {t('household.invitations.title')}
            </Text>
            <VStack align="stretch" spacing={2.5}>
              {page.pendingInvitations.map((invitation) => (
                <Stack
                  key={invitation.id}
                  direction={{ base: 'column', sm: 'row' }}
                  justify="space-between"
                  align={{ base: 'stretch', sm: 'center' }}
                  p={4}
                  borderRadius="16px"
                  bg="var(--nu-surface)"
                >
                  <Box minW={0}>
                    <Text fontWeight={700} color="var(--pb-ink)" noOfLines={1}>{invitation.householdName}</Text>
                    <Text color="var(--pb-ink-soft)" fontSize="sm">
                      {t('household.invitations.invitedBy', { name: invitation.invitedByName })}
                    </Text>
                  </Box>
                  <HStack spacing={2}>
                    <Button
                      {...pillPrimary}
                      size="sm"
                      isLoading={busyAction === `accept-${invitation.id}`}
                      onClick={() => void applyAction(
                        `accept-${invitation.id}`,
                        () => acceptHouseholdInvitation(invitation.id),
                        t('household.invitations.joined'),
                      )}
                    >
                      {t('household.invitations.accept')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      borderRadius="full"
                      color="var(--nu-brand)"
                      _hover={{ bg: 'var(--nu-brand-tint)' }}
                      isLoading={busyAction === `decline-${invitation.id}`}
                      onClick={() => void applyAction(
                        `decline-${invitation.id}`,
                        () => declineHouseholdInvitation(invitation.id),
                      )}
                    >
                      {t('household.invitations.decline')}
                    </Button>
                  </HStack>
                </Stack>
              ))}
            </VStack>
          </Box>
        )}

        <NuCard>
          <VStack
            as="form"
            align="stretch"
            spacing={4}
            onSubmit={(event: FormEvent) => {
              event.preventDefault()
              void applyAction(
                'create-household',
                () => createHousehold(householdName),
                t('household.create.created'),
              )
            }}
          >
            <HStack spacing={3}>
              <Box display="grid" placeItems="center" w="44px" h="44px" flexShrink={0} borderRadius="full" bg="var(--nu-brand-tint)" color="var(--nu-brand)">
                <Icon as={Home} boxSize={5} weight="bold" />
              </Box>
              <Box>
                <Text fontSize="md" fontWeight={700} color="var(--pb-ink)">{t('household.create.formTitle')}</Text>
                <Text color="var(--pb-ink-soft)" fontSize="sm">{t('household.create.ownerHint')}</Text>
              </Box>
            </HStack>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight={600} color="var(--pb-ink)">{t('household.create.name')}</FormLabel>
              <Input
                h="52px"
                bg="white"
                border="1.5px solid transparent"
                borderRadius="14px"
                _hover={{ bg: 'white' }}
                _focusVisible={{ borderColor: 'var(--nu-brand)', boxShadow: 'none' }}
                value={householdName}
                maxLength={120}
                onChange={(event) => setHouseholdName(event.target.value)}
                placeholder={t('household.create.placeholder')}
              />
            </FormControl>
            <Button
              {...pillPrimary}
              type="submit"
              h="48px"
              alignSelf={{ base: 'stretch', sm: 'flex-start' }}
              leftIcon={<Icon as={Plus} boxSize={4} />}
              isLoading={busyAction === 'create-household'}
            >
              {t('household.create.submit')}
            </Button>
          </VStack>
        </NuCard>
      </VStack>
    </HouseholdStateFrame>
  )
}
