import { endOfMonth, format, startOfMonth } from 'date-fns'
import { useCallback, useState } from 'react'

import { MonthNavigator } from '@/components/common/MonthNavigator'

import { CategoryBreakdown } from './components/CategoryBreakdown'
import { InflowsOutflowsSection } from './components/InflowsOutflowsSection'
import { ReportTabs, type ReportTabId } from './components/ReportTabs'

export const ReportsPage = () => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [activeTab, setActiveTab] = useState<ReportTabId>('categories')

  const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd')

  const handleTabChange = useCallback((tab: ReportTabId) => {
    setActiveTab(tab)
  }, [])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <MonthNavigator
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
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
          <InflowsOutflowsSection startDate={startDate} endDate={endDate} />
        )}
      </div>
    </div>
  )
}
