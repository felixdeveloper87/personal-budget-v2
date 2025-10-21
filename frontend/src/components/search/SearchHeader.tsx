import { Box, Button, Flex, HStack, Icon, VStack, Text, Heading, useColorModeValue } from '@chakra-ui/react'
import { Search, X } from 'lucide-react'
import { getModalHeaderStyles } from '../ui'

interface SearchHeaderProps {
  onClose: () => void
}

export default function SearchHeader({ onClose }: SearchHeaderProps) {
  const headerStyles = getModalHeaderStyles(useColorModeValue)
  
  return (
    <Box {...headerStyles.container}>
      {/* Fixed close button in top right corner */}
      <Button
        onClick={onClose}
        {...headerStyles.closeButton}
      >
        <Icon as={X} boxSize={headerStyles.closeButton.iconSize} color={headerStyles.closeButton.iconColor} />
      </Button>

      <Flex {...headerStyles.content}>
        <HStack spacing={4} align="center">
          <Box {...headerStyles.iconContainer}>
            <Icon as={Search} boxSize={6} color="white" />
          </Box>
          <VStack align="start" spacing={1}>
            <Heading
              size={{ base: 'md', sm: 'lg' }}
              {...headerStyles.title}
            >
              Search Transactions
            </Heading>
            <Text {...headerStyles.subtitle}>
              Find your transactions quickly
            </Text>
          </VStack>
        </HStack>
      </Flex>
    </Box>
  )
}
