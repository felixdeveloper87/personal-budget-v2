import { Box, Button, HStack, useColorModeValue } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { LANDING_SECTIONS, type LandingSectionId } from './navigation.config'

const scrollToSection = (id: LandingSectionId) => {
  const section = document.getElementById(id)
  if (!section) return
  section.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function LandingNav() {
  const [activeSection, setActiveSection] = useState<LandingSectionId | null>(null)

  const color = useColorModeValue('gray.600', 'gray.300')
  const activeColor = useColorModeValue('blue.600', 'blue.300')
  const hoverBg = useColorModeValue('rgba(37,99,235,0.06)', 'whiteAlpha.100')
  const hoverColor = useColorModeValue('blue.600', 'blue.300')
  const activeBg = useColorModeValue('rgba(37,99,235,0.08)', 'rgba(96,165,250,0.10)')
  const dotColor = useColorModeValue('#2563eb', '#60a5fa')
  const pillBg = useColorModeValue('rgba(255,255,255,0.65)', 'rgba(255,255,255,0.04)')
  const pillBorder = useColorModeValue('rgba(226,232,240,0.8)', 'rgba(255,255,255,0.08)')
  const pillShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 6px rgba(15,23,42,0.04)',
    'inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 6px rgba(0,0,0,0.2)',
  )

  useEffect(() => {
    const ids = LANDING_SECTIONS.map((s) => s.id as LandingSectionId)
    const visible = new Set<LandingSectionId>()
    const observers: IntersectionObserver[] = []

    const update = () => {
      setActiveSection(ids.find((id) => visible.has(id)) ?? null)
    }

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) visible.add(id)
          else visible.delete(id)
          update()
        },
        { threshold: 0.25 },
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <HStack
      spacing={0.5}
      display={{ base: 'none', md: 'flex' }}
      flexShrink={0}
      px={1}
      py={1}
      rounded="xl"
      bg={pillBg}
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor={pillBorder}
      boxShadow={pillShadow}
    >
      {LANDING_SECTIONS.map((section) => {
        const isActive = activeSection === section.id
        return (
          <Button
            key={section.id}
            variant="ghost"
            size="sm"
            h="34px"
            px={3.5}
            borderRadius="lg"
            fontWeight={isActive ? 700 : 500}
            fontSize="sm"
            letterSpacing="0.01em"
            color={isActive ? activeColor : color}
            bg={isActive ? activeBg : 'transparent'}
            position="relative"
            onClick={() => scrollToSection(section.id)}
            _hover={{ bg: isActive ? activeBg : hoverBg, color: hoverColor }}
            transition="all 0.2s ease"
            _focusVisible={{ outline: 'none', boxShadow: '0 0 0 2px rgba(59,130,246,0.4)' }}
          >
            {section.label}
            <Box
              position="absolute"
              bottom="5px"
              left="50%"
              w="3px"
              h="3px"
              borderRadius="full"
              bg={dotColor}
              pointerEvents="none"
              style={{
                transform: isActive ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0)',
                opacity: isActive ? 1 : 0,
                transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease',
              }}
            />
          </Button>
        )
      })}
    </HStack>
  )
}
