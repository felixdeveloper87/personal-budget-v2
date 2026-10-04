import Svg, { Circle, Defs, G, Path, RadialGradient, Rect, Stop } from "react-native-svg";

/** Faint white line drawing of a little street of houses, anchored bottom-right of the purple header. */
export function HouseLineArt() {
  return (
    <Svg height="100%" preserveAspectRatio="xMaxYMax meet" viewBox="0 0 600 260" width="100%">
      <Defs>
        <RadialGradient id="hhGlow" cx="70%" cy="62%" r="42%">
          <Stop offset="0" stopColor="#D9A8FF" stopOpacity="0.22" />
          <Stop offset="1" stopColor="#D9A8FF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect fill="url(#hhGlow)" height="260" width="600" />

      <G fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round">
        {/* small house */}
        <G strokeOpacity={0.13} strokeWidth={2.2}>
          <Path d="M250 236V184l40-32 40 32v52" />
          <Path d="M241 191l49-39 49 39" />
          <Rect height="32" rx="2" width="24" x="278" y="204" />
        </G>

        {/* main house with chimney */}
        <G strokeOpacity={0.22} strokeWidth={2.6}>
          <Path d="M350 236V160l76-60 76 60v76" />
          <Path d="M334 171l92-72 92 72" />
          <Path d="M472 124V86h20v53" />
          <Rect height="50" rx="3" width="44" x="404" y="186" />
          <Rect height="26" rx="2" width="28" x="366" y="172" />
          <Path d="M380 172v26M366 185h28" />
          <Rect height="26" rx="2" width="28" x="458" y="172" />
          <Path d="M472 172v26M458 185h28" />
        </G>
        <G strokeOpacity={0.15} strokeWidth={2.2}>
          <Path d="M481 76c-9-7 7-13-2-22" />
          <Path d="M492 66c-7-6 6-11-1-18" />
        </G>

        {/* tall house */}
        <G strokeOpacity={0.11} strokeWidth={2.2}>
          <Path d="M530 236V138l36-26 36 26v98" />
          <Rect height="16" rx="1" width="16" x="550" y="152" />
          <Rect height="34" rx="2" width="20" x="556" y="202" />
        </G>

        {/* ground + tree */}
        <Path d="M220 237h380" strokeOpacity={0.17} strokeWidth={2.2} />
        <G strokeOpacity={0.13} strokeWidth={2.2}>
          <Circle cx="335" cy="200" r="13" />
          <Path d="M335 213v23" />
        </G>
      </G>

      <G fill="#FFFFFF">
        <Circle cx="300" cy="70" fillOpacity={0.28} r="2" />
        <Circle cx="560" cy="64" fillOpacity={0.22} r="1.6" />
        <Circle cx="380" cy="40" fillOpacity={0.2} r="1.4" />
      </G>
    </Svg>
  );
}
