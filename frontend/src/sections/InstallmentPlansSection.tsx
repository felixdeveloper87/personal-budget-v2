import React, { useEffect, useState } from 'react'
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  Icon,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { FiCreditCard } from 'react-icons/fi'
import { useThemeColors } from '../hooks/useThemeColors'
import { InstallmentPlanCard } from '../components/installments'
import { InstallmentPlan } from '../types'
import { listInstallmentPlans } from '../api'

/**
 * 💳 InstallmentPlansSection
 * Displays all active installment plans for the logged user
 */
export default function InstallmentPlansSection() {
  const colors = useThemeColors()
  const [plans, setPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const data = await listInstallmentPlans()
      setPlans(data)
    } catch (err) {
      console.error('Error fetching installment plans:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handlePlanDeleted = () => {
    fetchPlans() // Refresh list after deletion
  }

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color={colors.accent} />
      </Center>
    )
  }

  if (plans.length === 0) {
    return (
      <VStack
        spacing={4}
        py={10}
        px={5}
        bg={colors.bg}
        borderRadius="xl"
        border="1px dashed"
        borderColor={colors.border}
      >
        <Icon as={FiCreditCard} fontSize="4xl" color={colors.text.secondary} />
        <Text color={colors.text.secondary} fontSize="lg" textAlign="center">
          No active installment plans
        </Text>
        <Text color={colors.text.secondary} fontSize="sm" textAlign="center">
          Create installment expenses in the form above
        </Text>
      </VStack>
    )
  }

  return (
    <Box w="full">
      <Heading
        as="h2"
        size="lg"
        mb={6}
        display="flex"
        alignItems="center"
        gap={2}
        color={colors.text}
      >
        <Icon as={FiCreditCard} />
        Active Installment Plans
      </Heading>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
        {plans.map((plan) => (
          <InstallmentPlanCard key={plan.id} plan={plan} onDeleted={handlePlanDeleted} />
        ))}
      </SimpleGrid>
    </Box>
  )
}

