import Constants from "expo-constants";
import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";

interface MerchantDomainEntry {
  domain: string;
  keys: readonly string[];
}

const merchantDomains: readonly MerchantDomainEntry[] = [
  { keys: ["costco"], domain: "costco.co.uk" },
  { keys: ["lidl"], domain: "lidl.co.uk" },
  { keys: ["sainsbury"], domain: "sainsburys.co.uk" },
  { keys: ["morrisons"], domain: "morrisons.com" },
  { keys: ["waitrose"], domain: "waitrose.com" },
  { keys: ["iceland"], domain: "iceland.co.uk" },
  { keys: ["tesco"], domain: "tesco.com" },
  { keys: ["aldi"], domain: "aldi.co.uk" },
  { keys: ["asda"], domain: "asda.com" },
  { keys: ["co-op", "co op", "coop"], domain: "coop.co.uk" },
  { keys: ["amazon"], domain: "amazon.co.uk" },
  { keys: ["uber eats"], domain: "ubereats.com" },
  { keys: ["deliveroo"], domain: "deliveroo.co.uk" },
  { keys: ["just eat"], domain: "just-eat.co.uk" },
  { keys: ["uber"], domain: "uber.com" },
  { keys: ["bolt"], domain: "bolt.eu" },
  { keys: ["mcdonald's", "mcdonalds"], domain: "mcdonalds.com" },
  { keys: ["nando's", "nandos"], domain: "nandos.co.uk" },
  { keys: ["burger king"], domain: "burgerking.co.uk" },
  { keys: ["costa coffee", "costa"], domain: "costa.co.uk" },
  { keys: ["domino's", "dominos"], domain: "dominos.co.uk" },
  { keys: ["greggs"], domain: "greggs.co.uk" },
  { keys: ["subway"], domain: "subway.com" },
  { keys: ["kfc"], domain: "kfc.co.uk" },
  { keys: ["boots"], domain: "boots.com" },
  { keys: ["superdrug"], domain: "superdrug.com" },
  { keys: ["primark"], domain: "primark.com" },
  { keys: ["river island"], domain: "riverisland.com" },
  { keys: ["new look"], domain: "newlook.com" },
  { keys: ["zara"], domain: "zara.com" },
  { keys: ["h&m"], domain: "hm.com" },
  { keys: ["asos"], domain: "asos.com" },
  { keys: ["spotify"], domain: "spotify.com" },
  { keys: ["netflix"], domain: "netflix.com" },
  { keys: ["youtube"], domain: "youtube.com" },
  { keys: ["chatgpt", "openai"], domain: "openai.com" },
  { keys: ["claude"], domain: "claude.ai" },
  { keys: ["disney+"], domain: "disneyplus.com" },
  { keys: ["playstation"], domain: "playstation.com" },
  { keys: ["xbox"], domain: "xbox.com" },
  { keys: ["airbnb"], domain: "airbnb.co.uk" },
  { keys: ["booking.com", "booking"], domain: "booking.com" },
  { keys: ["trainline"], domain: "thetrainline.com" },
  { keys: ["tfl"], domain: "tfl.gov.uk" },
  { keys: ["vinted"], domain: "vinted.co.uk" },
  { keys: ["ebay"], domain: "ebay.co.uk" },
  { keys: ["etsy"], domain: "etsy.com" },
  { keys: ["royal mail", "royalmail"], domain: "royalmail.com" },
];

const logoDevToken =
  process.env.EXPO_PUBLIC_LOGO_DEV_TOKEN ||
  (Constants.expoConfig?.extra?.logoDevToken as string | undefined);

function normaliseMerchantName(name: string) {
  return name.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
}

export function getMerchantLogoDomain(name: string) {
  const normalised = normaliseMerchantName(name);
  let match: { domain: string; length: number } | null = null;

  for (const entry of merchantDomains) {
    for (const key of entry.keys) {
      if (normalised.includes(key) && (!match || key.length > match.length)) {
        match = { domain: entry.domain, length: key.length };
      }
    }
  }

  return match?.domain ?? null;
}

function merchantInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

interface MerchantLogoProps {
  name: string;
  size?: number;
}

export function MerchantLogo({ name, size = 42 }: MerchantLogoProps) {
  const [failed, setFailed] = useState(false);
  const domain = useMemo(() => getMerchantLogoDomain(name), [name]);
  const logoUrl = domain && logoDevToken
    ? `https://img.logo.dev/${domain}?token=${encodeURIComponent(logoDevToken)}&size=${Math.max(64, size * 2)}&format=png`
    : null;

  useEffect(() => setFailed(false), [logoUrl]);

  const showLogo = Boolean(logoUrl && !failed);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.container,
        {
          backgroundColor: showLogo ? colors.white : colors.incomeTint,
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
          onError={() => setFailed(true)}
          source={{ uri: logoUrl! }}
          style={{ height: size - 7, width: size - 7 }}
          transition={120}
        />
      ) : (
        <Text style={[styles.initials, { fontSize: size <= 30 ? 8 : 10 }]}>
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
