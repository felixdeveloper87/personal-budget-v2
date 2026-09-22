import type { Transaction } from "@/types/finance";

import { PaceCollectionCarousel } from "./PaceCollectionCarousel";

interface CategoryPaceCarouselProps {
  date: Date;
  transactions: Transaction[];
  userId: number;
}

export function CategoryPaceCarousel({ date, transactions, userId }: CategoryPaceCarouselProps) {
  return (
    <PaceCollectionCarousel
      accessibilityLabel="Expense pace by category"
      date={date}
      dimension="category"
      eyebrow="PACE BY CATEGORY"
      title="Where your money is going"
      transactions={transactions}
      userId={userId}
    />
  );
}
