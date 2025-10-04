import {
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Box,
  useColorModeValue,
} from '@chakra-ui/react'
import { ReactNode } from 'react'

interface DashboardSectionProps {
  title: string
  children: ReactNode
}

export default function DashboardSection({ title, children }: DashboardSectionProps) {
  const defaultAccordionButtonProps = {
    px: 4,
    py: 3,
    borderRadius: 'xl',
    bg: useColorModeValue('gray.400', 'gray.700'),
    color: useColorModeValue('white', 'gray.100'),
    fontWeight: 'semibold',
    _hover: { bg: useColorModeValue('gray.500', 'gray.600') },
    _expanded: {
      bg: useColorModeValue('blue.400', 'blue.700'),
      color: useColorModeValue('white', 'gray.100'),
    },
  }

  return (
    <AccordionItem border="none">
      <h2>
        <AccordionButton {...defaultAccordionButtonProps}>
          <Box flex="1" textAlign="left" fontWeight="semibold">
            {title}
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={6}>{children}</AccordionPanel>
    </AccordionItem>
  )
}
