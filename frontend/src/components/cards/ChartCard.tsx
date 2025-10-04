import { Box } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface ChartCardProps {
  children: ReactNode
  padding?: number
}

export default function ChartCard({ children, padding = 6 }: ChartCardProps) {
  return (
    <Box
      w="full"
      p={padding}
      rounded="2xl"
      borderWidth="1px"
      shadow="lg"
      bg="white"
      _dark={{ bg: '#111111' }}
    >
      {children}
    </Box>
  )
}
