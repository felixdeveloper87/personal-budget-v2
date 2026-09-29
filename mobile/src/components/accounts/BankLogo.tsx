import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";

interface BankMeta {
  abbreviation: string;
  backgroundColor: string;
  domain: string;
  textColor: string;
}

const bankRegistry: ReadonlyArray<{ keys: readonly string[]; meta: BankMeta }> = [
  { keys: ["natwest"], meta: { abbreviation: "NW", backgroundColor: "#42145F", textColor: "#FFFFFF", domain: "natwest.com" } },
  { keys: ["monzo"], meta: { abbreviation: "MO", backgroundColor: "#FF3464", textColor: "#FFFFFF", domain: "monzo.com" } },
  { keys: ["revolut"], meta: { abbreviation: "RV", backgroundColor: "#191C1F", textColor: "#FFFFFF", domain: "revolut.com" } },
  { keys: ["hsbc"], meta: { abbreviation: "HSBC", backgroundColor: "#DB0011", textColor: "#FFFFFF", domain: "hsbc.co.uk" } },
  { keys: ["lloyds"], meta: { abbreviation: "LB", backgroundColor: "#006A4D", textColor: "#FFFFFF", domain: "lloydsbank.com" } },
  { keys: ["metro"], meta: { abbreviation: "MB", backgroundColor: "#CA0028", textColor: "#FFFFFF", domain: "metrobankonline.co.uk" } },
  { keys: ["barclays"], meta: { abbreviation: "BC", backgroundColor: "#00AEEF", textColor: "#FFFFFF", domain: "barclays.co.uk" } },
  { keys: ["santander"], meta: { abbreviation: "SAN", backgroundColor: "#EC0000", textColor: "#FFFFFF", domain: "santander.co.uk" } },
  { keys: ["halifax"], meta: { abbreviation: "HX", backgroundColor: "#004A8F", textColor: "#FFFFFF", domain: "halifax.co.uk" } },
  { keys: ["tsb"], meta: { abbreviation: "TSB", backgroundColor: "#1D65A6", textColor: "#FFFFFF", domain: "tsb.co.uk" } },
  { keys: ["starling"], meta: { abbreviation: "SB", backgroundColor: "#6935D3", textColor: "#FFFFFF", domain: "starlingbank.com" } },
  { keys: ["chase"], meta: { abbreviation: "CH", backgroundColor: "#117ACA", textColor: "#FFFFFF", domain: "chase.co.uk" } },
  { keys: ["first direct"], meta: { abbreviation: "FD", backgroundColor: "#1A1A1A", textColor: "#FFFFFF", domain: "firstdirect.com" } },
  { keys: ["nationwide"], meta: { abbreviation: "NBS", backgroundColor: "#0B1A6C", textColor: "#FFFFFF", domain: "nationwide.co.uk" } },
  { keys: ["virgin", "clydesdale"], meta: { abbreviation: "VM", backgroundColor: "#C8102E", textColor: "#FFFFFF", domain: "virginmoney.com" } },
  { keys: ["co-op", "co op", "cooperative"], meta: { abbreviation: "CB", backgroundColor: "#00853E", textColor: "#FFFFFF", domain: "co-operativebank.co.uk" } },
  { keys: ["american express", "amex"], meta: { abbreviation: "AX", backgroundColor: "#006FCF", textColor: "#FFFFFF", domain: "americanexpress.com" } },
  { keys: ["visa"], meta: { abbreviation: "VISA", backgroundColor: "#1A1F71", textColor: "#FFFFFF", domain: "visa.com" } },
  { keys: ["mastercard"], meta: { abbreviation: "MC", backgroundColor: "#EB001B", textColor: "#FFFFFF", domain: "mastercard.com" } },
  { keys: ["post office"], meta: { abbreviation: "PO", backgroundColor: "#DA2128", textColor: "#FFFFFF", domain: "postoffice.co.uk" } },
  { keys: ["bank of scotland"], meta: { abbreviation: "BOS", backgroundColor: "#006747", textColor: "#FFFFFF", domain: "bankofscotland.co.uk" } },
  { keys: ["royal bank", "rbs"], meta: { abbreviation: "RBS", backgroundColor: "#002060", textColor: "#FFFFFF", domain: "rbs.co.uk" } },
  { keys: ["tesco"], meta: { abbreviation: "TB", backgroundColor: "#EE1C2E", textColor: "#FFFFFF", domain: "tescobank.com" } },
  { keys: ["vanquis"], meta: { abbreviation: "VQ", backgroundColor: "#4B0082", textColor: "#FFFFFF", domain: "vanquis.co.uk" } },
];

function getBankMeta(value: string): BankMeta | null {
  const normalized = value.toLocaleLowerCase().trim();
  let match: { length: number; meta: BankMeta } | null = null;
  for (const entry of bankRegistry) {
    for (const key of entry.keys) {
      if (normalized.includes(key) && (!match || key.length > match.length)) {
        match = { length: key.length, meta: entry.meta };
      }
    }
  }
  return match?.meta ?? null;
}

function initials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "£";
  if (words.length === 1) return words[0].slice(0, 2).toLocaleUpperCase();
  return `${words[0][0]}${words[1][0]}`.toLocaleUpperCase();
}

export function BankLogo({ institution, name, size = 30 }: {
  institution?: string | null;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const lookup = institution?.trim() || name;
  const meta = useMemo(() => getBankMeta(lookup), [lookup]);
  const logoUrl = meta
    ? `https://www.google.com/s2/favicons?domain=${meta.domain}&sz=128`
    : null;

  useEffect(() => setFailed(false), [logoUrl]);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.container,
        {
          backgroundColor: meta?.backgroundColor ?? colors.paperMuted,
          borderRadius: Math.round(size * 0.3),
          height: size,
          width: size,
        },
      ]}
    >
      {logoUrl && !failed ? (
        <Image
          cachePolicy="memory-disk"
          contentFit="contain"
          onError={() => setFailed(true)}
          source={{ uri: logoUrl }}
          style={{ height: size, width: size }}
          transition={100}
        />
      ) : (
        <Text
          style={[
            styles.initials,
            {
              color: meta?.textColor ?? colors.inkSoft,
              fontSize: size <= 28 ? 8 : 9,
            },
          ]}
        >
          {meta?.abbreviation ?? initials(lookup)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.62)",
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    overflow: "hidden",
  },
  initials: { fontWeight: "900", letterSpacing: -0.2 },
});
