import {
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Check, CheckCircle2, Lightbulb, ReceiptText as Receipt, Wallet } from '../../components/ui/icons'
import { SectionShell, fadeUp } from './shared'
import { DEMO } from './landing.config'

const MotionBox = motion.create(Box)

const STAGE_COUNT = DEMO.steps.length
const STAGE_MS = 3200
const EASE = [0.32, 0.72, 0, 1] as const

/**
 * Simulated product journey: log a transaction → balance updates →
 * budget recalculates → a positive insight appears.
 *
 * Auto-advances while in view; each step is also a button so the journey
 * is fully explorable by keyboard. Under prefers-reduced-motion the demo
 * renders the final state with no cycling.
 */
export default function ProductDemo() {
  const reduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inView = useInView(rootRef, { amount: 0.3 })

  // Stage the user is looking at. Reduced motion → everything settled.
  const [stage, setStage] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (reduceMotion) {
      setStage(STAGE_COUNT - 1)
      return
    }
    if (!inView || paused) return
    const t = setTimeout(() => setStage((s) => (s + 1) % STAGE_COUNT), STAGE_MS)
    return () => clearTimeout(t)
  }, [stage, inView, paused, reduceMotion])

  const sectionBg = useColorModeValue('white', 'black')

  return (
    <SectionShell
      id="demo"
      bg={sectionBg}
      eyebrow={DEMO.eyebrow}
      title={DEMO.title}
      subtitle={DEMO.subtitle}
    >
      <Box ref={rootRef}>
        <Grid
          templateColumns={{ base: '1fr', lg: '5fr 7fr' }}
          gap={{ base: 8, lg: 14 }}
          alignItems="center"
        >
          {/* ── Step list ── */}
          <GridItem>
            <VStack as="ol" align="stretch" spacing={2} listStyleType="none" m={0} p={0}>
              {DEMO.steps.map((step, i) => (
                <MotionBox
                  as="li"
                  key={step.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                >
                  <StepRow
                    index={i}
                    step={step}
                    isActive={stage === i}
                    isDone={stage > i}
                    showProgress={!reduceMotion && inView && !paused}
                    onSelect={() => {
                      setStage(i)
                      setPaused(true)
                    }}
                  />
                </MotionBox>
              ))}
            </VStack>
          </GridItem>

          {/* ── Demo canvas ── */}
          <GridItem>
            <MotionBox {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }}>
              <DemoCanvas stage={stage} reduceMotion={Boolean(reduceMotion)} />
            </MotionBox>
          </GridItem>
        </Grid>
      </Box>
    </SectionShell>
  )
}

/* -------------------------------------------------------------------------- */
/* Step row                                                                    */
/* -------------------------------------------------------------------------- */

interface StepRowProps {
  index: number
  step: (typeof DEMO.steps)[number]
  isActive: boolean
  isDone: boolean
  showProgress: boolean
  onSelect: () => void
}

