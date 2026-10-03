import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from "react-native-svg";

interface HouseholdLandscapeProps {
  width: number;
  height: number;
}

export function HouseholdLandscape({
  width,
  height,
}: HouseholdLandscapeProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 390 560"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        {/* Sky */}
        <LinearGradient id="sky" x1="0%" y1="0%" x2="15%" y2="100%">
          {/* Soft lavender dusk — a quiet nod to the app's purple */}
          <Stop offset="0" stopColor="#8C92DA" />
          <Stop offset="0.55" stopColor="#CDB9E8" />
          <Stop offset="1" stopColor="#F1D3BF" />
        </LinearGradient>

        {/* Hero readability overlay (deep night-purple) */}
        <LinearGradient id="heroShade" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#2A1240" stopOpacity="0.04" />
          <Stop offset="0.48" stopColor="#2A1240" stopOpacity="0.16" />
          <Stop offset="0.76" stopColor="#261038" stopOpacity="0.43" />
          <Stop offset="1" stopColor="#1C0B2C" stopOpacity="0.78" />
        </LinearGradient>

        {/* Warm window */}
        <LinearGradient id="windowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#FFF0BF" />
          <Stop offset="1" stopColor="#E9B86D" />
        </LinearGradient>

        {/* Brick */}
        <LinearGradient id="brick" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#B86945" />
          <Stop offset="1" stopColor="#8D4935" />
        </LinearGradient>

        {/* Slate roof */}
        <LinearGradient id="roof" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#45545B" />
          <Stop offset="1" stopColor="#25383D" />
        </LinearGradient>
      </Defs>

      {/* =========================
          SKY
      ========================== */}

      <Rect width="390" height="560" fill="url(#sky)" />

      <Circle
        cx="321"
        cy="142"
        r="42"
        fill="#FFD9A8"
        opacity="0.82"
      />
      <Circle cx="321" cy="142" r="70" fill="#F6D9F0" opacity="0.22" />

      {/* Clouds */}

      <G opacity="0.7" fill="#FBF1FF">
        <Path d="M210 114c9-17 29-18 40-3 16-3 30 7 32 21h-88c1-9 6-15 16-18Z" />
        <Path d="M56 155c8-13 24-14 33-2 13-2 24 6 26 17H45c1-7 4-12 11-15Z" />
      </G>

      {/* =========================
          DISTANT ENGLISH HILLS
      ========================== */}

      <Path
        d="M0 217c47-28 94-35 143-12 54-39 106-37 151-8 38-22 69-25 96-12v93H0Z"
        fill="#9AA2C2"
      />

      <Path
        d="M0 244c53-28 99-25 144 2 50-34 100-29 147-1 36-22 69-23 99-8v73H0Z"
        fill="#6E8B80"
      />

      {/* Distant village */}

      <G opacity="0.82">
        <Rect x="34" y="238" width="30" height="25" fill="#E4D2B6" />
        <Polygon
          points="30,238 49,224 68,238"
          fill="#657076"
        />

        <Rect x="77" y="245" width="27" height="22" fill="#DCCBAF" />
        <Polygon
          points="73,245 90,232 108,245"
          fill="#59696D"
        />

        {/* Church */}
        <Rect x="119" y="220" width="25" height="53" fill="#D8CEB7" />
        <Polygon
          points="116,220 131.5,181 147,220"
          fill="#596A6E"
        />
        <Rect x="128" y="235" width="7" height="15" rx="3" fill="#718484" />
      </G>

      {/* =========================
          HOUSE
      ========================== */}

      <G transform="translate(0 22)">

        {/* Main wall */}
        <Path
          d="M137 264H352V437H137Z"
          fill="url(#brick)"
        />

        {/* Side extension */}
        <Path
          d="M104 314H160V437H104Z"
          fill="#A8583D"
        />

        {/* Roof */}
        <Polygon
          points="118,274 190,211 329,226 371,278"
          fill="url(#roof)"
        />

        {/* Roof highlight */}
        <Path
          d="M124 270 191 218l136 14"
          fill="none"
          stroke="#65767B"
          strokeWidth="4"
          opacity="0.65"
        />

        {/* Chimney left */}
        <Rect
          x="179"
          y="190"
          width="31"
          height="66"
          rx="2"
          fill="#A9583C"
        />

        <Rect
          x="176"
          y="187"
          width="37"
          height="8"
          rx="2"
          fill="#74402F"
        />

        <Rect
          x="185"
          y="176"
          width="7"
          height="15"
          fill="#873F2D"
        />

        <Rect
          x="198"
          y="176"
          width="7"
          height="15"
          fill="#873F2D"
        />

        {/* Chimney right */}
        <Rect
          x="314"
          y="199"
          width="29"
          height="59"
          rx="2"
          fill="#A9583C"
        />

        <Rect
          x="311"
          y="196"
          width="35"
          height="8"
          fill="#74402F"
        />

        <Rect
          x="319"
          y="185"
          width="7"
          height="15"
          fill="#873F2D"
        />

        <Rect
          x="332"
          y="185"
          width="7"
          height="15"
          fill="#873F2D"
        />

        {/* Subtle brick lines */}
        <G
          stroke="#D38A67"
          strokeWidth="1"
          opacity="0.32"
        >
          <Path d="M145 291h198" />
          <Path d="M145 310h198" />
          <Path d="M145 329h198" />
          <Path d="M145 348h198" />
          <Path d="M145 367h198" />
          <Path d="M145 386h198" />
          <Path d="M145 405h198" />
        </G>

        {/* =========================
            UPPER WINDOWS
        ========================== */}

        <G>
          <Rect
            x="166"
            y="289"
            width="42"
            height="50"
            rx="2"
            fill="#EEE4D0"
          />

          <Rect
            x="171"
            y="294"
            width="32"
            height="40"
            fill="#CDE0D9"
          />

          <Path
            d="M187 294v40M171 314h32"
            stroke="#F7F0DE"
            strokeWidth="3"
          />

          <Rect
            x="273"
            y="292"
            width="42"
            height="50"
            rx="2"
            fill="#EEE4D0"
          />

          <Rect
            x="278"
            y="297"
            width="32"
            height="40"
            fill="#CDE0D9"
          />

          <Path
            d="M294 297v40M278 317h32"
            stroke="#F7F0DE"
            strokeWidth="3"
          />
        </G>

        {/* =========================
            BAY WINDOW
        ========================== */}

        <Path
          d="M118 356h66l12 15v66h-90v-66Z"
          fill="#E8DDC7"
        />

        <Polygon
          points="105,370 119,350 184,350 198,370"
          fill="#34494D"
        />

        <Rect
          x="116"
          y="375"
          width="69"
          height="51"
          fill="url(#windowGlow)"
        />

        <Path
          d="M139 375v51M162 375v51M116 400h69"
          stroke="#F7F0E1"
          strokeWidth="4"
        />

        {/* =========================
            FRONT DOOR
        ========================== */}

        <Rect
          x="235"
          y="360"
          width="42"
          height="77"
          rx="2"
          fill="#4A1F6E"
        />

        <Rect
          x="241"
          y="369"
          width="30"
          height="26"
          rx="2"
          fill="#5C2A86"
        />

        <Rect
          x="241"
          y="402"
          width="30"
          height="27"
          rx="2"
          fill="#5C2A86"
        />

        <Circle
          cx="268"
          cy="398"
          r="2.5"
          fill="#D7AE64"
        />

        {/* Door canopy */}
        <Polygon
          points="226,360 256,337 286,360"
          fill="#EEE5D4"
        />

        <Polygon
          points="232,358 256,341 280,358"
          fill="#384B4E"
        />

        {/* Lamp */}
        <Circle
          cx="288"
          cy="377"
          r="5"
          fill="#F8C86D"
          opacity="0.9"
        />

        <Path
          d="M288 371v-8"
          stroke="#263D3C"
          strokeWidth="3"
        />

        {/* Ivy */}
        <G fill="#47724A">
          <Circle cx="222" cy="359" r="12" />
          <Circle cx="218" cy="344" r="10" />
          <Circle cx="225" cy="331" r="8" />

          <Circle cx="284" cy="355" r="11" />
          <Circle cx="290" cy="341" r="10" />
          <Circle cx="295" cy="328" r="8" />
        </G>

        <G fill="#F4E5C8">
          <Circle cx="217" cy="342" r="2.5" />
          <Circle cx="226" cy="351" r="2.5" />
          <Circle cx="288" cy="339" r="2.5" />
          <Circle cx="296" cy="349" r="2.5" />
        </G>
      </G>

      {/* =========================
          GARDEN
      ========================== */}

      <Path
        d="M0 406c45-31 89-24 127 7 37-27 75-29 113-3 48-34 100-31 150 0v150H0Z"
        fill="#557B45"
      />

      <Path
        d="M0 443c46-29 93-20 132 12 46-33 93-31 137 3 42-28 82-25 121-4v106H0Z"
        fill="#356B43"
      />

      {/* Gravel driveway */}
      <Path
        d="M113 560c21-51 48-91 91-120h115c-14 36-24 75-25 120Z"
        fill="#C8B58B"
      />

      <Path
        d="M134 560c18-45 43-82 82-111"
        stroke="#E1CFAB"
        strokeWidth="4"
        opacity="0.65"
      />

      {/* Bushes */}

      <G>
        <Circle cx="25" cy="422" r="34" fill="#447747" />
        <Circle cx="57" cy="431" r="29" fill="#56864F" />
        <Circle cx="91" cy="425" r="27" fill="#3F7545" />

        <Circle cx="329" cy="417" r="33" fill="#4E7F48" />
        <Circle cx="364" cy="429" r="31" fill="#376D43" />
      </G>

      {/* Flowers */}

      <G fill="#F4E7DC">
        <Circle cx="54" cy="415" r="4" />
        <Circle cx="68" cy="426" r="3.5" />
        <Circle cx="82" cy="412" r="4" />

        <Circle cx="324" cy="408" r="4" />
        <Circle cx="341" cy="418" r="3.5" />
        <Circle cx="355" cy="405" r="4" />
      </G>

      <G fill="#B9A3D8">
        <Circle cx="95" cy="435" r="4" />
        <Circle cx="105" cy="426" r="3" />
        <Circle cx="316" cy="433" r="4" />
        <Circle cx="327" cy="441" r="3" />
      </G>

      {/* =========================
          SCOOTER COMPONENT #1
          Grey NMAX-style
      ========================== */}

      <G transform="translate(27 432) scale(.72)">
        {/* wheels */}
        <Circle cx="31" cy="77" r="17" fill="#152323" />
        <Circle cx="31" cy="77" r="10" fill="#647173" />
        <Circle cx="104" cy="77" r="17" fill="#152323" />
        <Circle cx="104" cy="77" r="10" fill="#647173" />

        {/* rear delivery box */}
        <Rect
          x="5"
          y="12"
          width="43"
          height="33"
          rx="4"
          fill="#202A2B"
        />

        <Rect
          x="8"
          y="15"
          width="37"
          height="5"
          rx="2"
          fill="#455052"
        />

        {/* bike body */}
        <Path
          d="M27 49c17-12 42-13 60-4l23 16-11 16H49L24 64Z"
          fill="#727B7D"
        />

        <Path
          d="M45 49c12-8 29-9 42-3l-10 18H50Z"
          fill="#92999A"
        />

        {/* seat */}
        <Path
          d="M36 41h46c6 0 9 4 8 8H41Z"
          fill="#1A2526"
        />

        {/* front fairing */}
        <Path
          d="M87 42c10-4 17 2 20 13l8 19H94l-11-20Z"
          fill="#606B6D"
        />

        {/* windshield */}
        <Path
          d="M91 39 99 20c4-3 8-2 11 2l-3 21Z"
          fill="#274348"
          opacity="0.85"
        />

        {/* handlebars */}
        <Path
          d="M98 33h17"
          stroke="#202C2D"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* light */}
        <Path
          d="M103 50h8l4 9h-12Z"
          fill="#E6D8AD"
        />
      </G>

      {/* =========================
          SCOOTER #2
      ========================== */}

      <G transform="translate(132 426) scale(.76)">
        <Circle cx="31" cy="77" r="17" fill="#152323" />
        <Circle cx="31" cy="77" r="10" fill="#647173" />
        <Circle cx="104" cy="77" r="17" fill="#152323" />
        <Circle cx="104" cy="77" r="10" fill="#647173" />

        <Rect
          x="5"
          y="12"
          width="43"
          height="33"
          rx="4"
          fill="#202A2B"
        />

        <Rect
          x="8"
          y="15"
          width="37"
          height="5"
          rx="2"
          fill="#455052"
        />

        <Path
          d="M27 49c17-12 42-13 60-4l23 16-11 16H49L24 64Z"
          fill="#747D7F"
        />

        <Path
          d="M45 49c12-8 29-9 42-3l-10 18H50Z"
          fill="#989FA0"
        />

        <Path
          d="M36 41h46c6 0 9 4 8 8H41Z"
          fill="#172324"
        />

        <Path
          d="M87 42c10-4 17 2 20 13l8 19H94l-11-20Z"
          fill="#626D6F"
        />

        <Path
          d="M91 39 99 20c4-3 8-2 11 2l-3 21Z"
          fill="#274348"
          opacity="0.85"
        />

        <Path
          d="M98 33h17"
          stroke="#202C2D"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <Path
          d="M103 50h8l4 9h-12Z"
          fill="#E6D8AD"
        />
      </G>

      {/* =========================
          SCOOTER #3
      ========================== */}

      <G transform="translate(241 440) scale(.64)">
        <Circle cx="31" cy="77" r="17" fill="#152323" />
        <Circle cx="31" cy="77" r="10" fill="#647173" />
        <Circle cx="104" cy="77" r="17" fill="#152323" />
        <Circle cx="104" cy="77" r="10" fill="#647173" />

        <Rect
          x="5"
          y="12"
          width="43"
          height="33"
          rx="4"
          fill="#202A2B"
        />

        <Rect
          x="8"
          y="15"
          width="37"
          height="5"
          rx="2"
          fill="#455052"
        />

        <Path
          d="M27 49c17-12 42-13 60-4l23 16-11 16H49L24 64Z"
          fill="#6F797B"
        />

        <Path
          d="M45 49c12-8 29-9 42-3l-10 18H50Z"
          fill="#929A9C"
        />

        <Path
          d="M36 41h46c6 0 9 4 8 8H41Z"
          fill="#172324"
        />

        <Path
          d="M87 42c10-4 17 2 20 13l8 19H94l-11-20Z"
          fill="#606B6D"
        />

        <Path
          d="M91 39 99 20c4-3 8-2 11 2l-3 21Z"
          fill="#274348"
          opacity="0.85"
        />

        <Path
          d="M98 33h17"
          stroke="#202C2D"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <Path
          d="M103 50h8l4 9h-12Z"
          fill="#E6D8AD"
        />
      </G>

      {/* =========================
          FOREGROUND
      ========================== */}

      <Path
        d="M0 510c44-24 87-20 125 9 42-28 86-23 122 4 48-30 94-28 143-5v42H0Z"
        fill="#1F523B"
      />

      <Circle cx="17" cy="515" r="22" fill="#376C43" />
      <Circle cx="46" cy="527" r="27" fill="#285D3E" />

      <Circle cx="349" cy="519" r="25" fill="#356A43" />
      <Circle cx="381" cy="529" r="28" fill="#22573A" />

      {/* Tree framing left */}
      <Path
        d="M0 0h73C51 36 39 76 40 117c-15 47-22 91-19 139H0Z"
        fill="#174B3D"
        opacity="0.92"
      />

      <G fill="#2C6748">
        <Circle cx="13" cy="46" r="31" />
        <Circle cx="39" cy="29" r="29" />
        <Circle cx="18" cy="89" r="27" />
        <Circle cx="49" cy="76" r="25" />
      </G>

      <Path
        d="M0 23c24 10 39 26 50 48M5 75c18 5 31 17 40 32"
        stroke="#4B7751"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* =========================
          FINAL HERO OVERLAY
      ========================== */}

      <Rect
        width="390"
        height="560"
        fill="url(#heroShade)"
      />
    </Svg>
  );
}
