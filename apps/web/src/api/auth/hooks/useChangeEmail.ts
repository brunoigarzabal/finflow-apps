import { useQueryClient } from '@tanstack/react-query'

import { defineMutation } from '@/lib/react-query'

import { AUTH_MUTATION_KEYS, AUTH_QUERY_KEYS } from '../config'
import { changeEmail } from '../endpoints'

export const useChangeEmail = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: AUTH_MUTATION_KEYS.changeEmail,
    mutationFn: changeEmail,
  })({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile })
    },
  })
}
