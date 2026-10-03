import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";

/** Decorative orbits: the month in motion, rather than another data chart. */
export function DashboardHeroArtwork() {
  return (
    <Svg height="100%" viewBox="0 0 240 240" width="100%">
      <G transform="rotate(-32 120 120)" fill="none" stroke="#D6EF9B">
        <Ellipse cx="120" cy="120" rx="108" ry="42" strokeOpacity="0.18" />
        <Ellipse cx="120" cy="120" rx="108" ry="70" strokeOpacity="0.13" />
        <Circle cx="120" cy="120" r="108" strokeOpacity="0.1" />
        <Path d="M12 120a108 42 0 0 1 108-42" strokeOpacity="0.6" strokeWidth="1.5" />
        <Circle cx="120" cy="78" r="5" fill="#D6EF9B" stroke="none" />
        <Circle cx="120" cy="78" r="11" strokeOpacity="0.2" />
      </G>
      <Circle cx="186" cy="157" r="3" fill="#D6EF9B" opacity="0.4" />
    </Svg>
  );
}
