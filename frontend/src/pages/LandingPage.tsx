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
