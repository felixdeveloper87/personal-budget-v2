import { Avatar, Box, HStack, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { ModalHeader, PremiumModal } from '../ui'
import { User as UserIcon } from '../ui/icons'
import PaymentMethodsSection from '../../sections/PaymentMethodsSection'
import type { User } from '../../types'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

export default function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const bodyBg = useColorModeValue('gray.50', '#0a0a0a')
  const textColor = useColorModeValue('gray.900', 'gray.50')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200')

  if (!user) return null

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '4xl' }}
      header={
        <ModalHeader
          icon={UserIcon}
          title="Profile"
          caption="Account details and payment methods"
          onClose={onClose}
          accent="blue"
        />
      }
      contentProps={{ bg: surfaceBg }}
    >
      <Box flex="1" bg={bodyBg} p={{ base: 4, sm: 6, md: 8 }} overflowY="auto">
        <VStack spacing={4} align="stretch">
          <Box
            bg={surfaceBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="xl"
            p={4}
          >
            <HStack spacing={3}>
              <Avatar size="md" name={user.name} bg="blue.500" color="white" />
              <Box minW={0}>
                <Text fontSize="md" fontWeight={800} color={textColor} noOfLines={1}>
                  {user.name}
                </Text>
                <Text fontSize="sm" color={mutedColor} noOfLines={1}>
                  {user.email}
                </Text>
              </Box>
            </HStack>
          </Box>

          <PaymentMethodsSection />
        </VStack>
      </Box>
    </PremiumModal>
  )
}
