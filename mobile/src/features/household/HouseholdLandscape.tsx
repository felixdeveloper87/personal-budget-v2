import Svg, { Circle, Path, Polygon, Rect } from "react-native-svg";

/** A small, scalable native illustration used as the Household hero backdrop. */
export function HouseholdLandscape() {
  return (
    <Svg
      height="138"
      preserveAspectRatio="xMidYMax slice"
      viewBox="0 0 390 150"
      width="100%"
    >
      <Path d="M0 96 C31 73 63 80 91 99 C119 68 155 76 184 98 C213 73 246 77 277 98 C312 68 350 79 390 99 L390 150 L0 150Z" fill="#C6E4DE" />
      <Path d="M0 117 C29 96 57 104 86 122 C121 91 151 100 181 121 C214 94 248 105 274 124 C312 91 347 101 390 122 L390 150 L0 150Z" fill="#9CCDB8" />
      <Path d="M0 132 C34 115 72 118 102 135 C138 112 164 119 197 137 C234 111 269 121 300 138 C334 117 366 122 390 134 L390 150 L0 150Z" fill="#71AE8F" />

      <Path d="M108 28 C116 17 129 18 135 28 C143 27 148 32 148 38 L100 38 C100 32 103 29 108 28Z" fill="#FFFFFF" opacity="0.63" />
      <Path d="M273 19 C280 10 291 11 297 20 C304 19 309 24 309 29 L267 29 C267 24 269 21 273 19Z" fill="#FFFFFF" opacity="0.58" />

      <Rect fill="#7C9E87" height="57" width="4" x="22" y="75" />
      <Circle cx="22" cy="73" fill="#4D9874" r="19" />
      <Circle cx="9" cy="83" fill="#61A57E" r="14" />
      <Circle cx="34" cy="84" fill="#5BA27A" r="15" />
      <Path d="M22 91 L22 104 M16 84 L22 91 L27 86" fill="none" stroke="#397756" strokeLinecap="round" strokeWidth="2" />

      <Rect fill="#72957E" height="35" width="3" x="150" y="96" />
      <Circle cx="151" cy="93" fill="#70B08E" r="13" />
      <Circle cx="141" cy="98" fill="#83BE9C" r="10" />
      <Circle cx="160" cy="99" fill="#65A985" r="10" />

      <Rect fill="#F8F6EC" height="66" rx="2" width="87" x="226" y="67" />
      <Polygon fill="#46666A" points="216,72 253,35 320,47 328,72" />
      <Polygon fill="#38575E" points="253,35 320,47 328,72 275,72" />
      <Polygon fill="#78949A" points="255,39 266,41 278,70 265,70" />
      <Rect fill="#D9EBE6" height="14" width="14" x="239" y="79" />
      <Path d="M246 79 V93 M239 86 H253" stroke="#8DB5AE" strokeWidth="2" />
      <Rect fill="#D9EBE6" height="14" width="14" x="281" y="79" />
      <Path d="M288 79 V93 M281 86 H295" stroke="#8DB5AE" strokeWidth="2" />
      <Rect fill="#D99662" height="31" rx="2" width="15" x="260" y="102" />
      <Circle cx="271" cy="118" fill="#F4DEAE" r="1.4" />

      <Path d="M0 137 C45 126 78 130 119 140 C160 128 197 131 232 141 C280 128 334 130 390 137 L390 150 L0 150Z" fill="#68A986" />
      <Path d="M311 102 C326 84 343 82 358 99 C369 87 385 92 390 105 L390 137 C358 132 335 132 306 138Z" fill="#62A77F" />
      <Circle cx="340" cy="91" fill="#75B68F" r="18" />
      <Circle cx="369" cy="96" fill="#59A078" r="20" />
    </Svg>
  );
}
