import { useQueryClient } from '@tanstack/react-query'

import { defineMutation } from '@/lib/react-query'

import { CATEGORIES_MUTATION_KEYS, CATEGORIES_QUERY_KEYS } from '../config'
import { archiveCategory } from '../endpoints'

export const useArchiveCategory = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: CATEGORIES_MUTATION_KEYS.archive,
    mutationFn: archiveCategory,
  })({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.list })
      queryClient.invalidateQueries({
        queryKey: CATEGORIES_QUERY_KEYS.listArchived,
      })
    },
  })
}
