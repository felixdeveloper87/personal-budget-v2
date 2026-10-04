import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { type ColorValue, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { nu } from "@/components/dashboard/nuTheme";
import { useAppMenu } from "@/components/navigation/AppMenu";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

interface TabIconProps {
  color: ColorValue;
  focused: boolean;
  selected: SymbolName;
  standard: SymbolName;
}

/** Nubank-style tab: the active icon sits in a soft lilac pill, tinted purple. */
function TabIcon({ color, focused, selected, standard }: TabIconProps) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <SymbolView
        name={focused ? selected : standard}
        size={23}
        tintColor={color}
        weight={focused ? "semibold" : "regular"}
      />
    </View>
  );
}

interface TabLabelProps {
  color: ColorValue;
  focused: boolean;
  label: string;
}

function TabLabel({ color, focused, label }: TabLabelProps) {
  return (
    <Text
      adjustsFontSizeToFit
      allowFontScaling={false}
      minimumFontScale={0.82}
      numberOfLines={1}
      style={[styles.tabLabel, { color }, focused && styles.tabLabelActive]}
    >
      {label}
    </Text>
  );
}

const icons = {
  dashboard: {
    standard: { ios: "rectangle.grid.2x2", android: "dashboard", web: "dashboard" },
    selected: { ios: "rectangle.grid.2x2.fill", android: "dashboard", web: "dashboard" },
  },
  incomes: {
    standard: {
      ios: "chart.line.uptrend.xyaxis",
      android: "trending_up",
      web: "trending_up",
    },
    selected: {
      ios: "chart.line.uptrend.xyaxis",
      android: "trending_up",
      web: "trending_up",
    },
  },
  expenses: {
    standard: {
      ios: "chart.line.downtrend.xyaxis",
      android: "trending_down",
      web: "trending_down",
    },
    selected: {
      ios: "chart.line.downtrend.xyaxis",
      android: "trending_down",
      web: "trending_down",
    },
  },
  household: {
    standard: { ios: "person.2", android: "groups", web: "groups" },
    selected: { ios: "person.2.fill", android: "groups", web: "groups" },
  },
  menu: {
    standard: { ios: "line.3.horizontal", android: "menu", web: "menu" },
    selected: { ios: "line.3.horizontal", android: "menu", web: "menu" },
  },
} satisfies Record<string, { standard: SymbolName; selected: SymbolName }>;

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

/**
 * The four tabs plus a "Menu" button. Menu isn't a route: it opens the app menu
 * sheet (every page in a carousel + profile), so there's no "More" screen.
 */
function AppTabBar({ descriptors, navigation, state }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { openMenu } = useAppMenu();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 6 }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const color = focused ? nu.brand : nu.inkSoft;
        const label = options.title ?? route.name;
        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        return (
          <Pressable
            accessibilityLabel={label}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
          >
            {options.tabBarIcon?.({ color, focused, size: 23 })}
            {typeof options.tabBarLabel === "function"
              ? options.tabBarLabel({ children: label, color, focused, position: "below-icon" })
              : <TabLabel color={color} focused={focused} label={label} />}
          </Pressable>
        );
      })}
      <Pressable accessibilityLabel="Abrir menu" accessibilityRole="button" onPress={openMenu} style={styles.tabItem}>
        <TabIcon color={nu.inkSoft} focused={false} {...icons.menu} />
        <TabLabel color={nu.inkSoft} focused={false} label="Menu" />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      backBehavior="history"
      detachInactiveScreens={false}
      screenOptions={{
        animation: "none",
        freezeOnBlur: true,
        headerShown: false,
        lazy: false,
        sceneStyle: styles.scene,
        tabBarActiveTintColor: nu.brand,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: nu.inkSoft,
        tabBarIconStyle: styles.tabIcon,
        tabBarItemStyle: styles.tabItem,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} {...icons.dashboard} />
          ),
          tabBarLabel: ({ color, focused }) => (
            <TabLabel color={color} focused={focused} label="Dashboard" />
          ),
        }}
      />
      <Tabs.Screen
        name="incomes"
        options={{
          title: "Incomes",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} {...icons.incomes} />
          ),
          tabBarLabel: ({ color, focused }) => (
            <TabLabel color={color} focused={focused} label="Incomes" />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} {...icons.expenses} />
          ),
          tabBarLabel: ({ color, focused }) => (
            <TabLabel color={color} focused={focused} label="Expenses" />
          ),
        }}
      />
      <Tabs.Screen
        name="household"
        options={{
          title: "Household",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} {...icons.household} />
          ),
          tabBarLabel: ({ color, focused }) => (
            <TabLabel color={color} focused={focused} label="Household" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: { backgroundColor: nu.white },
  // No fixed height: React Navigation adds the bottom safe-area inset itself.
  tabBar: {
    backgroundColor: nu.white,
    borderTopColor: nu.hairline,
    borderTopWidth: 1,
    flexDirection: "row",
    paddingTop: 8,
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
    gap: 3,
    paddingHorizontal: 0,
    paddingVertical: 2,
  },
  tabIcon: {
    height: 32,
    marginBottom: 3,
  },
  iconContainer: {
    alignItems: "center",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 58,
  },
  iconContainerActive: {
    backgroundColor: nu.brandTint,
  },
  tabLabel: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "500",
    includeFontPadding: false,
    letterSpacing: 0,
    lineHeight: 14,
    textAlign: "center",
  },
  tabLabelActive: {
    fontWeight: "700",
  },
});
