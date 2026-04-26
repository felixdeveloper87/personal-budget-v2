import { Box, useColorModeValue } from '@chakra-ui/react'
import { Footer, Header } from '../components'
import {
  FAQ,
  FeaturesBento,
  FinalCTA,
  Hero,
  HowItWorks,
  TrustStrip,
} from './landing'

interface LandingPageProps {
  onGetStarted: () => void
}

/**
 * LandingPage
 * Composes the marketing experience from focused, single-responsibility
 * sections that live under `./landing/`. Keep this file thin: it only orders
 * the sections and wires the global page chrome (Header / Footer).
 */
export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const pageBg = useColorModeValue('white', 'black')

  return (
    <Box as="main" minH="100vh" display="flex" flexDirection="column" bg={pageBg}>
      <Header onLogin={onGetStarted} />
      <Hero onGetStarted={onGetStarted} />
      <FeaturesBento />
      <HowItWorks />
      <TrustStrip />
      <FAQ />
      <FinalCTA onGetStarted={onGetStarted} />
      <Footer />
    </Box>
  )
}
