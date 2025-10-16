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
              return '#fef3c7' // Amarelo post-it igual ao light
            case 'income':
              return '#dcfce7' // Verde post-it igual ao light
            case 'expenses':
              return '#fecaca' // Rosa post-it igual ao light
            case 'balance':
              return '#dbeafe' // Azul post-it igual ao light
            default:
              return '#fef3c7'
          }
        })()
      )}
      border={useColorModeValue("none", "2px solid")}
      borderColor={useColorModeValue("transparent", "gray.600")}
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
            (() => {
              switch (stat.id) {
                case 'transactions':
                  return '#fbbf24' // Amarelo mais escuro igual ao light
                case 'income':
                  return '#22c55e' // Verde mais escuro igual ao light
                case 'expenses':
                  return '#f87171' // Rosa mais escuro igual ao light
                case 'balance':
                  return '#60a5fa' // Azul mais escuro igual ao light
                default:
                  return '#fbbf24'
              }
            })()
          ),
          borderRadius: '4px',
          zIndex: -1,
          opacity: useColorModeValue(0.3, 0.6)
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
        boxShadow: useColorModeValue(
          '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.1)',
          '0 20px 40px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.1)'
        ),
        borderColor: useColorModeValue("transparent", "gray.500"),
        '&::before': {
          opacity: useColorModeValue(0.5, 0.8),
          transform: 'scale(1.02)'
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
              `${stat.color}15`,
              `${stat.color}20`
            )}
            boxShadow="none"
            border="1px solid"
            borderColor={useColorModeValue(
              `${stat.color}30`,
              `${stat.color}40`
            )}
          >
            <Icon 
              as={IconComponent} 
              boxSize={responsiveStyles.summaryCards.icon.size} 
              color={useColorModeValue(
                `${stat.color}`,
                (() => {
                  switch (stat.id) {
                    case 'transactions':
                      return '#f59e0b' // Amarelo igual ao light
                    case 'income':
                      return '#10b981' // Verde igual ao light
                    case 'expenses':
                      return '#ef4444' // Vermelho igual ao light
                    case 'balance':
                      return '#3b82f6' // Azul igual ao light
                    default:
                      return '#f59e0b'
                  }
                })()
              )}
              opacity={useColorModeValue(0.9, 0.8)}
            />
          </Box>
          
          {/* Valores e labels */}
          <VStack spacing={responsiveStyles.summaryCards.content.spacing} align="center">
            <Text
              fontSize={responsiveStyles.summaryCards.value.fontSize}
              fontWeight="600"
              color={useColorModeValue('gray.800', 'gray.800')}
              textAlign="center"
              lineHeight="1.1"
              letterSpacing="-0.01em"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {stat.displayValue}
            </Text>
            <Text
              fontSize={responsiveStyles.summaryCards.label.fontSize}
              fontWeight="500"
              color={useColorModeValue('gray.600', 'gray.600')}
              textAlign="center"
              textTransform="none"
              letterSpacing="0.02em"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {stat.label}
            </Text>
            <Text
              fontSize={{ base: '2xs', sm: 'xs' }}
              color={useColorModeValue('gray.500', 'gray.500')}
              textAlign="center"
              fontWeight="400"
              display={{ base: 'none', sm: 'block' }}
              fontFamily="system-ui, -apple-system, sans-serif"
              opacity={useColorModeValue(0.8, 0.8)}
            >
              {stat.helpText}
            </Text>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  )
}
