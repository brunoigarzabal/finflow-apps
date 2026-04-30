function parseUTCDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function resolveDateRange(
  startDate?: string,
  endDate?: string,
): { startDate: Date; endDate: Date } {
  const now = new Date()
  return {
    startDate: startDate
      ? parseUTCDate(startDate)
      : new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)),
    endDate: endDate
      ? parseUTCDate(endDate)
      : new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0)),
  }
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export function addMonthsPreservingDay(date: Date, months: number): Date {
  const day = date.getUTCDate()
  const next = new Date(date)
  next.setUTCDate(1)
  next.setUTCMonth(next.getUTCMonth() + months)

  const lastDay = new Date(
    Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0),
  ).getUTCDate()
  next.setUTCDate(Math.min(day, lastDay))

  return next
}

export function formatDateLocal(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
