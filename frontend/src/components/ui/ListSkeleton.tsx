import { Box, Flex, Skeleton, SkeletonCircle, Stack, type BoxProps } from '@chakra-ui/react'
import { useI18n } from '../../i18n'

const START = 'var(--pb-surface-2, #f1f1f5)'
const END = 'var(--pb-hair, #e4e4ea)'

/** Widths cycle so the rows do not look stamped out. */
const TITLE_WIDTHS = ['46%', '62%', '38%', '54%', '70%', '42%']
const META_WIDTHS = ['28%', '36%', '22%', '32%', '26%', '40%']

interface ListSkeletonProps extends BoxProps {
  /** Number of placeholder rows. */
  rows?: number
  /** Adds a summary block (a big number and a caption) above the rows. */
  withSummary?: boolean
}

/**
 * Loading placeholder shaped like the app's lists (icon · title + meta ·
 * amount), shown where the content will appear. Like native apps, the screen
 * keeps its structure while loading instead of showing a lone spinner.
 */
export default function ListSkeleton({ rows = 6, withSummary = false, ...boxProps }: ListSkeletonProps) {
  const { t } = useI18n()

  return (
    <Box role="status" aria-busy="true" aria-label={t('common.loading')} px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }} {...boxProps}>
      {withSummary && (
        <Stack spacing={2.5} mb={6}>
          <Skeleton startColor={START} endColor={END} h="12px" w="30%" borderRadius="full" />
          <Skeleton startColor={START} endColor={END} h="28px" w="52%" borderRadius="lg" />
        </Stack>
      )}
      <Stack spacing={0}>
        {Array.from({ length: rows }, (_, i) => (
          <Flex key={i} align="center" gap={3} py={3}>
            <SkeletonCircle startColor={START} endColor={END} size="10" flexShrink={0} />
            <Stack flex={1} minW={0} spacing={2}>
              <Skeleton startColor={START} endColor={END} h="12px" w={TITLE_WIDTHS[i % TITLE_WIDTHS.length]} borderRadius="full" />
              <Skeleton startColor={START} endColor={END} h="10px" w={META_WIDTHS[i % META_WIDTHS.length]} borderRadius="full" />
            </Stack>
            <Skeleton startColor={START} endColor={END} h="12px" w="64px" borderRadius="full" flexShrink={0} />
          </Flex>
        ))}
      </Stack>
    </Box>
  )
}
