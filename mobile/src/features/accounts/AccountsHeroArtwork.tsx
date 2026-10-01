import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";

/** A quiet lakeside town in the same editorial landscape style as the other mobile heroes. */
export function AccountsHeroArtwork() {
  return (
    <Svg
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 390 320"
      width="100%"
    >
      <Defs>
        <LinearGradient id="accountsSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#DDE8E6" />
          <Stop offset="0.55" stopColor="#C9DDD9" />
          <Stop offset="1" stopColor="#B7D0CA" />
        </LinearGradient>
        <LinearGradient id="accountsWater" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#CFE0DA" />
          <Stop offset="0.55" stopColor="#A9C3BD" />
          <Stop offset="1" stopColor="#759B95" />
        </LinearGradient>
        <LinearGradient id="accountsLight" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0" stopColor="#FFF6D7" stopOpacity="0.72" />
          <Stop offset="0.7" stopColor="#FFF6D7" stopOpacity="0.08" />
          <Stop offset="1" stopColor="#FFF6D7" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <Rect height="184" width="390" fill="url(#accountsSky)" />
      <Circle cx="53" cy="94" r="16" fill="#FFF2C7" opacity="0.82" />
      <Circle cx="53" cy="94" r="35" fill="#FFF5D6" opacity="0.2" />
      <Rect x="0" y="116" width="248" height="58" fill="url(#accountsLight)" />

      <Path d="M0 155c45-24 79-27 116-9 44-35 91-39 137-9 42-28 88-28 137-6v71H0Z" fill="#91AAA1" opacity="0.68" />
      <Path d="M0 177c46-24 91-23 138-3 52-38 107-37 159-3 35-22 65-25 93-18v64H0Z" fill="#698A82" opacity="0.72" />

      <G opacity="0.9">
        <Path d="M263 167h79v43h-79Z" fill="#DDE4DA" />
        <Path d="m254 168 48-31 49 31Z" fill="#486C68" />
        <Rect x="272" y="178" width="10" height="32" fill="#76928B" />
        <Rect x="296" y="178" width="11" height="32" fill="#76928B" />
        <Rect x="320" y="178" width="10" height="32" fill="#76928B" />
        <Rect x="255" y="209" width="95" height="6" rx="2" fill="#486C68" />
      </G>

      <Rect y="204" width="390" height="116" fill="url(#accountsWater)" />
      <G fill="none" strokeLinecap="round">
        <Path d="M7 226c67 4 122 2 187-2M77 247c92 4 179 1 280-4M0 278c95-1 181 4 283 0M122 303c78 4 157 1 250-3" stroke="#E7F0EA" strokeWidth="2" opacity="0.46" />
        <Path d="M235 231c49 5 95 3 145-3M20 260c49 3 94 2 143-1M16 305c44 2 90 1 136-1" stroke="#668E87" strokeWidth="1.5" opacity="0.34" />
      </G>

      <G fill="#3F6860" opacity="0.82">
        <Path d="m8 213 15-41 15 41Z" />
        <Rect x="21" y="208" width="4" height="20" />
        <Path d="m43 219 12-34 13 34Z" />
        <Rect x="54" y="215" width="3" height="17" />
        <Path d="m360 220 13-37 13 37Z" />
        <Rect x="371" y="216" width="4" height="20" />
      </G>

      <Path d="M253 216c35 8 66 8 99 0" fill="none" stroke="#EAF1EC" strokeWidth="2" opacity="0.42" />
    </Svg>
  );
}
