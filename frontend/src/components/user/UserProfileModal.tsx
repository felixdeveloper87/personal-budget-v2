import {
  Avatar,
  Badge,
  Box,
  HStack,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react'
import { PremiumModal } from '../ui'
import NuModalHeader from '../ui/NuModalHeader'
import { User as UserIcon, Mail, Shield, CreditCard } from '../ui/icons'
import PaymentMethodsSection from '../../sections/PaymentMethodsSection'
import type { User, UserPlan } from '../../types'
import { useThemeColors } from '../../hooks/useThemeColors'
import { useI18n } from '../../i18n'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

const PLAN_META: Record<UserPlan, { colorScheme: string }> = {
  STANDARD: { colorScheme: 'gray' },
  PREMIUM: { colorScheme: 'yellow' },
}

const NU_PURPLE = '#820ad1'

export default function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
  const { t } = useI18n()
  const colors = useThemeColors()

  if (!user) return null

  const plan = user.plan ?? 'STANDARD'
  const planLabel = t(plan === 'PREMIUM' ? 'plan.premium' : 'plan.standard')
  const planDescription = t(plan === 'PREMIUM' ? 'profile.plan.premiumDescription' : 'profile.plan.standardDescription')
  const colorScheme = PLAN_META[plan].colorScheme
  const displayName = user.name || t('user.defaultName')

  const IconTile = ({ icon }: { icon: typeof UserIcon }) => (
    <Box role="presentation" w={{ base: 8, sm: 10 }} h={{ base: 8, sm: 10 }} borderRadius="xl" bg={colors.bgSecondary} color={NU_PURPLE}
      display="flex" alignItems="center" justifyContent="center" flexShrink={0} aria-hidden>
      <Icon as={icon} boxSize={{ base: 4, sm: 5 }} sx={{ '& svg': { display: 'block' } }} />
    </Box>
  )

  const Card = ({ children }: { children: React.ReactNode }) => (
    <Box borderRadius="2xl" bg={colors.inputBg} border="2px solid" borderColor={colors.border}
      px={{ base: 3, sm: 4 }} py={{ base: 3, sm: 4 }}>
      {children}
    </Box>
  )

  const Field = ({ icon, label, children }: { icon: typeof UserIcon; label: string; children: React.ReactNode }) => (
    <HStack spacing={2.5} align="center">
      <IconTile icon={icon} />
      <Box flex={1} minW={0}>
        <Text fontSize={{ base: 'xs', sm: 'sm' }} fontWeight="600" color={colors.text.secondary} lineHeight="1.1">{label}</Text>
        <Box mt={1}>{children}</Box>
      </Box>
    </HStack>
  )

  const valueProps = { fontSize: { base: 'sm', sm: 'md' }, fontWeight: 600, color: colors.text.primary, noOfLines: 1 } as const

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'xl' }}
      contentProps={{ className: 'nu-dashboard' }}
      header={<NuModalHeader title={t('profile.title')} caption={t('profile.caption')} onClose={onClose} />}
    >
      <Box flex="1" bg="var(--nu-page, #ffffff)" p={{ base: 3, sm: 5, md: 6 }} overflowY="auto">
        <VStack align="stretch" spacing={3}>
          <Card>
            <HStack spacing={4} align="center">
              <Box position="relative" p="3px" borderRadius="full" bg={NU_PURPLE} flexShrink={0}>
                <Avatar size="lg" name={displayName} bg="#f3e8fc" color={NU_PURPLE} fontWeight={700} />
              </Box>
              <VStack spacing={1} align="start" flex={1} minW={0}>
                <HStack spacing={2} flexWrap="wrap">
                  <Text fontSize="lg" fontWeight={800} color={colors.text.primary} letterSpacing="-0.02em">{displayName}</Text>
                  <Badge fontSize="2xs" fontWeight={700} px={2} py={0.5} borderRadius="full" colorScheme={colorScheme} textTransform="none">{planLabel}</Badge>
                </HStack>
                <Text fontSize="sm" color={colors.text.secondary} noOfLines={1}>{user.email}</Text>
                <Text fontSize="xs" color={colors.text.secondary}>{planDescription}</Text>
              </VStack>
            </HStack>
          </Card>

          <Card>
            <VStack align="stretch" spacing={4}>
              <Field icon={UserIcon} label={t('profile.fullName')}><Text {...valueProps}>{displayName}</Text></Field>
              <Field icon={Mail} label={t('profile.email')}><Text {...valueProps}>{user.email}</Text></Field>
              <Field icon={Shield} label={t('profile.plan')}>
                <HStack spacing={2}>
                  <Text {...valueProps}>{planLabel}</Text>
                  <Badge fontSize="2xs" fontWeight={700} px={1.5} py={0.5} borderRadius="full" colorScheme={colorScheme} textTransform="none">{planLabel}</Badge>
                </HStack>
              </Field>
            </VStack>
          </Card>

          <Card>
            <HStack spacing={2.5} mb={3}>
              <IconTile icon={CreditCard} />
              <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight="600" color={colors.text.secondary}>{t('profile.paymentMethods')}</Text>
            </HStack>
            <PaymentMethodsSection />
          </Card>
        </VStack>
      </Box>
    </PremiumModal>
  )
}
