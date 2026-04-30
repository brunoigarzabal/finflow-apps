import { endOfMonth, format, startOfMonth } from 'date-fns'
import { useState } from 'react'

import { MonthNavigator } from '@/components/common/MonthNavigator'

import { CategoryBreakdown } from './components/CategoryBreakdown'

export const ReportsPage = () => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd')

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <MonthNavigator
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-card">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Categorias</h2>
        </div>
        <CategoryBreakdown startDate={startDate} endDate={endDate} />
      </div>
    </div>
  )
}
