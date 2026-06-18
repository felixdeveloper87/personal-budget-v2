import { motion } from 'framer-motion'
import { Box } from '@chakra-ui/react'

export const MotionBox = motion(Box)

export const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

export const riseV = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.2, 0.65, 0.2, 1] as const },
  },
}

export const barV = {
  hidden: { scaleX: 0 },
  show: {
    scaleX: 1,
    transition: { duration: 0.9, ease: [0.2, 0.7, 0.2, 1] as const, delay: 0.25 },
  },
}
