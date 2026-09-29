import type { Transaction } from "@/types/finance";

export type TransactionType = "INCOME" | "EXPENSE";

export interface TransactionEntrySheetProps {
  onClose: () => void;
  onCreated: (transaction: Transaction) => void;
  visible: boolean;
}

export interface TransactionEntryModalProps extends TransactionEntrySheetProps {
  type: TransactionType;
}
