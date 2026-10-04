import Constants from "expo-constants";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { RentIcon } from "@/components/icons/RentIcon";
import { nu } from "@/components/dashboard/nuTheme";
import { colors } from "@/theme/colors";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

interface MerchantFallback {
  backgroundColor: string;
  icon: SymbolName;
  iconScale?: number;
  tintColor: string;
}

const merchantFallbacks = {
  cinema: {
    backgroundColor: "#E8E0EF",
    icon: { ios: "film.fill", android: "movie", web: "movie" },
    tintColor: "#75558A",
  },
  event: {
    backgroundColor: "#F1DFE7",
    icon: { ios: "music.note", android: "music_note", web: "music_note" },
    tintColor: "#98546F",
  },
  restaurant: {
    backgroundColor: "#F2E0D4",
    icon: { ios: "fork.knife", android: "restaurant", web: "restaurant" },
    tintColor: "#A65F40",
  },
  fuel: {
    backgroundColor: "#F1DEA5",
    icon: { ios: "fuelpump.fill", android: "local_gas_station", web: "local_gas_station" },
    iconScale: 0.62,
    tintColor: "#6F5012",
  },
  groceries: {
    backgroundColor: "#D9ECE2",
    icon: { ios: "cart.fill", android: "shopping_cart", web: "shopping_cart" },
    tintColor: "#2D8062",
  },
  transport: {
    backgroundColor: "#D9E9EA",
    icon: { ios: "car.fill", android: "directions_car", web: "directions_car" },
    tintColor: "#397780",
  },
  shopping: {
    backgroundColor: "#E7DFE9",
    icon: { ios: "bag.fill", android: "shopping_bag", web: "shopping_bag" },
    tintColor: "#705E78",
  },
} satisfies Record<string, MerchantFallback>;

const logoDevToken =
  process.env.EXPO_PUBLIC_LOGO_DEV_TOKEN ||
  (Constants.expoConfig?.extra?.logoDevToken as string | undefined);

function normaliseFallbackValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesAny(value: string, terms: readonly string[]) {
  return terms.some((term) => value.includes(term));
}

function getMerchantFallback(name: string, category?: string): MerchantFallback | null {
  const normalisedName = normaliseFallbackValue(name);
  const normalisedCategory = normaliseFallbackValue(category ?? "");

  if (includesAny(normalisedName, ["cinema", "movie", "film"])) {
    return merchantFallbacks.cinema;
  }
  if (includesAny(normalisedName, ["show", "concert", "gig"])) {
    return merchantFallbacks.event;
  }

  if (
    includesAny(normalisedCategory, ["fuel", "petrol", "gas", "combustivel"]) ||
    includesAny(normalisedName, ["fuel", "petrol", "gas station", "shell", "esso", "texaco", "bp"])
  ) {
    return merchantFallbacks.fuel;
  }
  if (
    includesAny(normalisedCategory, ["dining", "restaurant", "food", "restaurante"]) ||
    includesAny(normalisedName, ["restaurant", "restaurante", "cafe", "bistro", "grill"])
  ) {
    return merchantFallbacks.restaurant;
  }
  if (includesAny(normalisedCategory, ["groceries", "grocery", "supermarket", "supermercado"])) {
    return merchantFallbacks.groceries;
  }
  if (includesAny(normalisedCategory, ["transport", "transporte", "travel"])) {
    return merchantFallbacks.transport;
  }
  if (includesAny(normalisedCategory, ["shopping", "compras", "retail"])) {
    return merchantFallbacks.shopping;
  }

  return null;
}

const RENT_CATEGORY_WORDS = ["rent", "housing", "aluguel", "moradia", "mortgage"];
const RENT_NAME_WORDS = ["rent", "aluguel", "landlord", "letting", "lettings"];

/** Whole-word match so "parent" or "current" don't read as rent. */
function isRentLike(name: string, category?: string) {
  const nameWords = normaliseFallbackValue(name).split(" ");
  const categoryWords = normaliseFallbackValue(category ?? "").split(" ");
  return categoryWords.some((word) => RENT_CATEGORY_WORDS.includes(word))
    || nameWords.some((word) => RENT_NAME_WORDS.includes(word));
}

function merchantInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

interface MerchantLogoProps {
  category?: string;
  domain?: string | null;
  name: string;
  size?: number;
  fallbackMode?: "default" | "none";
}

/** Logo URLs that already failed this session — never re-requested (errors aren't cached). */
const failedLogoUrls = new Set<string>();
/** One fixed size per brand, so the same logo is a single cached URL at every size it's drawn. */
const LOGO_FETCH_SIZE = 128;

export function MerchantLogo({ category, domain, name, size = 42, fallbackMode = "default" }: MerchantLogoProps) {
  const [failed, setFailed] = useState(false);
  const rent = useMemo(() => isRentLike(name, category), [category, name]);
  const fallback = useMemo(() => (rent ? null : getMerchantFallback(name, category)), [category, name, rent]);
  const logoUrl = domain && logoDevToken
    ? `https://img.logo.dev/${domain}?token=${encodeURIComponent(logoDevToken)}&size=${LOGO_FETCH_SIZE}&format=png&fallback=404`
    : null;

  useEffect(() => setFailed(false), [logoUrl]);

  const showLogo = Boolean(logoUrl && !failed && !failedLogoUrls.has(logoUrl));

  if (!showLogo && fallbackMode === "none") return null;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.container,
        {
          backgroundColor: showLogo
            ? colors.white
            : rent
              ? nu.brandTint
              : fallback?.backgroundColor ?? colors.incomeTint,
          borderRadius: Math.round(size * 0.34),
          height: size,
          width: size,
        },
      ]}
    >
      {showLogo ? (
        <Image
          cachePolicy="memory-disk"
          contentFit="contain"
          onError={() => { failedLogoUrls.add(logoUrl!); setFailed(true); }}
          source={{ uri: logoUrl! }}
          style={{ height: size - 7, width: size - 7 }}
          transition={120}
        />
      ) : rent ? (
        <RentIcon color={nu.brand} size={Math.max(18, Math.round(size * 0.52))} strokeWidth={2.2} />
      ) : fallback ? (
        <SymbolView
          name={fallback.icon}
          size={Math.max(18, Math.round(size * (fallback.iconScale ?? 0.46)))}
          tintColor={fallback.tintColor}
          weight="semibold"
        />
      ) : (
        <Text
          style={[
            styles.initials,
            { fontSize: size <= 30 ? 8 : Math.max(10, Math.round(size * 0.22)) },
          ]}
        >
          {merchantInitials(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderColor: colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  initials: { color: colors.income, fontWeight: "800", letterSpacing: 0.3 },
});
