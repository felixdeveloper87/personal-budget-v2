import {
  Avatar,
  Badge,
  Box,
  Divider,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { ModalHeader, PremiumModal } from '../ui'
import { User as UserIcon, Mail, Shield } from '../ui/icons'
import PaymentMethodsSection from '../../sections/PaymentMethodsSection'
import type { User, UserPlan } from '../../types'
import { useEd } from '../../editorial'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

const PLAN_META: Record<UserPlan, { label: string; colorScheme: string; description: string }> = {
  STANDARD: { label: 'Standard', colorScheme: 'gray', description: 'Free tier — all core features included' },
  PREMIUM: { label: 'Premium', colorScheme: 'yellow', description: 'Full access to all features and reports' },
}

export default function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
  const ed = useEd()
  const fallbackSurfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const fallbackBodyBg = useColorModeValue('gray.50', '#0a0a0a')
  const surfaceBg = ed?.solid ?? fallbackSurfaceBg
  const bodyBg = ed?.bg ?? fallbackBodyBg
  const textColorBase = useColorModeValue('gray.900', 'gray.50')
  const textColor = ed?.cream ?? textColorBase
  const mutedColorBase = useColorModeValue('gray.500', 'gray.400')
  const mutedColor = ed?.muted ?? mutedColorBase
  const borderColorBase = useColorModeValue('gray.100', 'whiteAlpha.100')
  const borderColor = ed?.line ?? borderColorBase
  const defaultAvatarRing = useColorModeValue(
    'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    'linear-gradient(135deg, #60a5fa, #a78bfa)',
  )
  const avatarRing = ed ? `linear-gradient(135deg, ${ed.jade}, ${ed.gold})` : defaultAvatarRing
  const defaultHeroBg = useColorModeValue(
    'linear-gradient(135deg, #eff6ff 0%, #eef2ff 50%, #faf5ff 100%)',
    'linear-gradient(135deg, rgba(96,165,250,0.06) 0%, rgba(167,139,250,0.06) 100%)',
  )
  const heroBg = ed
    ? `linear-gradient(135deg, ${ed.jadeSoft}, ${ed.panelRaised} 55%, ${ed.gold}12)`
    : defaultHeroBg
  const fieldLabelColorBase = useColorModeValue('gray.500', 'gray.500')
  const fieldLabelColor = ed?.muted ?? fieldLabelColorBase
  const fieldValueColorBase = useColorModeValue('gray.800', 'gray.100')
  const fieldValueColor = ed?.cream ?? fieldValueColorBase
  const fieldBgBase = useColorModeValue('gray.50', 'whiteAlpha.50')
  const fieldBg = ed?.panelRaised ?? fieldBgBase
  const sectionTitleColorBase = useColorModeValue('gray.700', 'gray.200')
  const sectionTitleColor = ed?.muted ?? sectionTitleColorBase
  const statusDotBgBase = useColorModeValue('green.400', 'green.300')
  const statusDotBg = ed ? 'var(--pb-income)' : statusDotBgBase
  const statusDotRingBase = useColorModeValue('white', 'gray.900')
  const statusDotRing = ed?.solid ?? statusDotRingBase

  if (!user) return null

  const plan = user.plan ?? 'STANDARD'
  const planMeta = PLAN_META[plan]
  const displayName = user.name || 'Budget User'

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '2xl' }}
      header={
        <ModalHeader
          icon={UserIcon}
          title="Profile"
          caption="Account details and payment methods"
          onClose={onClose}
          accent="blue"
        />
      }
    >
      <Box flex="1" bg={bodyBg} overflowY="auto">

        {/* Hero card */}
        <Box
          mx={{ base: 4, sm: 6, md: 8 }}
          mt={{ base: 4, sm: 6, md: 8 }}
          p={5}
          bg={heroBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="2xl"
          overflow="hidden"
          position="relative"
        >
          {/* Decorative gradient blob */}
          <Box
            aria-hidden
            position="absolute"
            top="-40px"
            right="-40px"
            w="140px"
            h="140px"
            borderRadius="full"
            background={ed ? `radial-gradient(circle, ${ed.jadeSoft} 0%, transparent 70%)` : 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)'}
            pointerEvents="none"
          />
          <HStack spacing={4} align="center">
            <Box
              position="relative"
              p="3px"
              borderRadius="full"
              background={avatarRing}
              flexShrink={0}
            >
              <Avatar size="lg" name={displayName} bg={ed?.jade ?? 'blue.500'} color={ed?.onAccent ?? 'white'} fontWeight={700} />
              <Box
                position="absolute"
                bottom="2px"
                right="2px"
                w="14px"
                h="14px"
                borderRadius="full"
                bg={statusDotBg}
                border="2.5px solid"
                borderColor={statusDotRing}
              />
            </Box>
            <VStack spacing={1} align="start" flex={1} minW={0}>
              <HStack spacing={2} flexWrap="wrap">
                <Text fontSize="lg" fontWeight={800} color={textColor} letterSpacing="-0.02em">
                  {displayName}
                </Text>
                <Badge
                  fontSize="2xs"
                  fontWeight={700}
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  colorScheme={planMeta.colorScheme}
                  textTransform="none"
                  letterSpacing="0.02em"
                >
                  {planMeta.label}
                </Badge>
              </HStack>
              <Text fontSize="sm" color={mutedColor}>{user.email}</Text>
              <Text fontSize="xs" color={mutedColor} mt={0.5}>{planMeta.description}</Text>
            </VStack>
          </HStack>
        </Box>

        <VStack spacing={4} align="stretch" px={{ base: 4, sm: 6, md: 8 }} py={4} pb={{ base: 6, md: 8 }}>

          {/* Account details */}
          <Box>
            <Text
              fontSize="xs"
              fontWeight={700}
              color={sectionTitleColor}
              letterSpacing="0.06em"
              textTransform="uppercase"
              mb={2}
            >
              Account details
            </Text>
            <VStack spacing={0} align="stretch" border="1px solid" borderColor={borderColor} borderRadius="xl" overflow="hidden">
              <HStack
                px={4}
                py={3}
                bg={surfaceBg}
                spacing={3}
                borderBottom="1px solid"
                borderColor={borderColor}
              >
                <Box
                  p={1.5}
                  borderRadius="md"
                  bg={fieldBg}
                  border="1px solid"
                  borderColor={borderColor}
                  flexShrink={0}
                >
                  <Icon as={UserIcon} boxSize={3.5} color={mutedColor} />
                </Box>
                <Box flex={1} minW={0}>
                  <Text fontSize="2xs" fontWeight={600} color={fieldLabelColor} letterSpacing="0.04em" textTransform="uppercase">Full name</Text>
                  <Text fontSize="sm" fontWeight={600} color={fieldValueColor} noOfLines={1}>{displayName}</Text>
                </Box>
              </HStack>
              <HStack
                px={4}
                py={3}
                bg={surfaceBg}
                spacing={3}
                borderBottom="1px solid"
                borderColor={borderColor}
              >
                <Box
                  p={1.5}
                  borderRadius="md"
                  bg={fieldBg}
                  border="1px solid"
                  borderColor={borderColor}
                  flexShrink={0}
                >
                  <Icon as={Mail} boxSize={3.5} color={mutedColor} />
                </Box>
                <Box flex={1} minW={0}>
                  <Text fontSize="2xs" fontWeight={600} color={fieldLabelColor} letterSpacing="0.04em" textTransform="uppercase">Email</Text>
                  <Text fontSize="sm" fontWeight={600} color={fieldValueColor} noOfLines={1}>{user.email}</Text>
                </Box>
              </HStack>
              <HStack px={4} py={3} bg={surfaceBg} spacing={3}>
                <Box
                  p={1.5}
                  borderRadius="md"
                  bg={fieldBg}
                  border="1px solid"
                  borderColor={borderColor}
                  flexShrink={0}
                >
                  <Icon as={Shield} boxSize={3.5} color={mutedColor} />
                </Box>
                <Box flex={1} minW={0}>
                  <Text fontSize="2xs" fontWeight={600} color={fieldLabelColor} letterSpacing="0.04em" textTransform="uppercase">Plan</Text>
                  <HStack spacing={2}>
                    <Text fontSize="sm" fontWeight={600} color={fieldValueColor}>{planMeta.label}</Text>
                    <Badge
                      fontSize="2xs"
                      fontWeight={700}
                      px={1.5}
                      py={0.5}
                      borderRadius="full"
                      colorScheme={planMeta.colorScheme}
                      textTransform="none"
                    >
                      {planMeta.label}
                    </Badge>
                  </HStack>
                </Box>
              </HStack>
            </VStack>
          </Box>

          <Divider borderColor={borderColor} />

          {/* Payment methods */}
          <Box>
            <Text
              fontSize="xs"
              fontWeight={700}
              color={sectionTitleColor}
              letterSpacing="0.06em"
              textTransform="uppercase"
              mb={2}
            >
              Payment methods
            </Text>
            <PaymentMethodsSection />
          </Box>

        </VStack>
      </Box>
    </PremiumModal>
  )
}
