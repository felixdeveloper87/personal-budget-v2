import { Box, Divider, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { formatDate, formatDateTime } from './format'
import type { ReportResponse } from '../../types'
import BrandMark from '../brand/BrandMark'

interface ReportHeaderProps {
  report: ReportResponse
  userName?: string
}

export default function ReportHeader({ report, userName }: ReportHeaderProps) {
  return (
    <Box
      className="avoid-break"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="2xl"
      overflow="hidden"
      bgGradient="linear(to-br, purple.50, blue.50)"
      p={{ base: 6, md: 8 }}
    >
      <Flex justify="space-between" align="flex-start" gap={6} direction={{ base: 'column', md: 'row' }}>
        <VStack align="flex-start" spacing={4} minW={0}>
          <HStack spacing={3} align="center">
            <BrandMark
              size={40}
              style={{ flexShrink: 0, filter: 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.18))' }}
            />
            <VStack align="flex-start" spacing={0}>
              <HStack spacing={1} align="baseline">
                <Text fontFamily="'Instrument Serif', Georgia, serif" fontSize="lg" fontWeight={400} letterSpacing="-0.02em" color="gray.800">
                  Personal
                </Text>
                <Text
                  as="em"
                  fontFamily="'Instrument Serif', Georgia, serif"
                  fontSize="lg"
                  fontWeight={400}
                  letterSpacing="-0.02em"
                  color="#237a55"
                >
                  Budget
                </Text>
              </HStack>
              <Text fontSize="10px" color="gray.500" letterSpacing="0.04em" fontWeight={500}>
                Clarity for your money
              </Text>
            </VStack>
          </HStack>

          <VStack align="flex-start" spacing={1.5}>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight={800} color="gray.900" lineHeight={1.05}>
              Financial report
            </Text>
            <Text fontSize="sm" color="gray.500" maxW="md">
              Overview based on payment dates, card impact dates, installments and recurring expenses.
            </Text>
          </VStack>

          {userName ? (
            <Text fontSize="sm" color="gray.600">
              Prepared for{' '}
              <Text as="span" fontWeight={700} color="gray.800">
                {userName}
              </Text>
            </Text>
          ) : null}
        </VStack>

        <Box
          bg="whiteAlpha.800"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="xl"
          p={5}
          w={{ base: 'full', md: '260px' }}
          flexShrink={0}
        >
          <Text
            fontSize="10px"
            fontWeight={700}
            letterSpacing="0.08em"
            textTransform="uppercase"
            color="gray.500"
          >
            Report period
          </Text>
          <Text fontSize="lg" fontWeight={800} color="gray.900" mt={1} noOfLines={2}>
            {report.periodLabel}
          </Text>
          <Text fontSize="sm" color="gray.600" mt={1}>
            {formatDate(report.startDate)} &ndash; {formatDate(report.endDate)}
          </Text>
          <Divider my={3} borderColor="gray.200" />
          <Text fontSize="xs" color="gray.500">
            Generated {formatDateTime(report.generatedAt)}
          </Text>
          <Text fontSize="xs" color="gray.500" mt={0.5}>
            {report.transactionCount} transactions
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}
