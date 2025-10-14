import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Button,
  Icon,
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { Transaction } from '../../../types' 
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { getResponsiveStyles, animations, safeAreaStyles, safariStyles, getGradients } from '../../../utils/ui'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { X } from 'lucide-react'
  
  
  const CATEGORY_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
  ]
  
  interface CategoryModalProps {
    isOpen: boolean
    onClose: () => void
    transactions: Transaction[]
    type: 'INCOME' | 'EXPENSE'
    selectedPeriod: string
  }
  
export default function CategoryModal({ isOpen, onClose, transactions, type, selectedPeriod }: CategoryModalProps) {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const gradients = getGradients()
  
  // Move all useColorModeValue calls to the top
  const closeButtonBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(15, 23, 42, 0.8)')
  const closeButtonBorderColor = useColorModeValue('gray.300', 'gray.600')
  const closeButtonHoverBg = useColorModeValue('red.50', 'red.900')
  const closeButtonIconColor = useColorModeValue('gray.700', 'gray.200')
  const cardBg = useColorModeValue('white', 'gray.800')
  const progressBg = useColorModeValue('gray.100', 'gray.700')
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700')
  const tableRowBg = useColorModeValue('gray.25', 'gray.750')
  const tableRowHoverBg = useColorModeValue('gray.50', 'gray.600')
  const modalBg = useColorModeValue(
    'rgba(255, 255, 255, 0.95)',
    'rgba(17, 17, 17, 0.95)'
  )
  
    const filteredTransactions = useMemo(
      () => transactions.filter(t => t.type === type),
      [transactions, type]
    )
  
    const { sortedCategories, total } = useMemo(() => {
      const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
        const category = transaction.category
        if (!acc[category]) acc[category] = { total: 0, transactions: [] }
        acc[category].total += transaction.amount
        acc[category].transactions.push(transaction)
        return acc
      }, {} as Record<string, { total: number; transactions: Transaction[] }>)
  
      Object.values(categoryTotals).forEach(cat =>
        cat.transactions.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
      )
  
      const sortedCategories = Object.entries(categoryTotals)
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.total - a.total)
  
      const total = sortedCategories.reduce((sum, cat) => sum + cat.total, 0)
      return { sortedCategories, total }
    }, [filteredTransactions])
  
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  
    const toggleCategory = (category: string) => {
      const key = `${type}-${category}`
      setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }))
    }
  
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={responsiveStyles.modals.category.container.size}
        closeOnOverlayClick={false}
        isCentered={false}
        motionPreset="slideInBottom"
      >
        <ModalOverlay
          bg="blackAlpha.600"
          backdropFilter="blur(12px)"
          css={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        />
      <ModalContent
        borderRadius={responsiveStyles.modals.category.container.borderRadius}
        m={0}
        h={{ base: '100dvh', sm: 'auto', md: 'auto' }}
        maxH={responsiveStyles.modals.category.container.maxH}
        overflow="hidden"
        mx={{ base: 0, sm: 4 }}
        my={{ base: 0, sm: 4 }}
        maxW={responsiveStyles.modals.category.container.maxW}
        boxShadow="0 32px 64px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)"
        border="1px solid"
        borderColor={colors.border}
        position="relative"
        bg={modalBg}
        backdropFilter="blur(20px)"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: type === 'INCOME' 
            ? 'linear-gradient(90deg, #10b981, #059669, #047857)'
            : 'linear-gradient(90deg, #ef4444, #dc2626, #b91c1c)',
          borderRadius: '3xl 3xl 0 0',
        }}
        sx={{
          ...safeAreaStyles.container,
          ...safariStyles.modal,
          animation: animations.slideIn,
          '@keyframes slideIn': {
            from: { 
              opacity: 0, 
              transform: 'translateY(20px) scale(0.95)' 
            },
            to: { 
              opacity: 1, 
              transform: 'translateY(0) scale(1)' 
            }
          }
        }}
      >
        {/* Barra superior animada */}
        <Box
          height="4px"
          background={type === 'INCOME' 
            ? 'linear-gradient(90deg, #10b981, #059669, #047857)'
            : 'linear-gradient(90deg, #ef4444, #dc2626, #b91c1c)'
          }
          backgroundSize="300% 100%"
          sx={{
            animation: animations.shimmer,
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '-200% 0' },
              '100%': { backgroundPosition: '200% 0' }
            }
          }}
        />

        <ModalHeader
          textAlign="center"
          borderBottom="1px"
          borderColor={colors.border}
          py={8}
          bg={
            type === 'INCOME'
              ? 'linear-gradient(135deg, #10b981, #059669, #047857)'
              : 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)'
          }
          color="white"
          fontWeight="800"
          letterSpacing="wide"
          position="relative"
          backdropFilter="blur(8px)"
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={3}
            mb={2}
          >
            <Box
              p={2}
              borderRadius="full"
              bg="rgba(255,255,255,0.2)"
              sx={{
                animation: animations.glow,
                '@keyframes glow': {
                  '0%, 100%': { 
                    boxShadow: '0 0 5px rgba(255, 255, 255, 0.3)' 
                  },
                  '50%': { 
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)' 
                  }
                }
              }}
            >
              <Text fontSize="lg" color="white" fontWeight="bold">£</Text>
            </Box>
            <Text fontWeight="800" letterSpacing="wide">
              {type === 'INCOME' ? 'Income' : 'Expenses'} by Category
            </Text>
          </Box>
          <Text 
            fontSize={{ base: '2xs', sm: 'xs' }}
            opacity={0.7}
            fontWeight="400"
          >
            {selectedPeriod}
          </Text>
        </ModalHeader>
  
        <Button
          position="absolute"
          top={{ base: 4, sm: 5, md: 6 }}
          right={{ base: 4, sm: 5, md: 6 }}
          size="lg"
          variant="ghost"
          onClick={onClose}
          borderRadius="full"
          p={3}
          bg={closeButtonBg}
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor={closeButtonBorderColor}
          _hover={{
            bg: closeButtonHoverBg,
            borderColor: 'red.300',
            transform: 'scale(1.1)',
            boxShadow: 'lg',
          }}
          _active={{
            transform: 'scale(0.95)',
          }}
          transition="all 0.2s ease"
          zIndex={10}
          boxShadow="md"
          aria-label="Close category analysis"
        >
          <Icon as={X} boxSize={5} color={closeButtonIconColor} />
        </Button>
  
        <ModalBody
          py={responsiveStyles.modals.category.body.padding}
          px={responsiveStyles.modals.category.body.padding}
          flex="1"
          overflowY="auto"
          sx={{
            ...safariStyles.scrollable,
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)',
            paddingLeft: 'env(safe-area-inset-left, 0px)',
            paddingRight: 'env(safe-area-inset-right, 0px)',
            scrollBehavior: 'smooth',
            overscrollBehavior: 'contain',
          }}
        >
          {sortedCategories.length === 0 ? (
            <Box p={responsiveStyles.modals.category.empty.padding} textAlign="center" color={colors.text.secondary}>
              <Text fontSize={responsiveStyles.modals.category.empty.titleFontSize} mb={2}>
                No {type.toLowerCase()} found
              </Text>
              <Text fontSize={responsiveStyles.modals.category.empty.descriptionFontSize}>
                Add some {type.toLowerCase()} transactions to see the breakdown
              </Text>
            </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {sortedCategories.map(({ category, total: categoryTotal, transactions: categoryTransactions }, index) => {
                  const percentage = total > 0 ? (categoryTotal / total) * 100 : 0
                  const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                  const key = `${type}-${category}`
                  const isExpanded = !!expandedCategories[key]
                  const visibleTransactions = isExpanded
                    ? categoryTransactions
                    : categoryTransactions.slice(0, 5)
  
                  return (
                  <Box
                    key={key}
                    p={responsiveStyles.modals.category.categoryCard.padding}
                    border="1px solid"
                    borderColor={colors.border}
                    borderRadius="2xl"
                    bg={cardBg}
                    shadow="sm"
                    _hover={{
                      shadow: 'md',
                      transform: 'translateY(-2px)',
                    }}
                    transition="all 0.2s ease"
                  >
                    <VStack spacing={responsiveStyles.modals.category.categoryCard.spacing} align="stretch">
                      <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
                        <HStack spacing={responsiveStyles.modals.category.categoryHeader.spacing} minW="0" flex="1">
                          <Box w={responsiveStyles.modals.category.categoryHeader.indicatorSize} h={responsiveStyles.modals.category.categoryHeader.indicatorSize} bg={color} borderRadius="sm" flexShrink={0} />
                          <Text fontSize={responsiveStyles.modals.category.categoryHeader.titleFontSize} fontWeight="semibold" color={colors.text.primary} isTruncated>
                            {category}
                          </Text>
                        </HStack>
                        <VStack spacing={0} align="end" flexShrink={0}>
                          <Text fontSize={responsiveStyles.modals.category.categoryHeader.valueFontSize} fontWeight="bold" color={colors.text.primary}>
                            £{categoryTotal.toFixed(2)}
                          </Text>
                          <Text fontSize={responsiveStyles.modals.category.categoryHeader.percentageFontSize} color={colors.text.secondary}>
                            {percentage.toFixed(1)}% of total
                          </Text>
                        </VStack>
                      </HStack>
  
                      <Progress
                        value={percentage}
                        colorScheme={type === 'INCOME' ? 'green' : 'red'}
                        size={responsiveStyles.modals.category.progress.size}
                        borderRadius="md"
                        bg={progressBg}
                      />
  
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" color={colors.text.secondary} mb={2}>
                            Transactions ({categoryTransactions.length})
                          </Text>
  
                          <Box 
                            overflowX="auto" 
                            borderRadius="lg"
                            border="1px solid"
                            borderColor={colors.border}
                          >
                            <Table size="sm" variant="simple" minW="300px">
                            <Thead bg={tableHeaderBg}>
                              <Tr>
                                <Th fontSize={responsiveStyles.modals.category.table.headerFontSize} color={colors.text.secondary} py={responsiveStyles.modals.category.table.padding}>Date</Th>
                                <Th fontSize={responsiveStyles.modals.category.table.headerFontSize} color={colors.text.secondary} py={responsiveStyles.modals.category.table.padding}>Description</Th>
                                <Th fontSize={responsiveStyles.modals.category.table.headerFontSize} color={colors.text.secondary} isNumeric py={responsiveStyles.modals.category.table.padding}>Amount</Th>
                              </Tr>
                            </Thead>
                              <Tbody>
                                {visibleTransactions.map((t, index) => (
                                  <Tr 
                                    key={t.id}
                                    bg={index % 2 === 0 ? 'transparent' : tableRowBg}
                                    _hover={{
                                      bg: tableRowHoverBg,
                                    }}
                                    transition="background-color 0.2s ease"
                                  >
                                  <Td fontSize={responsiveStyles.modals.category.table.cellFontSize} color={colors.text.primary} py={responsiveStyles.modals.category.table.padding}>
                                    {new Date(t.dateTime).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                                  </Td>
                                  <Td fontSize={responsiveStyles.modals.category.table.cellFontSize} color={colors.text.primary} maxW="120px" isTruncated py={responsiveStyles.modals.category.table.padding}>
                                    {t.description || 'No description'}
                                  </Td>
                                  <Td fontSize={responsiveStyles.modals.category.table.cellFontSize} fontWeight="semibold" color={colors.text.primary} isNumeric py={responsiveStyles.modals.category.table.padding}>
                                    £{t.amount.toFixed(2)}
                                  </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </Box>
  
                        {categoryTransactions.length > 5 && (
                          <Button
                            onClick={() => toggleCategory(category)}
                            variant="outline"
                            size={responsiveStyles.modals.category.button.size}
                            mt={responsiveStyles.modals.category.button.marginTop}
                            w="full"
                            colorScheme={type === 'INCOME' ? 'green' : 'red'}
                            rightIcon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            borderRadius="lg"
                            _hover={{
                              transform: 'translateY(-1px)',
                              shadow: 'md',
                            }}
                            _active={{
                              transform: 'translateY(0)',
                            }}
                            transition="all 0.2s ease"
                          >
                            {isExpanded ? 'Show less' : `Show ${categoryTransactions.length - 5} more`}
                          </Button>
                        )}
                        </Box>
                      </VStack>
                    </Box>
                  )
                })}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      </>
    )
  }
  