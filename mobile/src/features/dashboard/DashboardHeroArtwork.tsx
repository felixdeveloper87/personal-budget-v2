import Svg, { Circle, G } from "react-native-svg";

/** Faint concentric rings anchored top-right; texture for the flat brand header, never competing with the copy. */
export function DashboardHeroArtwork() {
  return (
    <Svg height="100%" preserveAspectRatio="xMaxYMid slice" viewBox="0 0 360 160" width="100%">
      <G fill="none" stroke="#FFFFFF">
        <Circle cx="330" cy="40" r="60" strokeOpacity="0.07" />
        <Circle cx="330" cy="40" r="96" strokeOpacity="0.055" />
        <Circle cx="330" cy="40" r="132" strokeOpacity="0.04" />
        <Circle cx="330" cy="40" r="168" strokeOpacity="0.03" />
      </G>
      <Circle cx="252" cy="112" r="2.5" fill="#FFFFFF" opacity="0.25" />
    </Svg>
  );
}
