const LABELS: Record<string, string> = {
  CHECKING: 'Conta corrente',
  SAVINGS: 'Poupança',
  CASH: 'Dinheiro',
  OTHER: 'Outro',
}

export const formatAccountType = (type: string): string => LABELS[type] ?? type
