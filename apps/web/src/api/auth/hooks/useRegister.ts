import { useNavigate } from '@tanstack/react-router'

import { defineMutation } from '@/lib/react-query'
import { useAuthStore } from '@/store'

import { AUTH_MUTATION_KEYS } from '../config'
import { register } from '../endpoints'
import type { RegisterBody } from '../types'

export const useRegister = () => {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated)
  const navigate = useNavigate()

  return defineMutation({
    mutationKey: AUTH_MUTATION_KEYS.register,
    mutationFn: (body: RegisterBody) => register(body),
  })({
    onSuccess: () => {
      setAuthenticated(true)
      navigate({ to: '/' })
    },
  })
}
