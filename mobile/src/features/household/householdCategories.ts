import type { ComponentProps } from "react";
import type { SymbolView } from "expo-symbols";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

export const categoryIcons: Record<string, SymbolName> = {
  Groceries: { ios: "basket", android: "shopping_basket", web: "shopping_basket" },
  Electricity: { ios: "bolt", android: "bolt", web: "bolt" },
  Water: { ios: "drop", android: "water_drop", web: "water_drop" },
  Gas: { ios: "flame", android: "local_fire_department", web: "local_fire_department" },
  Internet: { ios: "wifi", android: "wifi", web: "wifi" },
  Cleaning: { ios: "sparkles", android: "auto_awesome", web: "auto_awesome" },
  Rent: { ios: "house", android: "home", web: "home" },
  "Council tax": { ios: "building.columns", android: "account_balance", web: "account_balance" },
  Repairs: { ios: "wrench.adjustable", android: "build", web: "build" },
  Garden: { ios: "leaf", android: "yard", web: "yard" },
  Other: { ios: "ellipsis", android: "more_horiz", web: "more_horiz" },
};

export const categories = [
  { value: "Groceries", label: "Mercado", defaultDescription: null, detailPlaceholder: "Ex.: compras da semana" },
  { value: "Electricity", label: "Luz", defaultDescription: "Conta de luz", detailPlaceholder: null },
  { value: "Water", label: "Água", defaultDescription: "Conta de água", detailPlaceholder: null },
  { value: "Gas", label: "Gás", defaultDescription: "Conta de gás", detailPlaceholder: null },
  { value: "Internet", label: "Internet", defaultDescription: "Conta de internet", detailPlaceholder: null },
  { value: "Cleaning", label: "Limpeza", defaultDescription: null, detailPlaceholder: "Ex.: faxina ou produtos de limpeza" },
  { value: "Rent", label: "Aluguel", defaultDescription: "Aluguel", detailPlaceholder: null },
  { value: "Council tax", label: "Imposto da casa", defaultDescription: "Imposto da casa", detailPlaceholder: null },
  { value: "Repairs", label: "Reparos", defaultDescription: null, detailPlaceholder: "Ex.: conserto da torneira" },
  { value: "Garden", label: "Jardim", defaultDescription: null, detailPlaceholder: "Ex.: corte da grama" },
  { value: "Other", label: "Outro", defaultDescription: null, detailPlaceholder: "Ex.: o que foi comprado ou feito?" },
] as const;

export const categoryPalette = {
  sage: { background: "#E5EDDC", ink: "#526E43" },
  sand: { background: "#F2E9D5", ink: "#8B7040" },
  blue: { background: "#E3ECED", ink: "#507780" },
  clay: { background: "#F0E3DA", ink: "#916951" },
};

export const categoryTones = {
  Groceries: "sage",
  Electricity: "sand",
  Water: "blue",
  Gas: "clay",
  Internet: "blue",
  Cleaning: "sand",
  Rent: "sage",
  "Council tax": "sand",
  Repairs: "clay",
  Garden: "sage",
  Other: "blue",
} satisfies Record<(typeof categories)[number]["value"], keyof typeof categoryPalette>;

