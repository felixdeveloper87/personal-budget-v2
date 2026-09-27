import Svg, { Circle, Defs, G, LinearGradient, Path, Polygon, Rect, Stop } from "react-native-svg";

/** A warm, layered landscape that fills the mobile Household hero. */
interface HouseholdLandscapeProps {
  width: number;
  height: number;
}

export function HouseholdLandscape({ width, height }: HouseholdLandscapeProps) {
  return (
    <Svg height={height} preserveAspectRatio="xMidYMid slice" viewBox="0 0 390 560" width={width}>
      <Defs>
        <LinearGradient id="householdSky" x1="0%" y1="0%" x2="20%" y2="100%">
          <Stop offset="0" stopColor="#59A9D2" />
          <Stop offset="0.56" stopColor="#B8D9D9" />
          <Stop offset="1" stopColor="#D4DFBF" />
        </LinearGradient>
        <LinearGradient id="householdShade" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#123E35" stopOpacity="0" />
          <Stop offset="0.48" stopColor="#123E35" stopOpacity="0.28" />
          <Stop offset="1" stopColor="#0D3D34" stopOpacity="0.83" />
        </LinearGradient>
      </Defs>

      <Rect height="560" width="390" fill="url(#householdSky)" />
      <Circle cx="318" cy="181" fill="#F8D9B3" opacity="0.83" r="39" />
      <Path d="M207 139c12-21 36-21 48-1 17-2 28 8 28 21h-91c0-10 5-17 15-20Z" fill="#FFF5E6" opacity="0.7" />
      <Path d="M76 175c9-15 27-15 36 0 12-1 20 6 20 16H65c0-8 4-14 11-16Z" fill="#FFF8EC" opacity="0.64" />

      <Path d="M0 251 49 208l42 34 47-64 61 70 56-66 46 57 45-42 44 49v139H0Z" fill="#8CB9B4" />
      <Path d="m0 277 62-48 54 49 52-45 63 54 51-48 52 45 56-38v111H0Z" fill="#6C9F8D" />
      <Path d="M0 319c48-39 102-34 148-4 48-45 100-40 150-4 32-23 62-26 92-9v119H0Z" fill="#477E68" />
      <Path d="M0 355c52-42 109-29 155 2 48-41 102-35 144 0 32-28 59-30 91-12v95H0Z" fill="#75A879" />
      <Path d="M0 389c44-30 96-28 137 2 49-31 101-24 141 8 38-29 74-25 112-7v73H0Z" fill="#9BB780" />

      <G transform="translate(0 87) scale(1 0.65)">
      <Path d="M194 270h151v143H194z" fill="#F5EAD0" />
      <Path d="M184 279 247 214l110 22 18 43Z" fill="#244A4E" />
      <Path d="m247 214 110 22 18 43h-72l-28-37-45 37h-46Z" fill="#315C5C" />
      <Path d="m250 220 13 2 24 55h-16Z" fill="#78989A" opacity="0.76" />
      <Path d="M312 221v-25h15v28" fill="#294E4F" />
      <Rect x="208" y="302" width="25" height="25" fill="#D8EAE0" />
      <Path d="M220.5 302v25m-12.5-12.5h25" stroke="#83AFAA" strokeWidth="3" />
      <Rect x="276" y="302" width="25" height="25" fill="#D8EAE0" />
      <Path d="M288.5 302v25M276 314.5h25" stroke="#83AFAA" strokeWidth="3" />
      <Rect x="255" y="350" width="26" height="63" rx="3" fill="#D98D57" />
      <Circle cx="274" cy="381" fill="#F4D9A6" r="2.3" />
      <Path d="M186 414h175" stroke="#D0D2B4" strokeWidth="5" />
      <Path d="M166 418c42-11 68-12 100-7 35-7 66-5 97 8l-7 22H171Z" fill="#C8C49C" opacity="0.72" />
      </G>

      <Path d="M0 236c13-17 32-22 48-8 12-20 36-21 49-2 11-4 23 3 29 17v99H0Z" fill="#43815F" />
      <Rect x="26" y="217" width="5" height="139" fill="#4D6650" />
      <Circle cx="25" cy="214" r="29" fill="#3F865F" />
      <Circle cx="7" cy="234" r="24" fill="#4D9668" />
      <Circle cx="48" cy="232" r="25" fill="#559B6D" />
      <Circle cx="69" cy="250" r="22" fill="#498A61" />
      <Path d="M29 254v37m-12-23 12 14 12-14" fill="none" stroke="#356D50" strokeLinecap="round" strokeWidth="3" />

      <Path d="M332 244c14-22 40-22 55-1v130h-81c-13-25-1-55 20-62-13-25-9-48 6-67Z" fill="#508F68" />
      <Circle cx="340" cy="236" r="31" fill="#72A978" />
      <Circle cx="373" cy="248" r="29" fill="#4C9268" />
      <Circle cx="357" cy="277" r="24" fill="#5E9D70" />

      <Path d="M0 428c42-27 86-21 119 9 37-26 74-27 111 0 49-35 100-29 160 4v119H0Z" fill="#437A52" />
      <Path d="M0 469c56-35 101-20 138 15 47-36 97-31 139 3 34-27 73-32 113-11v84H0Z" fill="#285F45" />
      <Path d="M0 510c49-23 89-22 130 10 45-29 92-21 129 5 43-31 83-31 131-4v39H0Z" fill="#1B503D" />
      <Path d="M0 324V0h77C54 48 39 91 48 131c-15 53-26 121-19 193Z" fill="#174D3F" opacity="0.8" />
      <Path d="M0 0h79C55 33 42 62 37 93 22 71 11 54 0 46Z" fill="#245B42" />
      <Path d="M0 0c29 4 45 20 55 45M0 26c18 8 30 20 39 38M12 0c9 19 15 34 19 51" fill="none" stroke="#356E4D" strokeLinecap="round" strokeWidth="5" />
      <Circle cx="9" cy="429" fill="#77955B" r="21" />
      <Circle cx="38" cy="447" fill="#49794B" r="25" />
      <Circle cx="353" cy="431" fill="#6B9257" r="26" />
      <Circle cx="380" cy="455" fill="#386D47" r="24" />

      <Rect height="560" width="390" fill="url(#householdShade)" />
    </Svg>
  );
}
