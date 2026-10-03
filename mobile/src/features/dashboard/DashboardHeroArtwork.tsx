import Svg, { Circle, Defs, G, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";

/** Purple gradient with faint concentric rings anchored top-right; texture that never competes with the copy. */
export function DashboardHeroArtwork() {
  return (
    <Svg height="100%" preserveAspectRatio="xMaxYMid slice" viewBox="0 0 360 160" width="100%">
      <Defs>
        <LinearGradient id="dashHeaderBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#6E08B3" />
          <Stop offset="0.6" stopColor="#820AD1" />
          <Stop offset="1" stopColor="#8F1BDC" />
        </LinearGradient>
        <RadialGradient id="dashHeaderGlow" cx="90%" cy="20%" r="55%">
          <Stop offset="0" stopColor="#D9A8FF" stopOpacity="0.22" />
          <Stop offset="1" stopColor="#D9A8FF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect height="160" width="360" fill="url(#dashHeaderBase)" />
      <Rect height="160" width="360" fill="url(#dashHeaderGlow)" />
      <G fill="none" stroke="#FFFFFF">
        <Circle cx="330" cy="40" r="60" strokeOpacity="0.08" />
        <Circle cx="330" cy="40" r="96" strokeOpacity="0.06" />
        <Circle cx="330" cy="40" r="132" strokeOpacity="0.045" />
        <Circle cx="330" cy="40" r="168" strokeOpacity="0.03" />
      </G>
      <Circle cx="252" cy="112" r="2.5" fill="#FFFFFF" opacity="0.25" />
    </Svg>
  );
}
