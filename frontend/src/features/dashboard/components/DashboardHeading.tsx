import { Box, Flex, Heading, Icon, Text } from '@chakra-ui/react'
import { LayoutDashboard } from '../../../components/ui/icons'

/** Editorial page lockup for the dashboard — mirrors the Transactions header. */
export default function DashboardHeading() {
  return (
    <Flex align="flex-start" gap=".9rem" mb="1.3rem">
      <Box
        w={{ base: '38px', sm: '46px' }}
        h={{ base: '38px', sm: '46px' }}
        borderRadius="13px"
        display="grid"
        placeItems="center"
        bg="var(--pb-tint-green)"
        border="1px solid rgba(45,106,79,.2)"
        color="var(--pb-forest)"
        flexShrink={0}
      >
        <Icon as={LayoutDashboard} boxSize={{ base: '19px', sm: '23px' }} />
      </Box>
      <Box>
        <Heading
          as="h1"
          fontWeight={400}
          fontSize="clamp(1.7rem,5vw,2.3rem)"
          letterSpacing="-.015em"
          lineHeight="1.05"
          color="var(--pb-ink)"
        >
          Overview
        </Heading>
        <Text mt=".25rem" color="var(--pb-ink-soft)" display={{ base: 'none', sm: 'block' }}>
          A clear read on your money for the selected period.
        </Text>
      </Box>
    </Flex>
  )
}
