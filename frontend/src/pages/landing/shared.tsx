import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  type BoxProps,
  type ContainerProps,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'

/* -------------------------------------------------------------------------- */
/* Eyebrow                                                                    */
/* -------------------------------------------------------------------------- */

interface EyebrowProps {
  children: ReactNode
}

export function Eyebrow({ children }: EyebrowProps) {
  const color = useColorModeValue('blue.600', 'blue.300')
  const bg = useColorModeValue('blue.50', 'whiteAlpha.100')
  const border = useColorModeValue('blue.100', 'whiteAlpha.200')
  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      px={3}
      py={1}
      borderRadius="full"
      bg={bg}
      color={color}
      border="1px solid"
      borderColor={border}
      fontSize="xs"
      fontWeight={700}
      letterSpacing="0.08em"
      textTransform="uppercase"
    >
      {children}
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/* SectionShell — vertical rhythm + max-width, with an optional title block   */
/* -------------------------------------------------------------------------- */

interface SectionShellProps extends Omit<BoxProps, 'title'> {
  id?: string
  containerProps?: ContainerProps
  eyebrow?: string
  title?: ReactNode
  subtitle?: ReactNode
  align?: 'center' | 'start'
  children: ReactNode
}

export function SectionShell({
  id,
  containerProps,
  eyebrow,
  title,
  subtitle,
  align = 'center',
  children,
  ...rest
}: SectionShellProps) {
  const subColor = useColorModeValue('gray.600', 'gray.400')
  return (
    <Box
      as="section"
      id={id}
      position="relative"
      py={{ base: 12, md: 16, lg: 20 }}
      {...rest}
    >
      <Container
        maxW={{ base: '100%', xl: '1200px', '2xl': '1320px' }}
        px={{ base: 4, md: 8, lg: 12 }}
        position="relative"
        zIndex={1}
        {...containerProps}
      >
        {(eyebrow || title || subtitle) && (
          <VStack
            spacing={4}
            textAlign={align}
            align={align === 'center' ? 'center' : 'start'}
            mb={{ base: 10, md: 14 }}
            maxW={align === 'center' ? '760px' : undefined}
            mx={align === 'center' ? 'auto' : undefined}
          >
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {title && (
              <Heading
                as="h2"
                fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                fontWeight={800}
                letterSpacing="-0.03em"
                lineHeight={1.05}
              >
                {title}
              </Heading>
            )}
            {subtitle && (
              <Text fontSize={{ base: 'md', md: 'lg' }} color={subColor} lineHeight={1.55}>
                {subtitle}
              </Text>
            )}
          </VStack>
        )}
        {children}
      </Container>
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/* GlowOrb — decorative radial gradient, used to break flat backgrounds       */
/* -------------------------------------------------------------------------- */

interface GlowOrbProps extends BoxProps {
  /** CSS color used for the radial center */
  color?: string
  /** Size in CSS units */
  size?: string | number
  /** Opacity 0..1 */
  intensity?: number
}

export function GlowOrb({
  color = 'rgba(59,130,246,0.5)',
  size = '520px',
  intensity = 0.5,
  ...rest
}: GlowOrbProps) {
  return (
    <Box
      aria-hidden
      position="absolute"
      pointerEvents="none"
      w={size}
      h={size}
      filter="blur(80px)"
      opacity={intensity}
      bg={`radial-gradient(circle, ${color} 0%, transparent 60%)`}
      {...rest}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* GridLines — faint grid, used behind the Hero for that fintech vibe         */
/* -------------------------------------------------------------------------- */

export function GridLines(props: BoxProps) {
  const lineColor = useColorModeValue('rgba(15, 23, 42, 0.06)', 'rgba(255, 255, 255, 0.05)')
  return (
    <Box
      aria-hidden
      position="absolute"
      inset={0}
      pointerEvents="none"
      bgImage={`
        linear-gradient(${lineColor} 1px, transparent 1px),
        linear-gradient(90deg, ${lineColor} 1px, transparent 1px)
      `}
      bgSize="64px 64px"
      sx={{
        // Soft fade to the section content so the grid never competes
        maskImage:
          'radial-gradient(ellipse at center, black 35%, transparent 80%)',
        WebkitMaskImage:
          'radial-gradient(ellipse at center, black 35%, transparent 80%)',
      }}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Motion presets                                                              */
/* -------------------------------------------------------------------------- */

/** Standard fade-up reveal — used by every section header / card. */
export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] },
}

export const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: 'easeOut' as const },
}

export function staggerChildren(delay = 0.08) {
  return (i: number) => ({
    ...fadeUp,
    transition: { ...fadeUp.transition, delay: i * delay },
  })
}
