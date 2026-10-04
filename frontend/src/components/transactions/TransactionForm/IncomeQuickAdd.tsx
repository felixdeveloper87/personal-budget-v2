import { Box, Button, Grid, HStack, Text, VStack } from '@chakra-ui/react'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import MerchantLogo from '../../ui/MerchantLogo'
import { useI18n } from '../../../i18n'
import DescriptionInput from './DescriptionInput'

const QUICK_SOURCES = [
  { name: 'Deliveroo', domain: 'deliveroo.co.uk' },
  { name: 'Uber Eats', domain: 'ubereats.com' },
  { name: 'Just Eat', domain: 'just-eat.co.uk' },
] as const

interface IncomeQuickAddProps {
  description: string
  loading?: boolean
  onDescriptionChange: (value: string) => void
  onSelect: (source: string) => void
  onSelectOther: () => void
}

export default function IncomeQuickAdd({
  description,
  loading = false,
  onDescriptionChange,
  onSelect,
  onSelectOther,
}: IncomeQuickAddProps) {
  const { t } = useI18n()
  const [customSource, setCustomSource] = useState(false)

  return (
    <VStack align="stretch" spacing={3}>
      <Text
        fontSize="xs"
        fontWeight={700}
        color="var(--pb-ink-soft)"
      >
        {t('dashboard.quickAdd')}
      </Text>

      <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={2.5}>
        {QUICK_SOURCES.map((source) => {
          const selected = !customSource
            && description.trim().toLocaleLowerCase() === source.name.toLocaleLowerCase()

          return (
            <Button
              key={source.name}
              h={{ base: '52px', sm: '56px' }}
              minW={0}
              px={{ base: 2.5, sm: 3 }}
              justifyContent="flex-start"
              borderRadius="16px"
              border="1px solid"
              borderColor={selected ? '#820ad1' : 'var(--pb-hair)'}
              bg={selected ? '#f3e8fc' : 'var(--pb-surface)'}
              color={selected ? '#820ad1' : 'var(--pb-ink)'}
              onClick={() => {
                setCustomSource(false)
                onSelect(source.name)
              }}
              _hover={{ borderColor: '#820ad1', bg: selected ? '#f3e8fc' : '#f8f1fe' }}
              aria-label={`Use ${source.name} as income source`}
            >
              <HStack spacing={2.5} minW={0}>
                <MerchantLogo domain={source.domain} name={source.name} size={38} borderRadius="12px" />
                <Text as="span" minW={0} noOfLines={1} fontSize={{ base: 'xs', sm: 'sm' }} fontWeight={800}>
                  {source.name}
                </Text>
              </HStack>
            </Button>
          )
        })}

        <Button
          h={{ base: '52px', sm: '56px' }}
          minW={0}
          px={{ base: 2.5, sm: 3 }}
          justifyContent="flex-start"
          borderRadius="16px"
          border="1px solid"
          borderColor={customSource ? '#820ad1' : 'var(--pb-hair)'}
          bg={customSource ? '#f3e8fc' : 'var(--pb-surface)'}
          color={customSource ? '#820ad1' : 'var(--pb-ink)'}
          onClick={() => {
            setCustomSource(true)
            onSelectOther()
          }}
          _hover={{ borderColor: '#820ad1', bg: customSource ? '#f3e8fc' : '#f8f1fe' }}
        >
          <HStack spacing={2.5} minW={0}>
            <Box
              w="38px"
              h="38px"
              display="grid"
              placeItems="center"
              flexShrink={0}
              borderRadius="12px"
              bg={customSource ? '#820ad1' : '#f3e8fc'}
              color={customSource ? 'white' : '#820ad1'}
            >
              <MoreHorizontal aria-hidden="true" size={23} strokeWidth={2.5} />
            </Box>
            <Text as="span" minW={0} noOfLines={1} fontSize={{ base: 'xs', sm: 'sm' }} fontWeight={800}>
              {t('dashboard.other')}
            </Text>
          </HStack>
        </Button>
      </Grid>

      {customSource && (
        <DescriptionInput
          value={description}
          onChange={onDescriptionChange}
          type="INCOME"
          loading={loading}
        />
      )}
    </VStack>
  )
}
