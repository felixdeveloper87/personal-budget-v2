import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

/** A lightweight, sunlit home illustration for the dashboard hero. */
export function DashboardHeroArtwork() {
  return (
    <Svg
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 390 720"
      width="100%"
    >
      <Defs>
        <LinearGradient id="dashboardWall" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#F8E8CB" />
          <Stop offset="0.58" stopColor="#EAD2A9" />
          <Stop offset="1" stopColor="#D8B47A" />
        </LinearGradient>
        <LinearGradient id="dashboardSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#BEE1E5" />
          <Stop offset="0.65" stopColor="#E7EACB" />
          <Stop offset="1" stopColor="#9EBB78" />
        </LinearGradient>
        <LinearGradient id="dashboardTable" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#E9B965" />
          <Stop offset="0.52" stopColor="#C9873F" />
          <Stop offset="1" stopColor="#98602E" />
        </LinearGradient>
        <LinearGradient id="dashboardLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#FFF7D9" stopOpacity="0.72" />
          <Stop offset="1" stopColor="#FFF1B5" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <Rect height="720" width="390" fill="url(#dashboardWall)" />

      <Rect x="238" y="0" width="152" height="410" fill="#F4DDB5" />
      <Rect x="251" y="0" width="126" height="396" fill="url(#dashboardSky)" />
      <Rect x="245" y="0" width="8" height="425" fill="#F8EBD2" />
      <Rect x="374" y="0" width="7" height="425" fill="#C99E69" opacity="0.72" />
      <Rect x="306" y="0" width="7" height="408" fill="#E9D5AE" opacity="0.78" />
      <Path d="M251 326c32-35 67-46 126-23v93H251Z" fill="#9DB47A" />
      <Path d="M251 352c39-27 77-29 126-5v52H251Z" fill="#688A58" opacity="0.78" />
      <Path d="M274 342 315 301l45 41v54h-86Z" fill="#F2E1BD" />
      <Path d="m267 343 48-51 51 51h-17l-34-35-33 35Z" fill="#50615C" />
      <Rect x="305" y="344" width="19" height="52" fill="#D29A58" />

      <G fill="#5E8A3B">
        <Ellipse cx="363" cy="52" rx="32" ry="15" transform="rotate(-28 363 52)" />
        <Ellipse cx="340" cy="83" rx="31" ry="14" transform="rotate(18 340 83)" />
        <Ellipse cx="374" cy="119" rx="35" ry="16" transform="rotate(-22 374 119)" />
        <Ellipse cx="349" cy="151" rx="28" ry="13" transform="rotate(26 349 151)" />
      </G>
      <Path d="M388 0c-19 65-36 126-42 184" fill="none" stroke="#4E7037" strokeWidth="5" />

      <G opacity="0.2" fill="#657B4A">
        <Ellipse cx="47" cy="85" rx="42" ry="15" transform="rotate(-40 47 85)" />
        <Ellipse cx="85" cy="125" rx="38" ry="14" transform="rotate(34 85 125)" />
        <Ellipse cx="36" cy="178" rx="45" ry="16" transform="rotate(-28 36 178)" />
        <Ellipse cx="101" cy="215" rx="34" ry="13" transform="rotate(46 101 215)" />
      </G>

      <Path d="M0 376 390 334v386H0Z" fill="url(#dashboardTable)" />
      <Path d="M0 397 390 354" fill="none" stroke="#F4CE80" strokeWidth="9" opacity="0.62" />
      <Path d="M0 454 390 413M0 526l390-45M0 604l390-48" fill="none" stroke="#8F572D" strokeWidth="2" opacity="0.23" />
      <Path d="M0 380 214 356 390 612V720H272Z" fill="url(#dashboardLight)" />
      <Path d="m240 368 24-3 126 179v50Z" fill="#FFF2BC" opacity="0.2" />

      <G transform="translate(287 350)">
        <Ellipse cx="34" cy="89" rx="38" ry="10" fill="#704629" opacity="0.18" />
        <Path d="M8 14h54l-6 60c-2 16-11 22-21 22S16 90 14 74Z" fill="#F5E2C0" />
        <Path d="M61 29c29 1 27 44-2 45" fill="none" stroke="#F5E2C0" strokeWidth="9" />
        <Ellipse cx="35" cy="14" rx="27" ry="7" fill="#C48D55" />
        <Ellipse cx="35" cy="14" rx="21" ry="4" fill="#68422C" />
        <Path d="M25 2c-8-16 8-20 2-37M39 2c10-15-5-21 2-37" fill="none" stroke="#FFF5DE" strokeLinecap="round" strokeWidth="4" opacity="0.74" />
      </G>

      <G transform="translate(327 264)">
        <Path d="M30 110C9 71 5 36 13 0M31 110c17-42 26-77 24-105M31 110c2-45-1-78-14-104" fill="none" stroke="#426B32" strokeWidth="4" />
        <Ellipse cx="10" cy="20" rx="10" ry="27" fill="#79A641" transform="rotate(-31 10 20)" />
        <Ellipse cx="49" cy="27" rx="11" ry="31" fill="#659239" transform="rotate(34 49 27)" />
        <Ellipse cx="20" cy="55" rx="12" ry="30" fill="#86AD47" transform="rotate(-42 20 55)" />
        <Ellipse cx="51" cy="67" rx="12" ry="31" fill="#537F34" transform="rotate(37 51 67)" />
        <Path d="M4 105h57l-8 76H13Z" fill="#C98D55" />
      </G>

      <Circle cx="23" cy="659" r="70" fill="#3E6E2E" opacity="0.9" />
      <Circle cx="78" cy="696" r="62" fill="#6E9636" opacity="0.84" />
    </Svg>
  );
}
