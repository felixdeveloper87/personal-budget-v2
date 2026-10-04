import Svg, { Path } from "react-native-svg";

/** Rounded home with a subtle pound sign — same mark as the web RentHome icon. */
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
        d="M3.75 10.5 12 3.75l8.25 6.75v8a1.75 1.75 0 0 1-1.75 1.75h-13a1.75 1.75 0 0 1-1.75-1.75Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.75 9.25a2.4 2.4 0 0 0-2.1-1.25c-1.45 0-2.4 1.05-2.4 2.65v3.7c0 1.15-.45 1.95-1.35 2.4h6.35M8.75 12.75h4.75"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
