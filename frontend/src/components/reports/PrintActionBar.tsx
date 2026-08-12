import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react'
import { Printer, X } from 'lucide-react'
import { useI18n } from '../../i18n'

/**
 * On-screen only action bar (hidden in print via the `no-print` class).
 * "Close" works because the page is opened in a script-spawned tab.
 */
export default function PrintActionBar() {
  const { t } = useI18n()
  return (
    <Box
      className="no-print"
      position="sticky"
      top={0}
      zIndex={10}
      bg="rgba(244, 245, 247, 0.85)"
      backdropFilter="saturate(180%) blur(8px)"
      borderBottom="1px solid"
      borderColor="blackAlpha.100"
    >
      <Flex maxW="880px" mx="auto" align="center" justify="space-between" px={{ base: 3, md: 4 }} py={3} gap={3}>
        <Text fontSize="sm" fontWeight={700} color="gray.600">
          {t('reports.preview')}
        </Text>
        <HStack spacing={2}>
          <Button
            size="sm"
            variant="ghost"
            color="gray.600"
            leftIcon={<X size={15} />}
            onClick={() => window.close()}
          >
            {t('reports.close')}
          </Button>
          <Button
            size="sm"
            colorScheme="blue"
            leftIcon={<Printer size={15} />}
            onClick={() => window.print()}
          >
            {t('reports.print')}
          </Button>
        </HStack>
      </Flex>
    </Box>
  )
}
