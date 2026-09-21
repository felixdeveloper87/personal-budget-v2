import { SectionPlaceholderScreen } from "@/features/navigation/SectionPlaceholderScreen";

export default function HouseholdTab() {
  return (
    <SectionPlaceholderScreen
      description="Despesas compartilhadas, saldos entre membros e acertos continuarão reunidos em uma única área."
      eyebrow="CASA COMPARTILHADA"
      items={["Quem deve a quem", "Despesas da casa", "Membros e acertos"]}
      title="Household"
    />
  );
}
