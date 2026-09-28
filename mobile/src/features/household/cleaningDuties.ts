import type { HouseholdCleaningDuty } from "@/types/household";

const dutyCopy: Record<string, { label: string; instruction: string }> = {
  shower_room: { label: "Limpar o banheiro com chuveiro", instruction: "Esfregue e enxágue o chuveiro; depois limpe o box, as torneiras e o piso ao redor." },
  toilet_wc: { label: "Limpar o lavabo / vaso sanitário", instruction: "Limpe o vaso, a pia e os pontos de contato; finalize limpando os respingos no chão." },
  upstairs_hallway: { label: "Aspirar o corredor de cima", instruction: "Aspire todo o corredor, incluindo cantos e bordas." },
  stairs: { label: "Aspirar as escadas", instruction: "Aspire todos os degraus e o patamar, de cima para baixo." },
  downstairs_hallway: { label: "Aspirar o corredor de baixo", instruction: "Aspire todo o corredor, incluindo cantos e bordas." },
  living_room: { label: "Limpar a sala", instruction: "Organize as superfícies compartilhadas, aspire o chão e deixe a sala em ordem." },
  tea_towels: { label: "Lavar panos de prato", instruction: "Lave os panos de prato usados e deixe-os totalmente secos para o próximo uso." },
  cleaning_cloths: { label: "Lavar panos de limpeza", instruction: "Lave os panos reutilizáveis e deixe-os prontos para a próxima limpeza." },
  all_bins: { label: "Esvaziar todas as lixeiras", instruction: "Esvazie as lixeiras internas e troque os sacos quando necessário." },
  rubbish_out: { label: "Colocar o lixo para fora", instruction: "Leve o lixo da casa ao ponto de coleta na quarta-feira à noite." },
};

export function cleaningDutyCopy(duty: HouseholdCleaningDuty) {
  return {
    label: dutyCopy[duty.key]?.label ?? duty.label,
    instruction: dutyCopy[duty.key]?.instruction,
    schedule: duty.schedule === "Every Wednesday evening" ? "Quarta-feira à noite" : duty.schedule,
  };
}

export const cleaningDutyPreview: HouseholdCleaningDuty[] = Object.entries(dutyCopy).map(([key, copy]) => ({
  key,
  label: copy.label,
  schedule: key === "rubbish_out" ? "Quarta-feira à noite" : null,
  completed: false,
  canToggle: false,
  completedAt: null,
}));
