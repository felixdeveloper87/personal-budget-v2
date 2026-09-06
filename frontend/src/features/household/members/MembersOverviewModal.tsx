import { Badge, Box, Button, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'
import type { HouseholdDashboard } from '../../../types'
import { CheckCircle2, TrendingDown, TrendingUp } from '../../../components/ui/icons'
import { ModalHeader, PremiumModal } from '../../../components/ui'
import { HOUSEHOLD_AVATAR_GRADIENTS } from '../householdAvatar'

export function MembersOverviewModal({
  isOpen,
  onClose,
  household,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
}) {
  const { formatCurrency, formatNumber, t } = useI18n()

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'xl' }}
      header={
        <ModalHeader
          title={t('household.members.title')}
          caption={t('household.members.modalCaption')}
          onClose={onClose}
          rightSlot={
            <Badge
              bg="var(--pb-tint-green)"
              color="var(--pb-forest-2)"
              border="1px solid var(--pb-hair)"
              borderRadius="full"
              px={3}
              py={1}
              textTransform="none"
              fontFamily="var(--pb-mono)"
              fontSize="xs"
              fontWeight={700}
            >
              {t(
                household.members.length === 1
                  ? 'household.members.count.one'
                  : 'household.members.count.other',
                { count: formatNumber(household.members.length) },
              )}
            </Badge>
          }
        />
      }
      footer={
        <Flex justify="flex-end" w="full">
          <Button
            h="44px"
            w={{ base: 'full', sm: 'auto' }}
            px={6}
            borderRadius="11px"
            bg="var(--pb-forest-2)"
            color="var(--pb-on-accent)"
            onClick={onClose}
            _hover={{ bg: 'var(--pb-forest)', transform: 'translateY(-1px)' }}
            _active={{ transform: 'translateY(0)' }}
          >
            {t('household.common.close')}
          </Button>
        </Flex>
      }
    >
      <Box p={{ base: 2.5, sm: 3.5 }} bg="var(--pb-surface-2)">
        <VStack align="stretch" spacing={2}>
          {household.members.map((member, index) => {
            const isCurrentMember = member.id === household.currentMemberId
            const isReceiving = member.balance > 0.005
            const isPaying = member.balance < -0.005
            const isSettled = !isReceiving && !isPaying
            const gradient = HOUSEHOLD_AVATAR_GRADIENTS[
              index % HOUSEHOLD_AVATAR_GRADIENTS.length
            ]
            const initial = (member.name || '?').charAt(0).toUpperCase()

            const balanceAccent = isReceiving
              ? 'var(--pb-income)'
              : isPaying
                ? 'var(--pb-coral)'
                : 'var(--pb-ink-faint)'
            const balanceTint = isReceiving
              ? 'var(--pb-tint-income)'
              : isPaying
                ? 'var(--pb-tint-coral)'
                : 'var(--pb-surface)'
            const balanceLabel = isReceiving
              ? t('household.members.toReceive')
              : isPaying
                ? t('household.members.toPay')
                : t('household.members.settled')
            const BalanceIcon = isReceiving
              ? TrendingUp
              : isPaying
                ? TrendingDown
                : CheckCircle2

            return (
              <Box
                key={member.id}
                position="relative"
                overflow="hidden"
                px={{ base: 3, sm: 3.5 }}
                py={2.5}
                borderRadius="14px"
                border="1px solid"
                borderColor={isCurrentMember ? 'var(--pb-forest-2)' : 'var(--pb-hair)'}
                bg="var(--pb-surface)"
                boxShadow={isCurrentMember ? '0 2px 10px -2px rgba(34, 197, 94, 0.15)' : 'var(--pb-shadow)'}
                transition="all 0.2s ease"
                _hover={{
                  borderColor: isCurrentMember ? 'var(--pb-forest)' : 'var(--pb-hair-2)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 14px -4px rgba(0,0,0,0.1)',
                }}
              >
                <Flex
                  align="center"
                  justify="space-between"
                  gap={2.5}
                >
                  <HStack spacing={2.5} minW={0} align="center" flex={1}>
                    <Flex
                      w="36px"
                      h="36px"
                      flexShrink={0}
                      align="center"
                      justify="center"
                      borderRadius="11px"
                      bgGradient={gradient}
                      color="white"
                      fontFamily="var(--pb-serif)"
                      fontWeight={700}
                      fontSize="md"
                      boxShadow="0 2px 8px rgba(0, 0, 0, 0.12)"
                      border="1px solid rgba(255, 255, 255, 0.2)"
                    >
                      {initial}
                    </Flex>

                    <Box minW={0} flex={1}>
                      <HStack spacing={1.5} flexWrap="wrap" align="center">
                        <Text
                          fontWeight={700}
                          fontSize="sm"
                          color="var(--pb-ink)"
                          noOfLines={1}
                          lineHeight={1.2}
                        >
                          {member.name}
                        </Text>
                        {isCurrentMember && (
                          <Badge
                            borderRadius="full"
                            px={1.5}
                            py={0}
                            bg="var(--pb-tint-green)"
                            color="var(--pb-forest-2)"
                            border="1px solid var(--pb-hair)"
                            fontSize="8px"
                            fontWeight={700}
                            textTransform="uppercase"
                          >
                            {t('household.common.you')}
                          </Badge>
                        )}
                        {member.role === 'OWNER' && (
                          <Badge
                            borderRadius="full"
                            px={1.5}
                            py={0}
                            bg="var(--pb-tint-gold)"
                            color="var(--pb-gold)"
                            border="1px solid var(--pb-hair)"
                            fontSize="8px"
                            fontWeight={700}
                            textTransform="uppercase"
                          >
                            {t('household.common.owner')}
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                  </HStack>

                  <Flex
                    align="center"
                    justify="space-between"
                    w={{ base: '142px', sm: '165px' }}
                    flexShrink={0}
                    px={2.5}
                    py={1.5}
                    borderRadius="10px"
                    bg={balanceTint}
                    border="1px solid var(--pb-hair)"
                  >
                    <HStack spacing={1} minW={0}>
                      <Icon
                        as={BalanceIcon}
                        boxSize={3}
                        color={balanceAccent}
                        weight={isSettled ? 'fill' : 'duotone'}
                      />
                      <Text
                        fontFamily="var(--pb-mono)"
                        fontSize="8px"
                        fontWeight={700}
                        color={balanceAccent}
                        letterSpacing="0.04em"
                        textTransform="uppercase"
                        noOfLines={1}
                      >
                        {balanceLabel}
                      </Text>
                    </HStack>

                    <Text
                      fontFamily="var(--pb-serif)"
                      fontSize={{ base: 'md', sm: 'lg' }}
                      fontWeight={600}
                      color={balanceAccent}
                      textAlign="right"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatCurrency(Math.abs(member.balance))}
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            )
          })}
        </VStack>
      </Box>
    </PremiumModal>
  )
}
