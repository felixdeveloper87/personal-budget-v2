import { ExpenseEntrySheet } from "./ExpenseEntrySheet";
import { IncomeEntrySheet } from "./IncomeEntrySheet";
import type { TransactionEntryModalProps } from "./transactionEntryTypes";

export function TransactionEntryModal({ type, ...props }: TransactionEntryModalProps) {
  return type === "INCOME"
    ? <IncomeEntrySheet {...props} />
    : <ExpenseEntrySheet {...props} />;
}