function StepRow({ index, step, isActive, isDone, showProgress, onSelect }: StepRowProps) {
  const activeBg = useColorModeValue('white', 'rgba(255,255,255,0.04)')
  const activeBorder = useColorModeValue('blue.200', 'rgba(96,165,250,0.4)')
  const idleBorder = useColorModeValue('transparent', 'transparent')
  const titleColor = useColorModeValue('gray.900', 'whiteAlpha.900')
  const subText = useColorModeValue('gray.600', 'gray.400')
  const idleIcon = useColorModeValue('gray.400', 'gray.500')
  const accent = useColorModeValue('blue.600', 'blue.300')
  const doneAccent = useColorModeValue('green.500', 'green.300')
  const iconBgActive = useColorModeValue('blue.50', 'rgba(59,130,246,0.14)')
  const iconBgIdle = useColorModeValue('gray.50', 'whiteAlpha.100')
  const trackBg = useColorModeValue('blue.100', 'rgba(96,165,250,0.2)')
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const activeShadow = useColorModeValue(
    '0 14px 34px -18px rgba(37,99,235,0.4)',
    '0 14px 34px -18px rgba(0,0,0,0.7)',
  )

  return (
    <Box
      as="button"
      type="button"
      onClick={onSelect}
      aria-current={isActive ? 'step' : undefined}
      aria-label={`Step ${index + 1}: ${step.title}`}
      textAlign="left"
      w="full"
      p={{ base: 4, md: 5 }}
      borderRadius="2xl"
      bg={isActive ? activeBg : 'transparent'}
      border="1px solid"
      borderColor={isActive ? activeBorder : idleBorder}
      boxShadow={isActive ? activeShadow : 'none'}
      transition="all 0.3s cubic-bezier(0.32, 0.72, 0, 1)"
      _hover={{ bg: isActive ? activeBg : hoverBg }}
      _focusVisible={{ outline: 'none', boxShadow: '0 0 0 2px rgba(59,130,246,0.5)' }}
      position="relative"
      overflow="hidden"
    >
      <HStack align="flex-start" spacing={4}>
        <Flex
          w={10}
          h={10}
          align="center"
          justify="center"
          borderRadius="xl"
          flexShrink={0}
          bg={isActive || isDone ? iconBgActive : iconBgIdle}
          color={isDone ? doneAccent : isActive ? accent : idleIcon}
          transition="all 0.3s ease"
        >
          <Icon as={isDone ? Check : step.icon} boxSize={5} weight="duotone" />
        </Flex>
        <VStack align="flex-start" spacing={0.5} flex={1} minW={0}>
          <Text fontWeight={700} fontSize="md" color={titleColor} letterSpacing="-0.01em">
            {step.title}
          </Text>
          <Text fontSize="sm" color={subText} lineHeight={1.5}>
            {step.description}
          </Text>
        </VStack>
      </HStack>

      {/* Auto-advance progress for the active step */}
      {isActive && showProgress && (
        <Box
          aria-hidden
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          h="2px"
          bg={trackBg}
        >
          <Box
            key={index}
            h="full"
            bgGradient="linear(90deg, #3b82f6, #8b5cf6)"
            transformOrigin="left"
            sx={{
              animation: `demoStepFill ${STAGE_MS}ms linear both`,
              '@keyframes demoStepFill': {
                from: { transform: 'scaleX(0)' },
                to: { transform: 'scaleX(1)' },
              },
            }}
          />
        </Box>
      )}
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/* Demo canvas — the simulated app surface                                     */
/* -------------------------------------------------------------------------- */

function DemoCanvas({ stage, reduceMotion }: { stage: number; reduceMotion: boolean }) {
  const f = DEMO.figures
  const cur = f.currency
  const fmt = (n: number) =>
    `${cur}${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const balanceUpdated = stage >= 1
  const budgetUpdated = stage >= 2
  const showInsight = stage >= 3

  const spent = budgetUpdated ? f.budgetSpentAfter : f.budgetSpentBefore
  const budgetPct = Math.round((spent / f.budgetTotal) * 100)

  const surface = useColorModeValue('rgba(255,255,255,0.92)', 'rgba(15,17,21,0.86)')
  const surfaceBorder = useColorModeValue('rgba(15,23,42,0.08)', 'rgba(255,255,255,0.08)')
  const cardBg = useColorModeValue(
    'linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)',
    'linear-gradient(135deg,rgba(25,27,34,0.65) 0%,rgba(12,13,17,0.78) 100%)',
  )
  const cardBorder = useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.05)')
  const text = useColorModeValue('gray.900', 'whiteAlpha.900')
  const subText = useColorModeValue('gray.500', 'gray.400')
  const expenseAccent = useColorModeValue('red.500', 'red.300')
  const expenseBg = useColorModeValue('red.50', 'rgba(248,113,113,0.10)')
  const balanceAccent = useColorModeValue('blue.600', 'blue.300')
  const greenAccent = useColorModeValue('green.600', 'green.300')
  const insightBg = useColorModeValue('green.50', 'rgba(34,197,94,0.10)')
  const insightBorder = useColorModeValue('green.200', 'rgba(34,197,94,0.35)')
  const trackBg = useColorModeValue('gray.100', 'whiteAlpha.200')
  const barFill = useColorModeValue(
    'linear-gradient(90deg,#3b82f6 0%,#6366f1 100%)',
    'linear-gradient(90deg,#60a5fa 0%,#818cf8 100%)',
  )
  const savedBg = useColorModeValue('green.50', 'rgba(34,197,94,0.12)')
  const balanceIconBg = useColorModeValue('blue.50', 'rgba(59,130,246,0.12)')
  const insightIconBg = useColorModeValue('white', 'rgba(255,255,255,0.06)')
  const shadow = useColorModeValue(
    '0 30px 60px -20px rgba(15,23,42,0.22), 0 18px 40px -25px rgba(15,23,42,0.14)',
    '0 30px 60px -20px rgba(0,0,0,0.65), 0 18px 40px -25px rgba(0,0,0,0.55)',
  )

  const swap = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.35, ease: EASE },
      }

  return (
    <Box
      role="img"
      aria-label="Animated demo: a logged expense updating the balance, the category budget and a spending insight"
      position="relative"
      borderRadius="2xl"
      bg={surface}
      border="1px solid"
      borderColor={surfaceBorder}
      backdropFilter="saturate(180%) blur(24px)"
      boxShadow={shadow}
      p={{ base: 4, md: 6 }}
    >
      <VStack align="stretch" spacing={3}>
        {/* 1 · New transaction */}
        <Box
          p={4}
          borderRadius="xl"
          bg={cardBg}
          border="1px solid"
          borderColor={stage === 0 ? balanceAccent : cardBorder}
          transition="border-color 0.4s ease"
        >
          <HStack justify="space-between" mb={2.5}>
            <Text fontSize="2xs" color={subText} fontWeight={700} letterSpacing="0.08em" textTransform="uppercase">
              New transaction
            </Text>
            <AnimatePresence>
              {stage >= 1 && (
                <MotionBox {...swap}>
                  <HStack spacing={1} px={2} py={0.5} borderRadius="full" bg={savedBg} color={greenAccent}>
                    <Icon as={CheckCircle2} boxSize={3} weight="fill" />
                    <Text fontSize="2xs" fontWeight={800}>Saved</Text>
                  </HStack>
                </MotionBox>
              )}
            </AnimatePresence>
          </HStack>
          <HStack spacing={3}>
            <Flex
              w={9}
              h={9}
              align="center"
              justify="center"
              borderRadius="lg"
              bg={expenseBg}
              color={expenseAccent}
              flexShrink={0}
            >
              <Icon as={Receipt} boxSize={4} weight="duotone" />
            </Flex>
            <Text flex={1} fontSize="sm" fontWeight={600} color={text} noOfLines={1}>
              {f.txLabel}
            </Text>
            <Text fontSize="sm" fontWeight={800} color={expenseAccent}>
              −{fmt(f.txAmount)}
            </Text>
          </HStack>
        </Box>

        {/* 2 · Balance */}
        <Box
          p={4}
          borderRadius="xl"
          bg={cardBg}
          border="1px solid"
          borderColor={stage === 1 ? balanceAccent : cardBorder}
          transition="border-color 0.4s ease"
        >
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Flex
                w={9}
                h={9}
                align="center"
                justify="center"
                borderRadius="lg"
                bg={balanceIconBg}
                color={balanceAccent}
                flexShrink={0}
              >
                <Icon as={Wallet} boxSize={4} weight="duotone" />
              </Flex>
              <Text fontSize="2xs" color={subText} fontWeight={700} letterSpacing="0.08em" textTransform="uppercase">
                Current balance
              </Text>
            </HStack>
            <Box position="relative" minW="110px" textAlign="right">
              <AnimatePresence mode="popLayout" initial={false}>
                <MotionBox key={balanceUpdated ? 'after' : 'before'} {...swap}>
                  <Text fontSize="xl" fontWeight={800} color={text} letterSpacing="-0.03em">
                    {fmt(balanceUpdated ? f.balanceAfter : f.balanceBefore)}
                  </Text>
                </MotionBox>
              </AnimatePresence>
            </Box>
          </HStack>
        </Box>

        {/* 3 · Budget */}
        <Box
          p={4}
          borderRadius="xl"
          bg={cardBg}
          border="1px solid"
          borderColor={stage === 2 ? balanceAccent : cardBorder}
          transition="border-color 0.4s ease"
        >
          <HStack justify="space-between" mb={2.5}>
            <Text fontSize="2xs" color={subText} fontWeight={700} letterSpacing="0.08em" textTransform="uppercase">
              {f.budgetCategory} budget
            </Text>
            <Text fontSize="xs" fontWeight={700} color={text}>
              {fmt(spent)} <Text as="span" color={subText} fontWeight={600}>of {fmt(f.budgetTotal)}</Text>
            </Text>
          </HStack>
          <Box
            h="10px"
            borderRadius="full"
            bg={trackBg}
            overflow="hidden"
            role="presentation"
          >
            <Box
              h="full"
              borderRadius="full"
              bg={barFill}
              w={`${budgetPct}%`}
              transition={reduceMotion ? 'none' : 'width 0.7s cubic-bezier(0.32, 0.72, 0, 1)'}
            />
          </Box>
          <Text fontSize="2xs" color={subText} fontWeight={600} mt={1.5}>
            {budgetPct}% used · {fmt(f.budgetTotal - spent)} left this month
          </Text>
        </Box>

        {/* 4 · Insight */}
        <Box minH="64px">
          <AnimatePresence>
            {showInsight && (
              <MotionBox
                {...(reduceMotion
                  ? {}
                  : {
                      initial: { opacity: 0, y: 10, scale: 0.98 },
                      animate: { opacity: 1, y: 0, scale: 1 },
                      exit: { opacity: 0, y: -6 },
                      transition: { duration: 0.4, ease: EASE },
                    })}
                p={4}
                borderRadius="xl"
                bg={insightBg}
                border="1px solid"
                borderColor={insightBorder}
              >
                <HStack spacing={3} align="flex-start">
                  <Flex
                    w={9}
                    h={9}
                    align="center"
                    justify="center"
                    borderRadius="lg"
                    bg={insightIconBg}
                    color={greenAccent}
                    flexShrink={0}
                  >
                    <Icon as={Lightbulb} boxSize={4} weight="duotone" />
                  </Flex>
                  <VStack align="flex-start" spacing={0.5}>
                    <Heading as="p" fontSize="sm" fontWeight={800} color={greenAccent} letterSpacing="-0.01em">
                      Looking good
                    </Heading>
                    <Text fontSize="sm" color={text} lineHeight={1.5}>
                      {f.insight}
                    </Text>
                  </VStack>
                </HStack>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>
      </VStack>
    </Box>
  )
}
