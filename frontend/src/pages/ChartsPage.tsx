import { Box, VStack, Card, CardBody, Text, Spinner, Center, useColorModeValue, Heading, HStack, Button, Image } from '@chakra-ui/react'
import { usePeriodData } from '../hooks/usePeriodData'
import { usePeriodNavigator } from '../hooks/usePeriodNavigator'
import { useDashboardData } from '../hooks/useDashboardData'
import PeriodNavigator from '../components/summary/PeriodNavigator'
import { TransactionsChart, IncomeChart, ExpensesChart, BalanceChart } from '../components/charts/modal'
import { getResponsiveStyles } from '../components/ui'
import { RotateCcw } from 'lucide-react'
import chartsImage from '../../assets/charts.png'

export default function ChartsPage() {
  const { 
    selectedDate, 
    selectedPeriod, 
    onPeriodChange,
    navigatePeriod,
    goToToday,
    formatLabel,
  } = usePeriodNavigator()
  const { transactions, monthSummary, loading } = useDashboardData(selectedDate, selectedPeriod)
  const periodData = usePeriodData(transactions, monthSummary, selectedPeriod, selectedDate)

  const responsiveStyles = getResponsiveStyles()
  const cardBg = useColorModeValue('white', '#0a0a0a')
  const cardBgPattern = useColorModeValue(
    'data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 5 L20 5 M50 10 L55 10 M5 40 L15 40 M30 20 L45 20" stroke="%23000" stroke-width="0.5" opacity="0.1" stroke-linecap="round"/%3E%3C/svg%3E',
    'data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 5 L20 5 M50 10 L55 10 M5 40 L15 40 M30 20 L45 20" stroke="%23fff" stroke-width="0.5" opacity="0.1" stroke-linecap="round"/%3E%3C/svg%3E'
  )
  const cardBorderColor = useColorModeValue('gray.200', 'gray.800')
  const bg = useColorModeValue('white', 'black')
  const texturePatternLight = 'data:image/svg+xml,%3Csvg width="6" height="6" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M 0 3 L 3 0 M 3 6 L 6 3 M 0 3 L 3 6" stroke="%23000" stroke-width="0.6" opacity="0.15"/%3E%3C/svg%3E'
  const texturePatternDark = 'data:image/svg+xml,%3Csvg width="6" height="6" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M 0 3 L 3 0 M 3 6 L 6 3 M 0 3 L 3 6" stroke="%23fff" stroke-width="0.6" opacity="0.15"/%3E%3C/svg%3E'
  const texturePattern = useColorModeValue(texturePatternLight, texturePatternDark)
  
  // Modern divider styles
  const dividerColor = useColorModeValue(
    'linear-gradient(90deg, transparent 0%, rgba(226, 232, 240, 0.8) 20%, rgba(226, 232, 240, 0.8) 80%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, rgba(75, 85, 99, 0.4) 20%, rgba(75, 85, 99, 0.4) 80%, transparent 100%)'
  )
  const dividerAccentColor = useColorModeValue('blue.300', 'blue.500')

  if (loading) {
    return (
      <Box 
        bg={bg}
        backgroundImage={texturePattern}
        minH="100vh"
        px={{ base: 0.5, md: 1, lg: 1.5 }} 
        py={{ base: 3, md: 6 }}
      >
        <Center py={20}>
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Text>Loading charts...</Text>
          </VStack>
        </Center>
      </Box>
    )
  }

  const { transactions: periodTransactions, balance, label } = periodData

  return (
    <Box 
      bg={bg}
      backgroundImage={texturePattern}
      minH="100vh"
      px={{ base: 0.5, md: 1, lg: 1.5 }} 
      py={{ base: 3, md: 6 }}
    >
      <Box
        w="full"
        px={{ base: 1, sm: 2, md: 3, lg: 4 }}
        sx={{
          paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(8px, env(safe-area-inset-right, 0px))',
        }}
      >
        <Card
          bg={cardBg}
          backgroundImage={cardBgPattern}
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor={cardBorderColor}
          borderRadius="2xl"
          shadow={useColorModeValue('0 1px 3px rgba(0,0,0,0.05)', '0 1px 3px rgba(0,0,0,0.2)')}
          overflow="hidden"
          position="relative"
          _hover={{
            shadow: useColorModeValue('0 4px 12px rgba(0,0,0,0.08)', '0 4px 12px rgba(0,0,0,0.3)')
          }}
          transition="all 0.2s ease"
        >
          <CardBody p={{ base: 4, sm: 5, md: 6, lg: 6 }}>
            <VStack spacing={responsiveStyles.addTransactionSection.card.spacing} align="stretch">
              {/* Header */}
              <HStack justify="space-between" align="center" w="full">
                <HStack spacing={4} align="center" flex="1">
                  <Box
                    p={2}
                    bg="transparent"
                    borderRadius="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Image
                      src={chartsImage}
                      alt="Charts"
                      boxSize={{ base: 8, sm: 10, md: 12 }}
                      objectFit="contain"
                    />
                  </Box>
                  <VStack spacing={0} align="start" flex="1">
                    <Heading
                      size="md"
                      fontWeight="600"
                      textAlign="left"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      letterSpacing="-0.015em"
                      fontSize={{ base: 'md', sm: 'xl' }}
                      color={useColorModeValue('gray.800', 'white')}
                      lineHeight="1.2"
                    >
                      Charts & Analytics
                    </Heading>
                    <Text
                      fontSize={{ base: 'xs', sm: 'sm' }}
                      color={useColorModeValue('gray.600', 'gray.400')}
                      fontWeight="400"
                      textAlign="left"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      mt={{ base: 0.5, sm: 0 }}
                      ml={{ base: 0, sm: 1 }}
                      display={{ base: 'block', sm: 'inline' }}
                    >
                      • Visualize your financial data
                    </Text>
                  </VStack>
                </HStack>

                {/* Today Button */}
                <Button
                  size="sm"
                  leftIcon={<RotateCcw size={14} />}
                  onClick={goToToday}
                  display={{ base: 'none', sm: 'flex' }}
                  borderRadius="xl"
                  px={4}
                  py={2}
                  fontWeight="500"
                  bg="transparent"
                  color={useColorModeValue('blue.600', 'blue.300')}
                  border="1px solid"
                  borderColor={useColorModeValue('blue.200', 'blue.500')}
                  boxShadow="sm"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  backdropFilter="blur(10px)"
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: useColorModeValue('blue.300', 'blue.400'),
                    bg: useColorModeValue('blue.50', 'blue.900')
                  }}
                  _active={{
                    transform: 'translateY(0)',
                  }}
                  transition="all 0.2s ease"
                >
                  Today
                </Button>
              </HStack>

              {/* Period Selector */}
              <PeriodNavigator
                selectedPeriod={selectedPeriod}
                onPeriodChange={onPeriodChange}
                onNavigatePeriod={navigatePeriod}
                onGoToToday={goToToday}
                formatLabel={formatLabel}
              />

              {/* Modern Divider */}
              <Box
                h="1px"
                w="100%"
                bg={dividerColor}
                my={6}
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  w: '40px',
                  h: '1px',
                  bg: dividerAccentColor,
                  opacity: 0.6,
                }}
              />

              {/* Charts Section */}
              <VStack spacing={6} align="stretch">
                {/* Transactions Chart */}
                <Box>
                  <Text 
                    fontSize={{ base: "lg", sm: "xl" }} 
                    fontWeight="600" 
                    mb={4}
                    color={useColorModeValue('gray.800', 'white')}
                  >
                    Transactions Overview
                  </Text>
                  <TransactionsChart 
                    transactions={periodTransactions} 
                    selectedPeriod={label} 
                  />
                </Box>

                {/* Modern Divider */}
              <Box
                h="1px"
                w="100%"
                bg={dividerColor}
                my={6}
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  w: '40px',
                  h: '1px',
                  bg: dividerAccentColor,
                  opacity: 0.6,
                }}
              />

                {/* Income Chart */}
                <Box>
                  <Text 
                    fontSize={{ base: "lg", sm: "xl" }} 
                    fontWeight="600" 
                    mb={4}
                    color={useColorModeValue('gray.800', 'white')}
                  >
                    Income Analysis
                  </Text>
                  <IncomeChart 
                    transactions={periodTransactions} 
                    selectedPeriod={label} 
                  />
                </Box>

                {/* Modern Divider */}
              <Box
                h="1px"
                w="100%"
                bg={dividerColor}
                my={6}
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  w: '40px',
                  h: '1px',
                  bg: dividerAccentColor,
                  opacity: 0.6,
                }}
              />

                {/* Expenses Chart */}
                <Box>
                  <Text 
                    fontSize={{ base: "lg", sm: "xl" }} 
                    fontWeight="600" 
                    mb={4}
                    color={useColorModeValue('gray.800', 'white')}
                  >
                    Expenses Analysis
                  </Text>
                  <ExpensesChart 
                    transactions={periodTransactions} 
                    selectedPeriod={label} 
                  />
                </Box>

                {/* Modern Divider */}
              <Box
                h="1px"
                w="100%"
                bg={dividerColor}
                my={6}
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  w: '40px',
                  h: '1px',
                  bg: dividerAccentColor,
                  opacity: 0.6,
                }}
              />

                {/* Balance Chart */}
                <Box>
                  <Text 
                    fontSize={{ base: "lg", sm: "xl" }} 
                    fontWeight="600" 
                    mb={4}
                    color={useColorModeValue('gray.800', 'white')}
                  >
                    Balance Overview
                  </Text>
                  <BalanceChart 
                    transactions={periodTransactions} 
                    selectedPeriod={label}
                    currentBalance={balance}
                  />
                </Box>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  )
}

