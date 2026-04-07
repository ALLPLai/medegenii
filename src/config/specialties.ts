export const SPECIALTIES = [
  { value: "generaliste", label: "Médecine Générale" },
  { value: "cardiologue", label: "Cardiologie" },
  { value: "dermatologue", label: "Dermatologie" },
  { value: "gastro", label: "Gastro-entérologie" },
  { value: "gyneco", label: "Gynécologie-Obstétrique" },
  { value: "neuro", label: "Neurologie" },
  { value: "ophtalmo", label: "Ophtalmologie" },
  { value: "orl", label: "ORL" },
  { value: "pediatre", label: "Pédiatrie" },
  { value: "pneumo", label: "Pneumologie" },
  { value: "psychiatre", label: "Psychiatrie" },
  { value: "radiologue", label: "Radiologie" },
  { value: "rhumato", label: "Rhumatologie" },
  { value: "uro", label: "Urologie" },
  { value: "chirurgie", label: "Chirurgie Générale" },
  { value: "endocrino", label: "Endocrinologie" },
  { value: "nephro", label: "Néphrologie" },
  { value: "onco", label: "Oncologie" },
  { value: "autre", label: "Autre spécialité" },
] as const

export type SpecialtyValue = (typeof SPECIALTIES)[number]["value"]

export function getSpecialtyLabel(value: string): string {
  const found = SPECIALTIES.find((s) => s.value === value)
  return found?.label ?? value
}
