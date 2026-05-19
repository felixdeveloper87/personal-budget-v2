import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Heading,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { Minus, Plus } from '../../components/ui/icons'
import { SectionShell } from './shared'
import { FAQS } from './landing.config'

export default function FAQ() {
  const bg = useColorModeValue(
    'linear-gradient(180deg, #f8fafc 0%, #ffffff 70%)',
    'linear-gradient(180deg, #0a0c10 0%, #06080b 70%)',
  )
  const bgImg = useColorModeValue('url(/hero_bg_premium_light.png)', 'url(/hero_bg_premium.png)')
  const overlayBg = useColorModeValue(
    'linear-gradient(180deg, #ffffff 0%, #ffffff 240px, rgba(255, 255, 255, 0.85) 100%)',
    'linear-gradient(180deg, #0a0c10 0%, #0a0c10 240px, rgba(10, 12, 16, 0.75) 100%)'
  )

  const cardBg = useColorModeValue('white', 'rgba(255,255,255,0.03)')
  const cardBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const text = useColorModeValue('gray.900', 'whiteAlpha.900')
  const subText = useColorModeValue('gray.600', 'gray.400')
  const iconColor = useColorModeValue('blue.600', 'blue.300')
  const iconBg = useColorModeValue('blue.50', 'rgba(59,130,246,0.12)')

  return (
    <SectionShell
      id="faq"
      bg={bg}
      backgroundImage={bgImg}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundAttachment="fixed"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: overlayBg,
        zIndex: 0
      }}
      eyebrow="FAQ"
      title="The honest answers."
      subtitle="If something here surprises you, that's on us."
      containerProps={{ maxW: { base: '100%', md: '780px', lg: '880px' } }}
    >
      <Accordion allowToggle defaultIndex={[0]} as={Box} display="flex" flexDirection="column" gap={3}>
        {FAQS.map((faq) => (
          <AccordionItem
            key={faq.question}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="2xl"
            bg={cardBg}
            overflow="hidden"
            _hover={{ borderColor: useColorModeValue('blue.200', 'blue.500') }}
            transition="border-color 0.2s ease"
          >
            {({ isExpanded }) => (
              <>
                <AccordionButton
                  px={{ base: 5, md: 6 }}
                  py={5}
                  _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.50') }}
                  _expanded={{ pb: 3 }}
                  borderRadius="2xl"
                >
                  <Box flex={1} textAlign="left">
                    <Heading as="h3" fontSize="md" fontWeight={700} color={text} letterSpacing="-0.01em">
                      {faq.question}
                    </Heading>
                  </Box>
                  <Box
                    p={2}
                    borderRadius="lg"
                    bg={iconBg}
                    color={iconColor}
                    transition="transform 0.25s ease"
                    transform={isExpanded ? 'rotate(180deg)' : 'rotate(0)'}
                  >
                    <Icon as={isExpanded ? Minus : Plus} boxSize={4} weight="bold" />
                  </Box>
                </AccordionButton>
                <AccordionPanel px={{ base: 5, md: 6 }} pb={5}>
                  <Text color={subText} fontSize="sm" lineHeight={1.65} maxW="640px">
                    {faq.answer}
                  </Text>
                </AccordionPanel>
              </>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  )
}
