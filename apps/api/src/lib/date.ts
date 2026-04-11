export function resolveDateRange(
  startDate?: string,
  endDate?: string,
): { startDate: Date; endDate: Date } {
  const now = new Date()
  return {
    startDate: startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1),
    endDate: endDate
      ? new Date(endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0),
  }
}

export function formatDateLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
