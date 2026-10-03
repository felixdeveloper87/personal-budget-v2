import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DashboardHeroArtwork } from "@/features/dashboard/DashboardHeroArtwork";

import { nu } from "./nuTheme";

/** Content height shared by every purple screen header, so tabs line up. */
export const NU_HEADER_CONTENT_HEIGHT = 160;
/** How far the white sheet tucks up over the header (rounded corners on purple). */
export const NU_SHEET_OVERLAP = 24;

/**
 * Purple gradient header used by the Nubank-style tabs. Fixed height so the
 * Dashboard and Incomes headers match; the next sibling should be a sheet with
 * `marginTop: -NU_SHEET_OVERLAP` and rounded top corners.
 */
export function NuHeader({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.header,
        { height: insets.top + 8 + NU_HEADER_CONTENT_HEIGHT + 12 + NU_SHEET_OVERLAP, paddingTop: insets.top + 8 },
      ]}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <DashboardHeroArtwork />
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: nu.brand, overflow: "hidden", paddingHorizontal: 20 },
  content: { height: NU_HEADER_CONTENT_HEIGHT },
});
