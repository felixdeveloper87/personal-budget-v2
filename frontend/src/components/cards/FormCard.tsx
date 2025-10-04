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
      bg="white"
      _dark={{ bg: '#111111' }}
    >
      {children}
    </Box>
  )
}
