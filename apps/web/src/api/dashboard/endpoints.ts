import { httpClient } from '@/lib/httpClient'

import { DASHBOARD_ENDPOINTS } from './config'
import type { DashboardData } from './types'

export const getDashboard = (
  bankAccountId?: string
): Promise<DashboardData> => {
  const searchParams = bankAccountId ? { bankAccountId } : undefined
  return httpClient
    .authorized()
    .get(
      DASHBOARD_ENDPOINTS.detail,
      searchParams ? { searchParams } : undefined
    )
    .json<DashboardData>()
}
