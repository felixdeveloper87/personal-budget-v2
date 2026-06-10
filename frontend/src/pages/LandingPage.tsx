import { Box, useColorModeValue } from '@chakra-ui/react'
import { Footer, Header } from '../components'
import {
  BenefitStrip,
  FAQ,
  FeaturesBento,
  FinalCTA,
  Hero,
  HowItWorks,
  ProductDemo,
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
      <BenefitStrip />
      <FeaturesBento />
      <ProductDemo />
      <HowItWorks />
      <TrustStrip />
      <FAQ />
      <FinalCTA onGetStarted={onGetStarted} />
      <Footer />
    </Box>
  )
}
