import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { nu } from "@/components/dashboard/nuTheme";
import { useAuth } from "@/contexts/AuthContext";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

interface MenuPage {
  label: string;
  icon: SymbolName;
  /** Missing → the page only exists on the web for now. */
  href?: Href;
}

/** Every page of the platform, in the same order as the web sidebar. */
const PAGES: MenuPage[] = [
  { label: "Dashboard", icon: { ios: "rectangle.grid.2x2.fill", android: "dashboard", web: "dashboard" }, href: "/" },
  { label: "Receitas", icon: { ios: "chart.line.uptrend.xyaxis", android: "trending_up", web: "trending_up" }, href: "/incomes" },
  { label: "Despesas", icon: { ios: "chart.line.downtrend.xyaxis", android: "trending_down", web: "trending_down" }, href: "/expenses" },
  { label: "Lar", icon: { ios: "person.2.fill", android: "groups", web: "groups" }, href: "/household" },
  { label: "Contas", icon: { ios: "building.columns.fill", android: "account_balance", web: "account_balance" }, href: "/accounts" },
  { label: "Cartões", icon: { ios: "creditcard.fill", android: "credit_card", web: "credit_card" }, href: "/cards" },
  { label: "Compromissos", icon: { ios: "repeat", android: "repeat", web: "repeat" }, href: "/commitments" },
  { label: "Metas", icon: { ios: "target", android: "track_changes", web: "track_changes" }, href: "/goals" },
  { label: "Planejamento", icon: { ios: "calendar", android: "calendar_month", web: "calendar_month" } },
  { label: "Relatórios", icon: { ios: "doc.text.fill", android: "description", web: "description" } },
];

const icons = {
  close: { ios: "xmark", android: "close", web: "close" },
  logout: { ios: "rectangle.portrait.and.arrow.right", android: "logout", web: "logout" },
} satisfies Record<string, SymbolName>;

const AppMenuContext = createContext<{ openMenu: () => void } | null>(null);

/** Opens the app menu sheet (all pages + profile). Safe to call outside the provider (no-op). */
export function useAppMenu() {
  return useContext(AppMenuContext) ?? { openMenu: () => {} };
}

/**
 * Holds the app-wide menu: a bottom sheet with the profile, a carousel of every
 * page and sign-out. Opened from the tab bar's "Menu" button or the header badge,
 * so it needs no route of its own.
 */
export function AppMenuProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const openMenu = useCallback(() => setVisible(true), []);
  const value = useMemo(() => ({ openMenu }), [openMenu]);
  return (
    <AppMenuContext.Provider value={value}>
      {children}
      <AppMenuSheet onClose={() => setVisible(false)} visible={visible} />
    </AppMenuContext.Provider>
  );
}

function initialsOf(name?: string | null) {
  return (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function AppMenuSheet({ onClose, visible }: { onClose: () => void; visible: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const go = (href: Href) => {
    onClose();
    router.navigate(href);
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable accessibilityLabel="Fechar menu" onPress={onClose} style={styles.backdrop} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]}>
        <View style={styles.grabber} />

        <View style={styles.headerRow}>
          <Text style={styles.title}>Menu</Text>
          <Pressable accessibilityLabel="Fechar" accessibilityRole="button" hitSlop={8} onPress={onClose} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
            <SymbolView name={icons.close} size={16} tintColor={nu.ink} weight="semibold" />
          </Pressable>
        </View>

        {user ? (
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialsOf(user.name) || "PB"}</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text numberOfLines={1} style={styles.name}>{user.name}</Text>
              <Text numberOfLines={1} style={styles.email}>{user.email}</Text>
            </View>
            {user.plan ? (
              <View style={styles.plan}>
                <Text style={styles.planText}>{user.plan}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Páginas</Text>
        <ScrollView
          contentContainerStyle={styles.carousel}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carouselScroll}
        >
          {PAGES.map((page) => {
            const available = Boolean(page.href);
            return (
              <Pressable
                accessibilityLabel={available ? `Abrir ${page.label}` : `${page.label}, em breve`}
                accessibilityRole="button"
                accessibilityState={{ disabled: !available }}
                disabled={!available}
                key={page.label}
                onPress={() => page.href && go(page.href)}
                style={({ pressed }) => [styles.pageCard, !available && styles.pageCardDisabled, pressed && styles.pressed]}
              >
                <View style={[styles.pageIcon, !available && styles.pageIconDisabled]}>
                  <SymbolView name={page.icon} size={20} tintColor={available ? nu.brand : nu.inkFaint} weight="semibold" />
                </View>
                <Text numberOfLines={1} style={[styles.pageLabel, !available && styles.pageLabelDisabled]}>{page.label}</Text>
                {!available ? <Text style={styles.soon}>Em breve</Text> : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            onClose();
            void logout();
          }}
          style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
        >
          <SymbolView name={icons.logout} size={16} tintColor={nu.negative} weight="semibold" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(20,20,26,0.45)" },
  sheet: {
    backgroundColor: nu.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
    position: "absolute",
    right: 0,
  },
  grabber: { alignSelf: "center", backgroundColor: nu.track, borderRadius: 3, height: 5, marginBottom: 10, width: 40 },
  headerRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: nu.ink, fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  close: { alignItems: "center", backgroundColor: nu.surface, borderRadius: 16, height: 32, justifyContent: "center", width: 32 },
  pressed: { opacity: 0.7 },

  profile: { alignItems: "center", backgroundColor: nu.surface, borderRadius: 16, flexDirection: "row", gap: 12, marginTop: 16, padding: 14 },
  avatar: { alignItems: "center", backgroundColor: nu.brand, borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  avatarText: { color: nu.white, fontSize: 15, fontWeight: "700" },
  profileCopy: { flex: 1, minWidth: 0 },
  name: { color: nu.ink, fontSize: 16, fontWeight: "700" },
  email: { color: nu.inkSoft, fontSize: 12, marginTop: 2 },
  plan: { backgroundColor: nu.brandTint, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  planText: { color: nu.brand, fontSize: 11, fontWeight: "700" },

  sectionTitle: { color: nu.ink, fontSize: 15, fontWeight: "600", marginTop: 20 },
  carouselScroll: { marginHorizontal: -20, marginTop: 10 },
  carousel: { gap: 10, paddingHorizontal: 20 },
  pageCard: { backgroundColor: nu.surface, borderRadius: 16, minHeight: 104, padding: 12, width: 104 },
  pageCardDisabled: { opacity: 0.7 },
  pageIcon: { alignItems: "center", backgroundColor: nu.brandTint, borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  pageIconDisabled: { backgroundColor: nu.track },
  pageLabel: { color: nu.ink, fontSize: 13, fontWeight: "600", marginTop: 14 },
  pageLabelDisabled: { color: nu.inkSoft },
  soon: { color: nu.inkFaint, fontSize: 10, marginTop: 2 },

  logout: {
    alignItems: "center",
    backgroundColor: nu.negativeTint,
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 22,
    minHeight: 48,
  },
  logoutPressed: { opacity: 0.8 },
  logoutText: { color: nu.negative, fontSize: 14, fontWeight: "700" },
});
