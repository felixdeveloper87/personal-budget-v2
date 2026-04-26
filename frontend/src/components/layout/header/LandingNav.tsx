import { Button, HStack, useColorModeValue } from '@chakra-ui/react'
import { LANDING_SECTIONS, type LandingSectionId } from './navigation.config'

const scrollToSection = (id: LandingSectionId) => {
  const section = document.getElementById(id)
  if (!section) return
  section.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function LandingNav() {
  const color = useColorModeValue('gray.700', 'gray.200')
  const hoverBg = useColorModeValue('blue.50', 'whiteAlpha.100')
  const hoverColor = useColorModeValue('blue.600', 'blue.300')

  return (
    <HStack
      spacing={1}
      display={{ base: 'none', md: 'flex' }}
      flexShrink={0}
    >
      {LANDING_SECTIONS.map((section) => (
        <Button
          key={section.id}
          variant="ghost"
          size="sm"
          h="36px"
          px={3}
          borderRadius="lg"
          fontWeight={600}
          color={color}
          onClick={() => scrollToSection(section.id)}
          _hover={{ bg: hoverBg, color: hoverColor }}
          transition="all 0.2s ease"
        >
          {section.label}
        </Button>
      ))}
    </HStack>
  )
}
