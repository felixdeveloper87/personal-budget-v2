import { useBreakpointValue } from '@chakra-ui/react'

export interface ChartDimensions {
  chartHeight: number
  smallChartHeight: number
  pieOuterRadius: number
}

export function useChartDimensions(): ChartDimensions {
  const chartHeight = useBreakpointValue({ base: 280, sm: 320, md: 360, lg: 400 }) ?? 400
  const smallChartHeight = useBreakpointValue({ base: 250, sm: 280, md: 300, lg: 350 }) ?? 350
  const pieOuterRadius = useBreakpointValue({ base: 70, sm: 85, md: 100 }) ?? 100
  
  return {
    chartHeight,
    smallChartHeight,
    pieOuterRadius,
  }
}

