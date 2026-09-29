import { StyleSheet } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

export function ActivityCardArtwork() {
  return (
    <Svg
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      preserveAspectRatio="xMidYMid slice"
      style={styles.artwork}
      viewBox="0 0 360 96"
    >
      <Circle cx="174" cy="49" r="48" fill="#618258" opacity={0.04} />
      <G fill="none" stroke="#618258" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="174" cy="49" r="34" opacity={0.15} strokeWidth={1.7} />
        <Circle cx="174" cy="49" r="28" opacity={0.08} strokeWidth={1.2} />
        <Path
          d="M185 35c-2-8-9-12-16-9-8 3-9 11-7 19 2 9-2 17-10 23h34M153 48h24M153 68h35"
          opacity={0.24}
          strokeWidth={2.2}
          transform="translate(174 49) scale(.78) translate(-174 -49)"
        />
        <Circle cx="121" cy="62" r="17" opacity={0.11} strokeWidth={1.5} />
        <Circle cx="220" cy="31" r="13" opacity={0.1} strokeWidth={1.4} />
        <Path d="M105 86c24-8 48-9 70-3M191 79c13-5 25-5 37-1" opacity={0.12} strokeWidth={1.5} />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  artwork: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
