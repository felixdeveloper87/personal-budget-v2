import { StyleSheet } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

export function CleaningCardArtwork() {
  return (
    <Svg
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      preserveAspectRatio="xMaxYMid slice"
      style={styles.artwork}
      viewBox="0 0 360 220"
    >
      <Circle cx="329" cy="108" r="112" fill="#820AD1" opacity={0.065} />
      <Path
        d="M206 220c21-37 50-57 87-60 30-3 52-14 67-34v94Z"
        fill="#820AD1"
        opacity={0.08}
      />

      <G fill="none" stroke="#820AD1" strokeLinecap="round" strokeLinejoin="round">
        <G opacity={0.22} strokeWidth={2}>
          <Path fill="#820AD1" fillOpacity={0.06} d="M279 68h35l-3 18c-1 6 1 11 6 15l8 7c5 4 7 10 7 16v46c0 8-6 14-14 14h-48c-8 0-14-6-14-14v-45c0-8 3-14 9-19l8-6c5-4 7-9 6-15Z" />
          <Path d="M278 68V57h28l13 7-4 9-15-5" />
          <Path d="M286 57v-9h17v9" />
          <Path d="M257 133c20 8 46 7 74-3" />
          <Path d="M267 108c13 5 35 5 51 0" opacity={0.58} />
        </G>

        <G opacity={0.28} strokeWidth={1.7}>
          <Circle cx="242" cy="76" r="8" />
          <Circle cx="326" cy="42" r="5" />
          <Circle cx="345" cy="76" r="10" />
          <Circle cx="229" cy="116" r="4" />
        </G>

        <G opacity={0.36} strokeWidth={1.8}>
          <Path d="M236 42v14M229 49h14" />
          <Path d="m220 70 3 4 4 3-4 3-3 4-3-4-4-3 4-3Z" />
          <Path d="m340 18 4 6 6 4-6 4-4 6-4-6-6-4 6-4Z" />
        </G>
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
