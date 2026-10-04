import { Box, Text } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'
import { Target } from 'lucide-react'

import type { AppPage } from '../../components/layout/header/navigation.config'
import { useI18n } from '../../i18n'
import '../dashboard/theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import NuHero, { NuHeroBadge } from '../dashboard/components/NuHero'
import { NU_SHEET_PB, NU_SHEET_WRAP } from '../dashboard/components/nu'

interface PlanningPageProps {
  onPageChange?: (page: AppPage) => void
}

// Rebuilding from scratch in the Nubank pattern — sections get added here one at a time.
export default function PlanningPage(_props: PlanningPageProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <Box>
      {/* Purple page header — continues the app bar, like Earnings. */}
      <NuHero
        title={t('nav.planning.label')}
        action={<NuHeroBadge><Target size={18} strokeWidth={2.4} aria-hidden="true" /></NuHeroBadge>}
      >
        <Text mt={{ base: 3, md: 4 }} fontSize="sm" color="rgba(255,255,255,0.82)">
          {t('nav.planning.description')}
        </Text>
      </NuHero>

      {/* White sheet with rounded top tucked over the purple header. */}
      <Box {...NU_SHEET_WRAP}>
        <MotionBox
          className="nu-dashboard" pb={NU_SHEET_PB}
          variants={containerV}
          initial={reduce ? false : 'hidden'}
          animate="show"
          bg="var(--nu-page)"
          borderTopRadius="24px"
          borderBottomRadius={{ base: 0, md: '24px' }}
          overflow="hidden"
          boxShadow={{ base: 'none', md: '0 1px 2px rgba(31,31,36,0.04), 0 18px 48px -24px rgba(31,31,36,0.18)' }}
        >
          <MotionBox variants={riseV} px={{ base: 4, md: 6 }} pt={{ base: 5, md: 6 }} pb={{ base: 6, md: 8 }} minH="240px" />
        </MotionBox>
      </Box>
    </Box>
  )
}
