import { type FormEvent } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  Spinner,
  Stack,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  acceptHouseholdInvitation,
  createHousehold,
  declineHouseholdInvitation,
} from '../../../api'
import { useEd } from '../../../editorial'
import { useI18n } from '../../../i18n'
import type { HouseholdPageState } from '../../../types'
import { Home, Plus, RefreshCw } from '../../../components/ui/icons'
import { Surface } from './HouseholdPageComponents'
import type { ApplyHouseholdAction } from '../hooks/useHouseholdPageController'

export function HouseholdLoadingState() {
  const ed = useEd()
  const { t } = useI18n()
  const mutedFallback = useColorModeValue('gray.600', 'gray.400')
  const muted = ed?.muted ?? mutedFallback
  return (
    <Box minH="55vh" display="grid" placeItems="center">
      <VStack spacing={3}>
        <Spinner color={ed?.jade ?? 'teal.500'} thickness="3px" />
        <Text color={muted} fontSize="sm">{t('household.loading')}</Text>
      </VStack>
    </Box>
  )
}

export function HouseholdLoadError({ onRetry }: { onRetry: () => void }) {
  const ed = useEd()
  const { t } = useI18n()
  const mutedFallback = useColorModeValue('gray.600', 'gray.400')
  const muted = ed?.muted ?? mutedFallback
  return (
    <Box maxW="720px" mx="auto" px={4} py={16}>
      <Surface p={8} textAlign="center">
        <VStack spacing={4}>
          <Icon as={Home} boxSize={9} color={muted} />
          <Heading size="md">{t('household.load.failedTitle')}</Heading>
          <Text color={muted}>{t('household.load.failedDescription')}</Text>
          <Button leftIcon={<Icon as={RefreshCw} boxSize={4} />} onClick={onRetry}>
            {t('household.load.retry')}
          </Button>
        </VStack>
      </Surface>
    </Box>
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
  const ed = useEd()
  const { t } = useI18n()
  const mutedFallback = useColorModeValue('gray.600', 'gray.400')
  const muted = ed?.muted ?? mutedFallback
  return (
    <Box maxW="900px" mx="auto" px={{ base: 3, md: 6 }} py={{ base: 5, md: 10 }}>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Text
            color={ed?.gold ?? 'orange.500'}
            fontSize="xs"
            fontWeight={800}
            letterSpacing="0.16em"
            textTransform="uppercase"
          >
            {t('household.create.eyebrow')}
          </Text>
          <Heading mt={2} size={{ base: 'xl', md: '2xl' }}>
            {t('household.create.title')}
          </Heading>
          <Text mt={3} color={muted} maxW="620px">
            {t('household.create.description')}
          </Text>
        </Box>

        {page.pendingInvitations.length > 0 && (
          <Surface p={{ base: 4, md: 6 }}>
            <VStack align="stretch" spacing={4}>
              <Heading size="sm">{t('household.invitations.title')}</Heading>
              {page.pendingInvitations.map((invitation) => (
                <Stack
                  key={invitation.id}
                  direction={{ base: 'column', sm: 'row' }}
                  justify="space-between"
                  align={{ base: 'stretch', sm: 'center' }}
                  p={4}
                  borderRadius="xl"
                  bg={ed?.panelRaised ?? 'blackAlpha.50'}
                >
                  <Box>
                    <Text fontWeight={800}>{invitation.householdName}</Text>
                    <Text color={muted} fontSize="sm">
                      {t('household.invitations.invitedBy', { name: invitation.invitedByName })}
                    </Text>
                  </Box>
                  <HStack>
                    <Button
                      size="sm"
                      colorScheme="teal"
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
          </Surface>
        )}

        <Surface p={{ base: 5, md: 7 }}>
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
            <HStack>
              <Box
                w={11}
                h={11}
                display="grid"
                placeItems="center"
                borderRadius="xl"
                bg={ed?.jadeSoft ?? 'teal.50'}
                color={ed?.jade ?? 'teal.600'}
              >
                <Icon as={Home} boxSize={6} weight="duotone" />
              </Box>
              <Box>
                <Heading size="md">{t('household.create.formTitle')}</Heading>
                <Text color={muted} fontSize="sm">{t('household.create.ownerHint')}</Text>
              </Box>
            </HStack>
            <FormControl isRequired>
              <FormLabel>{t('household.create.name')}</FormLabel>
              <Input
                value={householdName}
                maxLength={120}
                onChange={(event) => setHouseholdName(event.target.value)}
                placeholder={t('household.create.placeholder')}
              />
            </FormControl>
            <Button
              type="submit"
              alignSelf="flex-start"
              colorScheme="teal"
              leftIcon={<Icon as={Plus} boxSize={4} />}
              isLoading={busyAction === 'create-household'}
            >
              {t('household.create.submit')}
            </Button>
          </VStack>
        </Surface>
      </VStack>
    </Box>
  )
}
