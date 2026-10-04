import type { CreditCardPaymentMethod } from "@/services/api";
import type { Transaction } from "@/types/finance";

import { buildCardStatements, type StatementStatus } from "./cardStatements";

export interface CardView {
  id: number;
  name: string;
  issuer: string;
  /** Total of the statement still collecting purchases. */
  currentStatement: number;
  /** Everything due from today on (closed-unpaid + open + future cycles). */
  outstanding: number;
  limit: number;
  closingDay: number | null;
  paymentDay: number | null;
  nextPayment: number;
  nextPaymentDate: string;
  settlementAccount: string;
}

export interface StatementPurchase {
  id: number;
  description: string;
  category: string;
  date: string;
  amount: number;
  merchantName?: string | null;
  merchantDomain?: string | null;
}

export interface StatementView {
  id: string;
  cardId: number;
  /** Billing month, e.g. "Outubro de 2026". */
  month: string;
  period: string;
  dueDate: string;
  paymentTimestamp: number;
  status: StatementStatus;
  total: number;
  purchases: StatementPurchase[];
}

export interface CardsOverview {
  cards: CardView[];
  statements: StatementView[];
  /** Nearest statement due from today on, across every card. */
  next: StatementView | null;
  used: number;
  limit: number;
}

const shortDateFormat = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });
const monthFormat = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

export const shortDate = (date: Date | number) => shortDateFormat.format(date);

function capitalize(text: string) {
  return text.charAt(0).toLocaleUpperCase("pt-BR") + text.slice(1);
}

function purchaseDate(transaction: Transaction) {
  const raw = transaction.transactionDate ?? transaction.paymentDate ?? transaction.dateTime;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw ?? "");
  return match ? shortDate(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) : "—";
}

export function startOfTodayTimestamp() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export function buildCardsOverview(methods: CreditCardPaymentMethod[], transactions: Transaction[]): CardsOverview {
  const today = startOfTodayTimestamp();
  const statements: StatementView[] = [];

  const cards = methods
    .filter((method) => method.type === "CREDIT_CARD")
    .map<CardView>((method) => {
      const cycles = buildCardStatements(method, transactions);
      const upcoming = cycles
        .filter((cycle) => cycle.paymentDate.getTime() >= today)
        .sort((a, b) => a.paymentDate.getTime() - b.paymentDate.getTime());

      for (const cycle of cycles) {
        statements.push({
          id: `${method.id}-${cycle.key}`,
          cardId: method.id,
          month: capitalize(monthFormat.format(cycle.closingDate)),
          period: `${shortDate(cycle.periodStart)} – ${shortDate(cycle.closingDate)}`,
          dueDate: shortDate(cycle.paymentDate),
          paymentTimestamp: cycle.paymentDate.getTime(),
          status: cycle.status,
          total: cycle.total,
          purchases: cycle.transactions.map((transaction) => ({
            id: transaction.id,
            description: transaction.description || "Compra",
            category: transaction.category,
            date: purchaseDate(transaction),
            amount: Number(transaction.amount),
            merchantName: transaction.merchantName,
            merchantDomain: transaction.merchantDomain,
          })),
        });
      }

      return {
        id: method.id,
        name: method.name,
        issuer: method.issuer || "Cartão de crédito",
        currentStatement: cycles.find((cycle) => cycle.status === "open")?.total ?? 0,
        outstanding: upcoming.reduce((sum, cycle) => sum + cycle.total, 0),
        limit: Math.max(Number(method.creditLimit || 0), 0),
        closingDay: method.statementClosingDay ?? null,
        paymentDay: method.paymentDay ?? null,
        nextPayment: upcoming[0]?.total ?? 0,
        nextPaymentDate: upcoming[0] ? shortDate(upcoming[0].paymentDate) : "",
        settlementAccount: method.settlementAccountName || "",
      };
    });

  const next = statements
    .filter((statement) => statement.paymentTimestamp >= today)
    .sort((a, b) => a.paymentTimestamp - b.paymentTimestamp || a.cardId - b.cardId)[0] ?? null;

  return {
    cards,
    statements,
    next,
    used: cards.reduce((sum, card) => sum + card.outstanding, 0),
    limit: cards.reduce((sum, card) => sum + card.limit, 0),
  };
}

/** The statement a card shortcut should open: its nearest due one, else its latest. */
export function focusStatementFor(cardId: number, statements: StatementView[]): StatementView | null {
  const today = startOfTodayTimestamp();
  const own = statements.filter((statement) => statement.cardId === cardId);
  const due = own
    .filter((statement) => statement.paymentTimestamp >= today)
    .sort((a, b) => a.paymentTimestamp - b.paymentTimestamp)[0];
  return due ?? own.sort((a, b) => b.paymentTimestamp - a.paymentTimestamp)[0] ?? null;
}
