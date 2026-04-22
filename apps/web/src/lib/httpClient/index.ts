import ky from 'ky'

import { API_URL } from '@/config/env'
import { queryClient } from '@/lib/react-query'
import { useAuthStore } from '@/store'

const base = ky.create({
  prefixUrl: API_URL,
  credentials: 'include',
})

export const httpClient = {
  authorized: () =>
    base.extend({
      hooks: {
        afterResponse: [
          (_request, _options, response) => {
            if (response.status === 401) {
              queryClient.clear()
              useAuthStore.getState().setAuthenticated(false)
              window.location.href = '/sign-in'
            }
          },
        ],
      },
    }),

  unauthorized: () => base,
}
