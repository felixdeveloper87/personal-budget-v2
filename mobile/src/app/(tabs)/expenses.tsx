import { SectionPlaceholderScreen } from "@/features/navigation/SectionPlaceholderScreen";

export default function ExpensesTab() {
  return (
    <SectionPlaceholderScreen
      description="Aqui ficarão suas despesas, categorias e o histórico de saídas."
      eyebrow="SUAS SAÍDAS"
      items={["Despesas recentes", "Categorias e filtros", "Nova despesa"]}
      title="Expenses"
    />
  );
}
