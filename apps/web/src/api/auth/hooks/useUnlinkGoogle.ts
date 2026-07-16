import { useQueryClient } from '@tanstack/react-query'

import { defineMutation } from '@/lib/react-query'

import { AUTH_MUTATION_KEYS, AUTH_QUERY_KEYS } from '../config'
import { unlinkGoogle } from '../endpoints'

export const useUnlinkGoogle = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: AUTH_MUTATION_KEYS.unlinkGoogle,
    mutationFn: unlinkGoogle,
  })({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile })
    },
  })
}
