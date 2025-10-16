import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Box,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { SUMMARY_CARD_COLORS } from '../../constants/summaryColors'
import { getResponsiveStyles } from '../ui'

// 🎨 Animações personalizadas
const float = 'float 3s ease-in-out infinite'
const glow = 'glow 2s ease-in-out infinite alternate'

interface SummaryCardProps {
  stat: {
    id: string
    label: string
    icon: any
    color: string
    displayValue: string
    helpText: string
  }
  index: number
  onCardClick: (cardId: string) => void
}

export default function SummaryCard({ stat, index, onCardClick }: SummaryCardProps) {
  const IconComponent = stat.icon
  const responsiveStyles = getResponsiveStyles()

  return (
    <Card
      position="relative"
      bg={useColorModeValue(
        (() => {
          switch (stat.id) {
            case 'transactions':
              return 'linear-gradient(135deg, #eff6ff, #dbeafe)'
            case 'income':
              return 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
            case 'expenses':
              return 'linear-gradient(135deg, #fef2f2, #fee2e2)'
            case 'balance':
              return 'linear-gradient(135deg, #fefce8, #fef3c7)'
            default:
              return 'linear-gradient(135deg, #eff6ff, #dbeafe)'
          }
        })(),
        (() => {
          switch (stat.id) {
            case 'transactions':
              return 'linear-gradient(135deg, #1e293b, #334155)'
            case 'income':
              return 'linear-gradient(135deg, #1e293b, #334155)'
            case 'expenses':
              return 'linear-gradient(135deg, #1e293b, #334155)'
            case 'balance':
              return 'linear-gradient(135deg, #1e293b, #334155)'
            default:
              return 'linear-gradient(135deg, #1e293b, #334155)'
          }
        })()
      )}
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor={useColorModeValue(
        `${stat.color}20`,
        `${stat.color}30`
      )}
      borderRadius="2xl"
      shadow="2xl"
      cursor="pointer"
      transition="all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      overflow="hidden"
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: (() => {
            switch (stat.id) {
              case 'transactions':
                return 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
              case 'income':
                return 'linear-gradient(90deg, #22c55e, #16a34a)'
              case 'expenses':
                return 'linear-gradient(90deg, #ef4444, #dc2626)'
              case 'balance':
                return 'linear-gradient(90deg, #f59e0b, #d97706)'
              default:
                return 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
            }
          })(),
          borderRadius: '2xl 2xl 0 0',
          zIndex: 1
        },
        animation: `slideIn ${0.2 + index * 0.1}s ease-out`,
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
      _hover={{
        transform: 'translateY(-12px) scale(1.03)',
        boxShadow: `0 32px 64px -12px ${stat.color}50, 0 0 0 1px ${stat.color}30`,
        borderColor: stat.color,
        '&::before': {
          height: '6px',
          background: (() => {
            switch (stat.id) {
              case 'transactions':
                return 'linear-gradient(90deg, #2563eb, #1d4ed8)'
              case 'income':
                return 'linear-gradient(90deg, #16a34a, #15803d)'
              case 'expenses':
                return 'linear-gradient(90deg, #dc2626, #b91c1c)'
              case 'balance':
                return 'linear-gradient(90deg, #d97706, #b45309)'
              default:
                return 'linear-gradient(90deg, #2563eb, #1d4ed8)'
            }
          })(),
        }
      }}
      _active={{
        transform: 'translateY(-4px) scale(1.01)',
      }}
      onClick={() => onCardClick(stat.id)}
    >
      {/* Efeito de brilho no hover */}
      <Box
        position="absolute"
        top={0}
        left="-100%"
        width="100%"
        height="100%"
        background="linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)"
        transition="left 0.5s"
        _groupHover={{ left: '100%' }}
      />
      
      <CardBody p={responsiveStyles.summaryCards.card.padding}>
        <VStack spacing={responsiveStyles.summaryCards.card.spacing} align="center">
          {/* Ícone com efeito especial */}
          <Box
            position="relative"
            p={responsiveStyles.summaryCards.icon.padding}
            borderRadius="xl"
            bg={useColorModeValue(
              `${stat.color}15`,
              `${stat.color}25`
            )}
            boxShadow="md"
            sx={{
              animation: `${float} 3s ease-in-out infinite`,
              animationDelay: `${index * 0.5}s`,
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-6px)' }
              }
            }}
          >
            <Icon as={IconComponent} boxSize={responsiveStyles.summaryCards.icon.size} color={stat.color} />
            {/* Efeito de brilho no ícone */}
            <Box
              position="absolute"
              top="-3px"
              left="-3px"
              right="-3px"
              bottom="-3px"
              borderRadius="2xl"
              bg={`${stat.color}30`}
              filter="blur(12px)"
              opacity={0.8}
              zIndex={-1}
              sx={{
                animation: `${glow} 2s ease-in-out infinite alternate`,
                '@keyframes glow': {
                  '0%': { 
                    opacity: 0.4,
                    transform: 'scale(0.95)'
                  },
                  '100%': { 
                    opacity: 0.8,
                    transform: 'scale(1.05)'
                  }
                }
              }}
            />
          </Box>
          
          {/* Valores e labels */}
          <VStack spacing={responsiveStyles.summaryCards.content.spacing} align="center">
            <Text
              fontSize={responsiveStyles.summaryCards.value.fontSize}
              fontWeight="900"
              color={stat.color}
              textAlign="center"
              lineHeight="1"
              letterSpacing="-0.02em"
              sx={{
                textShadow: `0 4px 8px ${stat.color}40, 0 0 16px ${stat.color}20`,
              }}
            >
              {stat.displayValue}
            </Text>
            <Text
              fontSize={responsiveStyles.summaryCards.label.fontSize}
              fontWeight="700"
              color={useColorModeValue(
                SUMMARY_CARD_COLORS[stat.id as keyof typeof SUMMARY_CARD_COLORS].textColor,
                SUMMARY_CARD_COLORS[stat.id as keyof typeof SUMMARY_CARD_COLORS].textColorDark
              )}
              textAlign="center"
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              {stat.label}
            </Text>
            <Text
              fontSize={{ base: '2xs', sm: 'xs' }}
              color={useColorModeValue('gray.600', 'gray.400')}
              textAlign="center"
              fontWeight="500"
              display={{ base: 'none', sm: 'block' }}
            >
              {stat.helpText}
            </Text>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  )
}
