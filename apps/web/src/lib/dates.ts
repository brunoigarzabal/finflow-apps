import { endOfMonth, format, startOfMonth } from 'date-fns'

export const currentMonthRange = () => ({
  startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
})

export const today = () => format(new Date(), 'yyyy-MM-dd')
