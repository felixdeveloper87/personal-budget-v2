import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";

import { RentIcon } from "@/components/icons/RentIcon";
import { categoryIcons } from "@/features/household/householdCategories";

type SymbolWeight = ComponentProps<typeof SymbolView>["weight"];

export function HouseholdCategoryIcon({ category, color, size, weight }: {
  category: string;
  color: string;
  size: number;
  weight?: SymbolWeight;
}) {
  if (category === "Rent") return <RentIcon color={color} size={size} />;

  return (
    <SymbolView
      name={categoryIcons[category] ?? categoryIcons.Other}
      size={size}
      tintColor={color}
      weight={weight}
    />
  );
}
