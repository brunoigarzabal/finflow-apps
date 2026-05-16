import {
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useCallback, useState } from 'react'

import { CategoryBreakdown } from './components/CategoryBreakdown'
import { InflowsOutflowsSection } from './components/InflowsOutflowsSection'
import { PeriodSelector } from './components/PeriodSelector'
import { ReportTabs, type ReportTabId } from './components/ReportTabs'
import { ViewModeSwitch } from './components/ViewModeSwitch'
import {
  DEFAULT_VIEW_MODE,
  type ReportPeriod,
  type ViewMode,
} from './constants'

const computeDateRange = (
  period: ReportPeriod,
  referenceDate: Date
): { startDate: string; endDate: string } => {
  switch (period) {
    case 'today': {
      const day = format(referenceDate, 'yyyy-MM-dd')
      return { startDate: day, endDate: day }
    }
    case 'month':
      return {
        startDate: format(startOfMonth(referenceDate), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(referenceDate), 'yyyy-MM-dd'),
      }
    case 'year':
      return {
        startDate: format(startOfYear(referenceDate), 'yyyy-MM-dd'),
        endDate: format(endOfYear(referenceDate), 'yyyy-MM-dd'),
      }
  }
}

const getPeriodLabel = (period: ReportPeriod, referenceDate: Date): string => {
  switch (period) {
    case 'today':
      return format(referenceDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    case 'month':
      return format(referenceDate, "MMM 'de' yyyy", { locale: ptBR })
    case 'year':
      return format(referenceDate, 'yyyy')
  }
}

export const ReportsPage = () => {
  const [period, setPeriod] = useState<ReportPeriod>('month')
  const [referenceDate, setReferenceDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('daily')
  const [activeTab, setActiveTab] = useState<ReportTabId>('categories')

  const { startDate, endDate } = computeDateRange(period, referenceDate)
  const periodLabel = getPeriodLabel(period, referenceDate)

  const handlePeriodChange = useCallback((newPeriod: ReportPeriod) => {
    setPeriod(newPeriod)
    setViewMode(DEFAULT_VIEW_MODE[newPeriod])
  }, [])

  const handleTabChange = useCallback((tab: ReportTabId) => {
    setActiveTab(tab)
  }, [])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <PeriodSelector
          period={period}
          referenceDate={referenceDate}
          onPeriodChange={handlePeriodChange}
          onReferenceDateChange={setReferenceDate}
        />
      </div>

      <ReportTabs value={activeTab} onChange={handleTabChange} />

      <div className="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-card">
        {activeTab === 'categories' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Categorias</h2>
            <CategoryBreakdown startDate={startDate} endDate={endDate} />
          </div>
        )}
        {activeTab === 'inflows-outflows' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Entradas x Saídas</h2>
              <ViewModeSwitch
                period={period}
                value={viewMode}
                onChange={setViewMode}
              />
            </div>
            <InflowsOutflowsSection
              startDate={startDate}
              endDate={endDate}
              viewMode={viewMode}
              periodLabel={periodLabel}
            />
          </div>
        )}
      </div>
    </div>
  )
}
