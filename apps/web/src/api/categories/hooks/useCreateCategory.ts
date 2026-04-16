import { useQueryClient } from '@tanstack/react-query'

import { defineMutation } from '@/lib/react-query'

import { CATEGORIES_MUTATION_KEYS, CATEGORIES_QUERY_KEYS } from '../config'
import { createCategory } from '../endpoints'

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: CATEGORIES_MUTATION_KEYS.create,
    mutationFn: createCategory,
  })({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.list })
    },
  })
}
