import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { ComponentProps, ReactNode } from "react";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TransactionSearchSheet } from "@/components/search/TransactionSearchSheet";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeroArtwork } from "@/features/dashboard/DashboardHeroArtwork";
import { listTransactions } from "@/services/api";
import type { Transaction } from "@/types/finance";

import { nu } from "./nuTheme";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const icons = {
  back: { ios: "chevron.left", android: "arrow_back", web: "arrow_back" },
  search: { ios: "magnifyingglass", android: "search", web: "search" },
  language: { ios: "globe", android: "language", web: "language" },
} satisfies Record<string, SymbolName>;

/** Content height shared by every purple screen header, so tabs line up. */
export const NU_HEADER_CONTENT_HEIGHT = 160;
/** How far the white sheet tucks up over the header (rounded corners on purple). */
export const NU_SHEET_OVERLAP = 24;
/** Standard top bar (avatar/back · search · language) drawn above every header's content. */
const TOP_BAR_HEIGHT = 44;
const TOP_BAR_GAP = 10;

function initialsOf(name?: string | null) {
  return (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function TopBarButton({ icon, label, onPress }: { icon: SymbolName; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}
    >
      <SymbolView name={icon} size={20} tintColor={nu.white} weight="regular" />
    </Pressable>
  );
}

/**
 * Same top bar on every purple screen: the user's badge (or a back button on
 * pushed screens) on the left, search and language on the right. The avatar
 * opens the profile/settings screen.
 */
function NuTopBar({ onBack, searchTransactions }: { onBack?: () => void; searchTransactions?: Transaction[] }) {
  const router = useRouter();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [loaded, setLoaded] = useState<Transaction[] | null>(null);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    // Screens that already hold the transaction list pass it in; others fetch on first open.
    if (!searchTransactions && !loaded && user) {
      listTransactions(user.token).then(setLoaded).catch(() => setLoaded([]));
    }
  }, [loaded, searchTransactions, user]);

  return (
    <View style={styles.topBar}>
      {onBack ? (
        <Pressable
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [styles.badge, pressed && styles.pressed]}
        >
          <SymbolView name={icons.back} size={18} tintColor={nu.white} weight="semibold" />
        </Pressable>
      ) : (
        <Pressable
          accessibilityLabel="Abrir perfil e configurações"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => router.navigate("/more")}
          style={({ pressed }) => [styles.badge, pressed && styles.pressed]}
        >
          <Text style={styles.badgeText}>{initialsOf(user?.name) || "PB"}</Text>
        </Pressable>
      )}
      <View style={styles.actions}>
        <TopBarButton icon={icons.search} label="Buscar transações" onPress={openSearch} />
        <TopBarButton
          icon={icons.language}
          label="Trocar idioma"
          onPress={() => Alert.alert("Idioma", "A troca de idioma no app chega em breve.")}
        />
      </View>

      <TransactionSearchSheet
        onClose={() => setSearchOpen(false)}
        transactions={searchTransactions ?? loaded ?? []}
        visible={searchOpen}
      />
    </View>
  );
}

/**
 * Purple gradient header used by the Nubank-style screens. Fixed height so every
 * header matches; the next sibling should be a sheet with
 * `marginTop: -NU_SHEET_OVERLAP` and rounded top corners.
 */
export function NuHeader({
  children,
  contentHeight = NU_HEADER_CONTENT_HEIGHT,
  decoration,
  onBack,
  searchTransactions,
}: {
  children: ReactNode;
  /** Override for pushed (non-tab) screens that need a taller header. */
  contentHeight?: number;
  /** Extra art drawn over the gradient (e.g. house line art). */
  decoration?: ReactNode;
  /** Pushed screens: shows a back button in place of the user's badge. */
  onBack?: () => void;
  /** Transactions the search sheet should look through (fetched on demand when omitted). */
  searchTransactions?: Transaction[];
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.header,
        {
          height: insets.top + 8 + TOP_BAR_HEIGHT + TOP_BAR_GAP + contentHeight + 12 + NU_SHEET_OVERLAP,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <DashboardHeroArtwork />
      </View>
      {decoration ? <View pointerEvents="none" style={StyleSheet.absoluteFill}>{decoration}</View> : null}
      <NuTopBar onBack={onBack} searchTransactions={searchTransactions} />
      <View style={{ height: contentHeight, marginTop: TOP_BAR_GAP }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: nu.brand, overflow: "hidden", paddingHorizontal: 20 },
  topBar: { alignItems: "center", flexDirection: "row", height: TOP_BAR_HEIGHT, justifyContent: "space-between" },
  badge: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  badgeText: { color: nu.white, fontSize: 14, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 6 },
  action: { alignItems: "center", borderRadius: 20, height: 40, justifyContent: "center", width: 40 },
  pressed: { opacity: 0.7 },
});
