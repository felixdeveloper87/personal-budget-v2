import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";

/** A warm dusk landscape – mirrors the web ExpenseHeroArtwork. */
export function ExpenseHeroArtwork() {
  return (
    <Svg
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 390 320"
      width="100%"
    >
      <Defs>
        <LinearGradient id="expenseSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#E9E5DE" />
          <Stop offset="0.52" stopColor="#F0D3C1" />
          <Stop offset="1" stopColor="#E9B797" />
        </LinearGradient>
        <LinearGradient id="expenseGround" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#C8B69E" />
          <Stop offset="0.55" stopColor="#A8A995" />
          <Stop offset="1" stopColor="#718477" />
        </LinearGradient>
        <LinearGradient id="expensePath" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#F1D6BD" />
          <Stop offset="1" stopColor="#D99E7D" />
        </LinearGradient>
        <LinearGradient id="expenseGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0" stopColor="#FFF0D0" stopOpacity="0.8" />
          <Stop offset="1" stopColor="#FFF0D0" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <Rect width="390" height="320" fill="url(#expenseSky)" />
      <Circle cx="58" cy="112" r="15" fill="#FFE6B7" opacity="0.9" />
      <Circle cx="58" cy="112" r="33" fill="#FFE5BA" opacity="0.2" />
      <Rect x="0" y="132" width="245" height="48" fill="url(#expenseGlow)" />

      <Path d="M0 157c39-20 76-24 112-8 38-31 83-35 126-8 43-26 93-26 152 1v68H0Z" fill="#A89F8D" opacity="0.72" />
      <Path d="M0 181c46-24 92-21 139-3 50-37 109-36 158-3 34-21 63-24 93-18v72H0Z" fill="#7F8D79" opacity="0.72" />
      <Path d="M0 205c61-19 117-13 163 10 51-26 112-29 167-5 22-12 42-17 60-17v127H0Z" fill="url(#expenseGround)" />

      <Path d="M185 320c15-38 35-65 59-85 18-15 21-30 8-45-7-8-5-16 7-25 13-9 20-17 21-26 12 18 13 33 3 46-9 12-6 24 10 37 25 21 42 54 54 98Z" fill="url(#expensePath)" opacity="0.9" />
      <Path d="M207 320c13-36 31-62 52-82 17-16 19-31 7-45-8-9-7-18 5-27" fill="none" stroke="#F7E6D5" strokeWidth="2" strokeLinecap="round" opacity="0.62" />

      <G fill="#596F61" opacity="0.88">
        <Path d="m15 244 13-35 13 35Z" />
        <Rect x="26" y="241" width="3" height="18" />
        <Path d="m47 231 17-47 17 47Z" />
        <Rect x="62" y="227" width="4" height="24" />
        <Path d="m91 255 12-34 12 34Z" />
        <Rect x="102" y="252" width="3" height="17" />
        <Path d="m329 235 15-43 15 43Z" />
        <Rect x="342" y="231" width="4" height="22" />
        <Path d="m360 253 12-35 12 35Z" />
        <Rect x="371" y="249" width="3" height="18" />
      </G>

      <G fill="#E7C5A8" stroke="#7D7468" strokeWidth="1" opacity="0.9">
        <Path d="M118 190h47v32h-47Z" />
        <Path d="m112 191 30-21 30 21Z" />
        <Rect x="128" y="199" width="9" height="11" fill="#F6DFC0" />
        <Rect x="148" y="198" width="8" height="24" fill="#806A5D" />
      </G>

      <G fill="none" stroke="#EBD6C2" strokeLinecap="round" opacity="0.42">
        <Path d="M0 267c56-9 101-8 151 1" strokeWidth="2" />
        <Path d="M18 288c65-8 113-5 165 3" strokeWidth="1.5" />
        <Path d="M294 272c38-6 67-5 96 0" strokeWidth="1.6" />
      </G>
    </Svg>
  );
}
