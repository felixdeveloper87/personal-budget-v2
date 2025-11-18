import { Box, Button, Flex, HStack, Icon, VStack, Text, Heading, useColorModeValue } from '@chakra-ui/react'
import { Search, X } from 'lucide-react'
import { getModalHeaderStyles } from '../ui'

interface SearchHeaderProps {
  onClose: () => void
}

export default function SearchHeader({ onClose }: SearchHeaderProps) {
  const headerStyles = getModalHeaderStyles(useColorModeValue)
  
  return (
    <Box 
      {...headerStyles.container}
      sx={{
        ...headerStyles.container.sx,
        paddingTop: 'max(56px, env(safe-area-inset-top, 56px))',
      }}
    >
      <HStack
        spacing={{ base: 2, sm: 3 }}
        align="center"
        justify="space-between"
        flexWrap="nowrap"
        pr={{ base: 2, sm: 4 }}
        pt={{ base: 2, sm: 0 }}
      >
        {/* Logo + Text */}
        <HStack spacing={4} align="center" flex="1" minW={0}>
          <Box {...headerStyles.iconContainer}>
            <Icon as={Search} boxSize={6} color="white" />
          </Box>
          <VStack align="start" spacing={1} flex="1" minW={0}>
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
        {/* Close Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          bg={useColorModeValue(headerStyles.closeButton.bg.light, headerStyles.closeButton.bg.dark)}
          border="1px solid"
          borderColor={useColorModeValue(headerStyles.closeButton.borderColor.light, headerStyles.closeButton.borderColor.dark)}
          borderRadius={headerStyles.closeButton.borderRadius}
          p={headerStyles.closeButton.p}
          _hover={headerStyles.closeButton._hover}
          transition={headerStyles.closeButton.transition}
          flexShrink={0}
        >
          <Icon as={X} boxSize={headerStyles.closeButton.iconSize} color={useColorModeValue(headerStyles.closeButton.iconColor.light, headerStyles.closeButton.iconColor.dark)} />
        </Button>
      </HStack>
    </Box>
  )
}
