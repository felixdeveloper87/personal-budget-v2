import type { Transaction } from "@/types/finance";

import { PaceCollectionCarousel } from "./PaceCollectionCarousel";

interface DescriptionPaceCarouselProps {
  date: Date;
  transactions: Transaction[];
}

export function DescriptionPaceCarousel({
  date,
  transactions,
}: DescriptionPaceCarouselProps) {
  return (
    <PaceCollectionCarousel
      accessibilityLabel="Expense pace by description"
      date={date}
      dimension="description"
      eyebrow="PACE BY DESCRIPTION"
      title="What you're spending on"
      transactions={transactions}
    />
  );
}
