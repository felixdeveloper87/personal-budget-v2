import { Box, Button, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { ChevronRight } from '../../components/ui/icons'
import { useI18n } from '../../i18n'
import type { HouseholdDashboard } from '../../types'
import { householdAvatarGradient } from './householdAvatar'

export function HouseholdMembersCarousel({ household, onViewBalances }: {
  household: HouseholdDashboard
  onViewBalances: () => void
}) {
  const { formatCurrency, t } = useI18n()

  return (
    <Box id="household-members" scrollMarginTop="90px">
      <Flex align="center" justify="space-between" gap={3}>
        <Box minW={0}>
          <Text fontFamily="var(--pb-mono)" fontSize="9px" fontWeight={800} letterSpacing="0.12em" textTransform="uppercase" color="var(--pb-income)">
            {t('household.members.eyebrow')}
          </Text>
          <Text mt={1} fontFamily="var(--pb-serif)" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={600} lineHeight={1.1} color="var(--pb-ink)">
            {t('household.members.title')}
          </Text>
        </Box>
        <Button
          flexShrink={0} minH="44px" px={{ base: 3, md: 4 }} borderRadius="13px"
          bg="var(--pb-tint-green)" color="var(--pb-forest-2)" rightIcon={<Icon as={ChevronRight} boxSize={4} />}
          aria-label={t('household.balances.openAria')} onClick={onViewBalances}
          _hover={{ bg: 'var(--pb-surface-3)', transform: 'translateY(-1px)' }} _active={{ transform: 'translateY(0)' }}
        >
          {t('household.balances.title')}
        </Button>
      </Flex>
      <Text mt={1.5} fontSize="xs" color="var(--pb-ink-soft)">{t('household.members.description')}</Text>

      <HStack
        mt={3.5} pb={1.5} spacing={2.5} align="stretch" overflowX="auto" overflowY="hidden"
        role="list" aria-label={t('household.members.title')}
        sx={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', '&::-webkit-scrollbar': { display: 'none' } }}
      >
        {household.members.map((member, index) => {
          const receiving = member.balance > 0.005
          const paying = member.balance < -0.005
          const accent = receiving ? 'var(--pb-income)' : paying ? 'var(--pb-coral)' : 'var(--pb-ink-soft)'
          const tint = receiving ? 'var(--pb-tint-income)' : paying ? 'var(--pb-tint-coral)' : 'var(--pb-surface-2)'
          const status = receiving
            ? t('household.members.toReceive')
            : paying ? t('household.members.toPay') : t('household.members.settled')
          const initials = member.name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase()

          return (
            <Box
              key={member.id} role="listitem" position="relative" overflow="hidden"
              flex="0 0 178px" minW="178px" minH="132px" p={3}
              border="1px solid var(--pb-hair)" borderRadius="16px" bg="var(--pb-surface)" boxShadow="var(--pb-shadow)"
              sx={{ scrollSnapAlign: 'start' }}
              aria-label={`${member.name}. ${status}: ${formatCurrency(Math.abs(member.balance))}`}
            >
              <Box position="absolute" top={0} left={3} right={3} h="3px" borderBottomRadius="full" bg="#3F403B" opacity={0.78} />
              <HStack spacing={2.5} minW={0} minH="38px" align="center">
                <Flex
                  w="34px" h="34px" flexShrink={0} align="center" justify="center" borderRadius="full"
                  bgGradient={householdAvatarGradient(index, member.id)} color="white" fontSize="xs" fontWeight={800}
                >
                  {initials}
                </Flex>
                <Box minW={0} flex={1}>
                  <Text fontSize="sm" fontWeight={700} color="var(--pb-ink)" noOfLines={1}>{member.name}</Text>
                  <Box minH="13px">
                    {member.id === household.currentMemberId && (
                      <Text mt={0.5} fontSize="2xs" fontWeight={700} color="var(--pb-income)">{t('household.common.you')}</Text>
                    )}
                  </Box>
                </Box>
              </HStack>
              <VStack mt={2.5} pt={2.5} align="center" spacing={1.5} borderTop="1px solid var(--pb-hair)">
                <Text fontFamily="var(--pb-serif)" fontSize="xl" fontWeight={700} lineHeight={1} color={accent} textAlign="center" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(Math.abs(member.balance))}
                </Text>
                <Text px={2} py={1} borderRadius="7px" bg={tint} color={accent} fontSize="2xs" fontWeight={700}>{status}</Text>
              </VStack>
            </Box>
          )
        })}
      </HStack>
    </Box>
  )
}
