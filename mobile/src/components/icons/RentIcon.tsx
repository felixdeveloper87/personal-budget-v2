import Svg, { Circle, Path } from "react-native-svg";

/** Soft-roofed home with a keyhole — same mark as the web RentHome icon. */
export function RentIcon({ color, size, strokeWidth = 2 }: { color: string; size: number; strokeWidth?: number }) {
  return (
    <Svg
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        d="M4 10.3 11.06 4.5a1.5 1.5 0 0 1 1.88 0L20 10.3v8.2a1.75 1.75 0 0 1-1.75 1.75H5.75A1.75 1.75 0 0 1 4 18.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12.4} r={1.9} stroke={color} strokeWidth={strokeWidth} />
      <Path d="M12 14.3v2.7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}
