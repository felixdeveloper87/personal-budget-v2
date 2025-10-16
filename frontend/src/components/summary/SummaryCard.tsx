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
              return '#fef3c7' // Amarelo post-it
            case 'income':
              return '#dcfce7' // Verde post-it
            case 'expenses':
              return '#fecaca' // Rosa post-it
            case 'balance':
              return '#dbeafe' // Azul post-it
            default:
              return '#fef3c7'
          }
        })(),
        (() => {
          switch (stat.id) {
            case 'transactions':
              return '#1e293b'
            case 'income':
              return '#1e293b'
            case 'expenses':
              return '#1e293b'
            case 'balance':
              return '#1e293b'
            default:
              return '#1e293b'
          }
        })()
      )}
      border="none"
      borderRadius="0"
      shadow="none"
      cursor="pointer"
      transition="all 0.3s ease"
      overflow="visible"
      transform={`rotate(${-2 + (index % 3) * 1}deg)`}
      sx={{
        // Efeito de post-it colado
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          right: '-2px',
          bottom: '-2px',
          background: useColorModeValue(
            (() => {
              switch (stat.id) {
                case 'transactions':
                  return '#fbbf24' // Amarelo mais escuro
                case 'income':
                  return '#22c55e' // Verde mais escuro
                case 'expenses':
                  return '#f87171' // Rosa mais escuro
                case 'balance':
                  return '#60a5fa' // Azul mais escuro
                default:
                  return '#fbbf24'
              }
            })(),
            '#374151'
          ),
          borderRadius: '4px',
          zIndex: -1,
          opacity: 0.3
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '20px',
          height: '20px',
          background: useColorModeValue(
            'rgba(0,0,0,0.1)',
            'rgba(255,255,255,0.1)'
          ),
          borderRadius: '50%',
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
        transform: 'rotate(-1deg) translateY(-8px) scale(1.05)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.1)',
        '&::before': {
          opacity: 0.5,
          transform: 'scale(1.02)'
        },
        '&::after': {
          transform: 'scale(1.2)',
          opacity: 0.3
        }
      }}
      _active={{
        transform: 'rotate(-1deg) translateY(-4px) scale(1.02)',
      }}
      onClick={() => onCardClick(stat.id)}
    >
      {/* Efeito de cola no post-it */}
      <Box
        position="absolute"
        top="4px"
        right="4px"
        width="12px"
        height="12px"
        background={useColorModeValue(
          'rgba(0,0,0,0.05)',
          'rgba(255,255,255,0.05)'
        )}
        borderRadius="50%"
        zIndex={1}
      />
      
      <CardBody p={responsiveStyles.summaryCards.card.padding}>
        <VStack spacing={responsiveStyles.summaryCards.card.spacing} align="center">
          {/* Ícone com efeito especial */}
          <Box
            position="relative"
            p={responsiveStyles.summaryCards.icon.padding}
            borderRadius="xl"
            bg={useColorModeValue(
              `${stat.color}20`,
              `${stat.color}30`
            )}
            boxShadow="sm"
          >
            <Icon as={IconComponent} boxSize={responsiveStyles.summaryCards.icon.size} color={stat.color} />
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
