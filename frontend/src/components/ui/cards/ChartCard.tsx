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
      bg="linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)"
      _dark={{ bg: '#111111' }}
    >
      {children}
    </Box>
  )
}
