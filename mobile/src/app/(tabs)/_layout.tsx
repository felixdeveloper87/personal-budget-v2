import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { type ColorValue, StyleSheet, Text, View } from "react-native";

import { nu } from "@/components/dashboard/nuTheme";

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
  more: {
    standard: { ios: "ellipsis.circle", android: "more_horiz", web: "more_horiz" },
    selected: { ios: "ellipsis.circle.fill", android: "more_horiz", web: "more_horiz" },
  },
} satisfies Record<string, { standard: SymbolName; selected: SymbolName }>;

export default function TabsLayout() {
  return (
    <Tabs
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
      <Tabs.Screen
        name="more"
        options={{
          title: "Mais",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} {...icons.more} />
          ),
          tabBarLabel: ({ color, focused }) => (
            <TabLabel color={color} focused={focused} label="Mais" />
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
    elevation: 0,
    paddingTop: 8,
    shadowOpacity: 0,
  },
  tabItem: {
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
