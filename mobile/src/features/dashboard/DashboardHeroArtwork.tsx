import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";

/** Deep forest backdrop with flowing contour lines: the month in motion, not another data chart. */
export function DashboardHeroArtwork() {
  return (
    <Svg height="100%" preserveAspectRatio="xMaxYMin slice" viewBox="0 0 360 420" width="100%">
      <Defs>
        <LinearGradient id="dashHeroBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#14303A" />
          <Stop offset="0.55" stopColor="#1C4049" />
          <Stop offset="1" stopColor="#285A60" />
        </LinearGradient>
        <RadialGradient id="dashHeroGlow" cx="88%" cy="6%" r="62%">
          <Stop offset="0" stopColor="#D6EF9B" stopOpacity="0.26" />
          <Stop offset="0.5" stopColor="#D6EF9B" stopOpacity="0.07" />
          <Stop offset="1" stopColor="#D6EF9B" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="dashHeroStroke" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0" stopColor="#D6EF9B" stopOpacity="0" />
          <Stop offset="0.55" stopColor="#D6EF9B" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#D6EF9B" stopOpacity="0.9" />
        </LinearGradient>
      </Defs>

      <Rect height="420" width="360" fill="url(#dashHeroBase)" />
      <Rect height="420" width="360" fill="url(#dashHeroGlow)" />

      <G fill="none" stroke="#D6EF9B" strokeLinecap="round">
        <Path d="M120 0c40 34 92 48 150 44 34-2 62 6 90 22" strokeOpacity="0.1" />
        <Path d="M150 0c32 26 76 36 124 34 30-1 58 6 86 20" strokeOpacity="0.14" />
        <Path d="M184 0c26 18 58 26 94 25 28 0 56 5 82 17" strokeOpacity="0.18" />
        <Path d="M60 128c60 6 110-10 160-40 46-28 92-34 140-22" strokeOpacity="0.07" />
        <Path d="M0 236c70-8 132 4 196-10 62-14 108-40 164-38" strokeOpacity="0.06" />
      </G>

      <Path d="M170 112c38-6 64-30 96-52 30-21 60-26 94-22" fill="none" stroke="url(#dashHeroStroke)" strokeLinecap="round" strokeWidth="1.6" />
      <Circle cx="314" cy="40" r="4" fill="#D6EF9B" />
      <Circle cx="314" cy="40" r="10" fill="none" stroke="#D6EF9B" strokeOpacity="0.28" />
      <Circle cx="314" cy="40" r="18" fill="none" stroke="#D6EF9B" strokeOpacity="0.1" />
      <Circle cx="252" cy="70" r="1.6" fill="#D6EF9B" opacity="0.5" />
      <Circle cx="208" cy="96" r="1.2" fill="#D6EF9B" opacity="0.35" />
    </Svg>
  );
}
