import { useNavigate } from '@tanstack/react-router'

import { defineMutation } from '@/lib/react-query'
import { useAuthStore } from '@/store'

import { AUTH_MUTATION_KEYS } from '../config'
import { login } from '../endpoints'
import type { LoginBody } from '../types'

export const useLogin = () => {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated)
  const navigate = useNavigate()

  return defineMutation({
    mutationKey: AUTH_MUTATION_KEYS.login,
    mutationFn: (body: LoginBody) => login(body),
  })({
    onSuccess: () => {
      setAuthenticated(true)
      navigate({ to: '/' })
    },
  })
}
