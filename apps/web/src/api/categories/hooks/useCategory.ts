import { defineQuery } from '@/lib/react-query'

import { getCategory } from '../endpoints'

export const useCategory = (id: string) =>
  defineQuery({
    queryKey: ['categories', id],
    queryFn: () => getCategory(id),
  })()
