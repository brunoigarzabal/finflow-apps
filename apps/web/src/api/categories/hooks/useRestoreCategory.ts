import { useQueryClient } from '@tanstack/react-query'

import { defineMutation } from '@/lib/react-query'

import { CATEGORIES_MUTATION_KEYS, CATEGORIES_QUERY_KEYS } from '../config'
import { restoreCategory } from '../endpoints'

export const useRestoreCategory = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: CATEGORIES_MUTATION_KEYS.restore,
    mutationFn: restoreCategory,
  })({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.list })
      queryClient.invalidateQueries({
        queryKey: CATEGORIES_QUERY_KEYS.listArchived,
      })
    },
  })
}
