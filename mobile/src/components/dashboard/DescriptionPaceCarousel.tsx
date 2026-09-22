import type { Transaction } from "@/types/finance";

import { PaceCollectionCarousel } from "./PaceCollectionCarousel";

interface DescriptionPaceCarouselProps {
  date: Date;
  transactions: Transaction[];
  userId: number;
}

export function DescriptionPaceCarousel({
  date,
  transactions,
  userId,
}: DescriptionPaceCarouselProps) {
  return (
    <PaceCollectionCarousel
      accessibilityLabel="Expense pace by description"
      date={date}
      dimension="description"
      eyebrow="PACE BY DESCRIPTION"
      title="What you're spending on"
      transactions={transactions}
      userId={userId}
    />
  );
}
