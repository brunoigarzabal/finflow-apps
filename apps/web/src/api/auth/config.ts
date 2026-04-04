import { defineQueryKey, defineMutationKey } from '@/lib/react-query'

export const AUTH_ENDPOINTS = {
  login: 'auth/login',
  register: 'auth/register',
  google: 'auth/google',
  profile: 'auth/profile',
  logout: 'auth/logout',
} as const

export const AUTH_QUERY_KEYS = defineQueryKey({
  profile: ['auth', 'profile'],
})

export const AUTH_MUTATION_KEYS = defineMutationKey({
  login: ['auth', 'login'],
  register: ['auth', 'register'],
  google: ['auth', 'google'],
  logout: ['auth', 'logout'],
})
