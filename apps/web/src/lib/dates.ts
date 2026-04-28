import { addMonths, endOfMonth, format, startOfMonth } from 'date-fns'

export const monthRange = (endMonthOffset = 0) => {
  const now = new Date()
  return {
    startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(addMonths(now, endMonthOffset)), 'yyyy-MM-dd'),
  }
}

export const currentMonthRange = () => monthRange(0)

export const currentAndNextMonthRange = () => monthRange(1)

export const today = () => format(new Date(), 'yyyy-MM-dd')

export const formatShortDate = (dateStr: string) => {
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number)
  return format(new Date(year, month - 1, day), 'dd/MM')
}
