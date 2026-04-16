import { useQueryClient } from '@tanstack/react-query'

import { defineMutation } from '@/lib/react-query'

import { CATEGORIES_MUTATION_KEYS, CATEGORIES_QUERY_KEYS } from '../config'
import { updateCategory } from '../endpoints'
import type { UpdateCategoryBody } from '../types'

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: CATEGORIES_MUTATION_KEYS.update,
    mutationFn: ({ id, body }: { id: string; body: UpdateCategoryBody }) =>
      updateCategory(id, body),
  })({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.list })
    },
  })
}
