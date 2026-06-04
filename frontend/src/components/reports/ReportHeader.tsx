import { Box, Divider, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { formatDate, formatDateTime } from './format'
import type { ReportResponse } from '../../types'

/**
 * Static (no animation, no useColorModeValue) version of LogoIconWallet
 * for use in the print page where forced light mode is guaranteed.
 */
function LogoStatic() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Coin */}
      <circle cx="16" cy="9" r="4.5" fill="url(#pCoinGrad)" />
      <path
        d="M16 7.5V10.5M14.5 8.5H17.5M14.5 9.5H17.5"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Wallet body */}
      <path
        d="M6 13C6 11.8954 6.89543 11 8 11H24C25.1046 11 26 11.8954 26 13V23C26 24.1046 25.1046 25 24 25H8C6.89543 25 6 24.1046 6 23V13Z"
        fill="url(#pWalletBodyGrad)"
      />
      {/* Wallet flap */}
      <path
        d="M6 16C6 14.8954 6.89543 14 8 14H24C25.1046 14 26 14.8954 26 16V23C26 24.1046 25.1046 25 24 25H8C6.89543 25 6 24.1046 6 23V16Z"
        fill="rgba(255,255,255,0.65)"
        stroke="url(#pWalletFlapBorder)"
        strokeWidth="1.5"
      />
      {/* Clasp */}
      <rect x="22" y="17" width="5" height="4" rx="1.5" fill="#db2777" />
      <defs>
        <linearGradient id="pCoinGrad" x1="11.5" y1="4.5" x2="20.5" y2="13.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="pWalletBodyGrad" x1="6" y1="11" x2="26" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="pWalletFlapBorder" x1="6" y1="14" x2="26" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.8" />
          <stop offset="1" stopColor="white" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  )
}

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
            <Flex
              w={10}
              h={10}
              borderRadius="xl"
              align="center"
              justify="center"
              flexShrink={0}
              bg="linear-gradient(135deg, #ffffff 0%, #eef2ff 50%, #e0e7ff 100%)"
              border="1px solid"
              borderColor="rgba(37, 99, 235, 0.18)"
              boxShadow="0 4px 14px rgba(37, 99, 235, 0.18), inset 0 1px 0 rgba(255,255,255,0.9)"
            >
              <LogoStatic />
            </Flex>
            <VStack align="flex-start" spacing={0}>
              <HStack spacing={1} align="baseline">
                <Text fontSize="sm" fontWeight={600} letterSpacing="-0.02em" color="gray.700">
                  Personal
                </Text>
                <Text fontSize="xs" color="gray.300" fontWeight={400}>·</Text>
                <Text
                  fontSize="sm"
                  fontWeight={800}
                  letterSpacing="-0.03em"
                  bgGradient="linear(to-r, #1d4ed8, #5b21b6)"
                  bgClip="text"
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
