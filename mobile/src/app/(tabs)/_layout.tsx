import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { type ColorValue, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

interface TabIconProps {
  color: ColorValue;
  focused: boolean;
  selected: SymbolName;
  standard: SymbolName;
}

function TabIcon({ color, focused, selected, standard }: TabIconProps) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <SymbolView
        name={focused ? selected : standard}
        size={focused ? 36 : 35}
        tintColor={focused ? colors.white : color}
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
        tabBarActiveTintColor: colors.forest,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarIconStyle: styles.tabIcon,
        tabBarItemStyle: styles.tabItem,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarItemStyle: [styles.tabItem, styles.firstTabItem],
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
          tabBarItemStyle: [styles.tabItem, styles.lastTabItem],
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
  scene: { backgroundColor: colors.paper },
  tabBar: {
    backgroundColor: colors.paperRaised,
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 16,
    height: 96,
    paddingTop: 8,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  tabItem: {
    borderRadius: 16,
    minHeight: 62,
    paddingHorizontal: 1,
    paddingVertical: 3,
  },
  firstTabItem: {
    marginLeft: 28,
  },
  lastTabItem: {
    marginRight: 28,
  },
  tabIcon: {
    height: 44,
    marginBottom: 2,
  },
  iconContainer: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 17,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 50,
  },
  iconContainerActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forestPressed,
    shadowColor: colors.forest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabLabel: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: "600",
    includeFontPadding: false,
    letterSpacing: 0,
    lineHeight: 13,
    textAlign: "center",
  },
  tabLabelActive: {
    fontWeight: "700",
  },
});
