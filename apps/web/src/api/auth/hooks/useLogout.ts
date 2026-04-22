import { useNavigate } from '@tanstack/react-router'

import { defineMutation, queryClient } from '@/lib/react-query'
import { useAuthStore } from '@/store'

import { AUTH_MUTATION_KEYS } from '../config'
import { logout } from '../endpoints'

export const useLogout = () => {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated)
  const navigate = useNavigate()

  return defineMutation({
    mutationKey: AUTH_MUTATION_KEYS.logout,
    mutationFn: logout,
  })({
    onSuccess: () => {
      queryClient.clear()
      setAuthenticated(false)
      navigate({ to: '/sign-in' })
    },
  })
}
