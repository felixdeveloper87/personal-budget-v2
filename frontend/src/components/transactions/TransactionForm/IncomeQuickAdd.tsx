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
        textTransform="uppercase"
        letterSpacing="0.05em"
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
              borderColor={selected ? '#2F7257' : 'var(--pb-hair)'}
              bg={selected ? '#E8F3E8' : 'var(--pb-surface)'}
              color={selected ? '#2F7257' : 'var(--pb-ink)'}
              onClick={() => {
                setCustomSource(false)
                onSelect(source.name)
              }}
              _hover={{ borderColor: '#2F7257', bg: selected ? '#E8F3E8' : '#F1F6EE' }}
              aria-label={`Use ${source.name} as income source`}
            >
              <HStack spacing={2.5} minW={0}>
                <MerchantLogo domain={source.domain} name={source.name} size={31} />
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
          borderColor={customSource ? '#2F7257' : 'var(--pb-hair)'}
          bg={customSource ? '#E8F3E8' : 'var(--pb-surface)'}
          color={customSource ? '#2F7257' : 'var(--pb-ink)'}
          onClick={() => {
            setCustomSource(true)
            onSelectOther()
          }}
          _hover={{ borderColor: '#2F7257', bg: customSource ? '#E8F3E8' : '#F1F6EE' }}
        >
          <HStack spacing={2.5} minW={0}>
            <Box
              w="31px"
              h="31px"
              display="grid"
              placeItems="center"
              flexShrink={0}
              borderRadius="10px"
              bg={customSource ? '#2F7257' : '#E8F3E8'}
              color={customSource ? 'white' : '#2F7257'}
            >
              <MoreHorizontal aria-hidden="true" size={19} strokeWidth={2.5} />
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
