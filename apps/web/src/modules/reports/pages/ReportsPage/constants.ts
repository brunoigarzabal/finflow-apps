export type ReportPeriod = 'today' | 'month' | 'year'
export type ViewMode = 'daily' | 'weekly' | 'monthly' | 'accumulated'

export const VALID_VIEW_MODES: Record<ReportPeriod, ViewMode[]> = {
  today: ['daily', 'accumulated'],
  month: ['daily', 'weekly', 'accumulated'],
  year: ['monthly', 'accumulated'],
}

export const DEFAULT_VIEW_MODE: Record<ReportPeriod, ViewMode> = {
  today: 'daily',
  month: 'daily',
  year: 'monthly',
}

export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  daily: 'diário',
  weekly: 'semanal',
  monthly: 'mensal',
  accumulated: 'acumulado',
}

export const PERIOD_LABELS: Record<ReportPeriod, string> = {
  today: 'Hoje',
  month: 'Este mês',
  year: 'Este ano',
}

export const ALL_VIEW_MODES: ViewMode[] = [
  'daily',
  'weekly',
  'monthly',
  'accumulated',
]
