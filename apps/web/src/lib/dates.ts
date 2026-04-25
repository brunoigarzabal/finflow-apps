import { addMonths, endOfMonth, format, parseISO, startOfMonth } from 'date-fns'

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
  const date = parseISO(dateStr)
  return format(date, 'dd/MM')
}
