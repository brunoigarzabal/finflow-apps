import { useNavigate } from '@tanstack/react-router'

import { defineMutation } from '@/lib/react-query'
import { useAuthStore } from '@/store'

import { AUTH_MUTATION_KEYS } from '../config'
import { googleLogin } from '../endpoints'
import type { GoogleLoginBody } from '../types'

export const useGoogleLogin = () => {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated)
  const navigate = useNavigate()

  return defineMutation({
    mutationKey: AUTH_MUTATION_KEYS.google,
    mutationFn: (body: GoogleLoginBody) => googleLogin(body),
  })({
    onSuccess: () => {
      setAuthenticated(true)
      navigate({ to: '/' })
    },
  })
}
