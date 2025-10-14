import { Box } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface FormCardProps {
  children: ReactNode
}

export default function FormCard({ children }: FormCardProps) {
  return (
    <Box
      p={4}
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
