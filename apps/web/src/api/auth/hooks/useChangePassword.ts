import { useQueryClient } from '@tanstack/react-query'

import { defineMutation } from '@/lib/react-query'

import { AUTH_MUTATION_KEYS, AUTH_QUERY_KEYS } from '../config'
import { changePassword } from '../endpoints'

export const useChangePassword = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: AUTH_MUTATION_KEYS.changePassword,
    mutationFn: changePassword,
  })({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile })
    },
  })
}
