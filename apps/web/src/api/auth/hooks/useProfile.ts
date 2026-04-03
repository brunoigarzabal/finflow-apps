import { defineQuery } from '@/lib/react-query'
import { useAuthStore } from '@/store'

import { AUTH_QUERY_KEYS } from '../config'
import { getProfile } from '../endpoints'

export const useProfile = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return defineQuery({
    queryKey: AUTH_QUERY_KEYS.profile,
    queryFn: getProfile,
  })({
    enabled: isAuthenticated,
  })
}
